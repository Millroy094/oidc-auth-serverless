import MFAService from './mfa/index.ts';
import UserService from './user.ts';
import { UserItem } from '../models/User.ts';
import {
  ChallengeResponseUser,
  requiresEmailVerification,
  requiresMfa,
} from '../utils/auth-helper.ts';

export type LoginBody = {
  email: string;
  password?: string;
  otp?: string;
  recoveryCode?: string;
  resetMfa?: boolean;
  stage: 'PASSWORD' | 'MFA' | 'RECOVERY_CODE';
};

export class AuthenticationService {
  static async authenticateByStage(
    body: LoginBody,
    onSuccess: (user: ChallengeResponseUser) => Promise<void>,
  ): Promise<void> {
    if (body.stage === 'PASSWORD') {
      const user = await UserService.validateUserCredentials(
        body.email,
        body.password!,
      );

      if (requiresEmailVerification(user, undefined)) {
        throw new Error('EMAIL_VERIFICATION_REQUIRED');
      }

      if (requiresMfa(user, undefined, false)) {
        throw new Error('MFA_REQUIRED');
      }

      await UserService.resetFailedLogins(user);
      await onSuccess(user);
      return;
    }

    if (body.stage === 'MFA' || body.stage === 'RECOVERY_CODE') {
      const user = await UserService.getUserByEmail(body.email);

      if (user.suspended) {
        throw new Error('User is suspended');
      }

      await this.verifyChallenge(user, body);
      await onSuccess(user);
      return;
    }

    throw new Error('Invalid login stage');
  }

  private static async verifyChallenge(
    user: UserItem,
    body: LoginBody,
  ): Promise<void> {
    try {
      if (body.stage === 'MFA') {
        if (!user.emailVerified) {
          await UserService.verifyEmail(user.userId, body.otp!);
        }

        if (user.mfa.preference) {
          await MFAService.verifyMFA(
            user.userId,
            user.mfa.preference as 'app' | 'sms' | 'email',
            body.otp!,
          );
        }
      } else {
        await MFAService.validateRecoveryCode(
          user.userId,
          body.recoveryCode!,
          body.resetMfa ?? false,
        );
      }
    } catch (err) {
      await UserService.recordFailedLogin(user);
      throw err;
    }

    await UserService.resetFailedLogins(user);
  }

  static getErrorMessage(errorMessage: string): string {
    if (errorMessage === 'EMAIL_VERIFICATION_REQUIRED') {
      return 'Invalid verification code';
    }

    if (errorMessage === 'MFA_REQUIRED') {
      return 'Invalid verification code';
    }

    if (errorMessage === 'User not found') {
      return 'Invalid email or password';
    }

    if (
      errorMessage.includes('OTP') ||
      errorMessage.includes('verification') ||
      errorMessage.includes('recovery')
    ) {
      return 'Invalid verification code';
    }

    return 'Invalid email or password';
  }
}
