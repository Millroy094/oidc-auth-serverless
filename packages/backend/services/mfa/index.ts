import omit from 'lodash/omit.js';
import map from 'lodash/map.js';
import filter from 'lodash/filter.js';
import isEmpty from 'lodash/isEmpty.js';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import User from '../../models/User.ts';
import { setupAppMFA, setupEmailMFA, setupSMSMFA } from './setup.ts';
import { verifyAppMFA, verifyEmailMFA, verifySMSMFA } from './verify.ts';
import { sendEmailOtp, sendSMSOtp } from './send.ts';

class MFAService {
  public static async getMFASetting(userId: string): Promise<{
    types: { subscriber: string; verified: boolean }[];
    preference: string;
    recoveryCodeCount: number;
  }> {
    const userAccountMfaSetting = await User.get(userId, {
      attributes: ['mfa'],
    });

    if (isEmpty(userAccountMfaSetting)) {
      throw new Error('User does not exists');
    }

    return {
      types: filter(
        map(
          omit(userAccountMfaSetting.mfa, ['preference', 'recoveryCodes']),
          ({ subscriber, verified }, type) => ({ type, subscriber, verified }),
        ),
        ({ type }) => type !== 'passkey',
      ),
      preference: userAccountMfaSetting.mfa.preference,
      recoveryCodeCount: userAccountMfaSetting.mfa.recoveryCodes?.length ?? 0,
    };
  }

  public static async setupMFA(
    userId: string,
    type: 'app' | 'sms' | 'email',
    subscriber: string,
  ): Promise<void | {
    uri: string;
  }> {
    const setup = { app: setupAppMFA, sms: setupSMSMFA, email: setupEmailMFA };
    const response = await setup[type](userId, subscriber);
    return response;
  }

  public static async verifyMFA(
    userId: string,
    type: 'app' | 'sms' | 'email',
    otp: string,
  ): Promise<void> {
    const verify = {
      app: verifyAppMFA,
      sms: verifySMSMFA,
      email: verifyEmailMFA,
    };
    await verify[type](userId, otp);
  }

  public static async resetMFAByType(
    userId: string,
    type: 'app' | 'sms' | 'email',
  ): Promise<void> {
    const user = await User.get(userId);

    if (!user) {
      throw new Error('User does not exist');
    }

    user.mfa[type].subscriber = '';
    user.mfa[type].verified = false;

    if (user.mfa.preference === type) {
      user.mfa.preference = '';
    }

    if (type === 'app') {
      user.mfa[type].secret = '';
    }

    await user.save();
  }

  public static async resetMFA(userId: string): Promise<void> {
    const user = await User.get(userId);

    if (!user) {
      throw new Error('User does not exist');
    }

    user.mfa.preference = '';
    user.mfa.app = {
      secret: '',
      subscriber: '',
      verified: false,
    };
    user.mfa.sms = {
      subscriber: '',
      verified: false,
    };

    user.mfa.email = {
      subscriber: '',
      verified: false,
    };

    user.mfa.passkey = {
      credentials: [],
      verified: false,
    };

    await user.save();
  }

  public static async changePreference(
    userId: string,
    preference: 'app' | 'sms' | 'email',
  ): Promise<void> {
    const user = await User.get(userId);

    if (!user) {
      throw new Error('User does not exist');
    }

    user.mfa.preference = preference;

    await user.save();
  }

  public static async sendOtp(
    email: string,
    type: 'sms' | 'email',
  ): Promise<void> {
    const sendOtp = {
      sms: sendSMSOtp,
      email: sendEmailOtp,
    };

    const [user] = await User.scan('email').eq(email).exec();

    if (!user) {
      throw new Error('User does not exist');
    }

    if (!user.mfa[type].subscriber) {
      throw new Error('User MFA method does not have a subscriber set');
    }

    await sendOtp[type](user.userId, user.mfa[type].subscriber);
  }

  public static async generateRecoveryCodes(userId: string): Promise<string[]> {
    const user = await User.get(userId);

    if (!user) {
      throw new Error('User does not exist');
    }

    const recoveryCodes = Array.from({ length: 10 }, (_, i) => i).map(() =>
      uuid(),
    );

    user.mfa.recoveryCodes = await Promise.all(
      recoveryCodes.map(async (recoveryCode) => {
        const salt = await bcrypt.genSalt(10);
        const encryptedRecoveryCode = await bcrypt.hash(recoveryCode, salt);
        return encryptedRecoveryCode;
      }),
    );

    await user.save();

    return recoveryCodes;
  }

  public static async validateRecoveryCode(
    userId: string,
    recoveryCode: string,
    resetMFA: boolean,
  ): Promise<void> {
    const user = await User.get(userId);

    if (!user) {
      throw new Error('User does not exist');
    }

    if (isEmpty(user.mfa.recoveryCodes)) {
      throw new Error('No Recovery codes found');
    }

    let matchedRecoveryCode: string | null = null;

    for (const hashedRecoveryCode of user.mfa.recoveryCodes) {
      const match = await bcrypt.compare(recoveryCode, hashedRecoveryCode);

      if (match) {
        matchedRecoveryCode = hashedRecoveryCode;
      }
    }

    if (!matchedRecoveryCode) {
      throw new Error('Invalid recovery code');
    }

    user.mfa.recoveryCodes = user.mfa.recoveryCodes.filter(
      (code: string) => code !== matchedRecoveryCode,
    );

    if (resetMFA) {
      user.mfa.preference = '';
      user.mfa.app = {
        secret: '',
        subscriber: '',
        verified: false,
      };
      user.mfa.sms = {
        subscriber: '',
        verified: false,
      };

      user.mfa.email = {
        subscriber: '',
        verified: false,
      };

      user.mfa.passkey = {
        credentials: [],
        verified: false,
      };
    }

    await user.save();
  }
}

export default MFAService;
