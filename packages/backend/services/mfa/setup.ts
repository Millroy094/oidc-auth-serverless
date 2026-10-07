import { Secret, TOTP } from 'otpauth';
import User from '../../models/User.ts';
import config from '../../support/env-config.ts';
import { sendEmailOtp, sendSMSOtp } from './send.ts';

export const setupAppMFA = async (
  userId: string,
  subscriber: string,
): Promise<{ uri: string }> => {
  const user = await User.get(userId);

  if (!user) {
    throw new Error('User does not exist');
  }

  const secret = new Secret({ size: 20 });

  const totp = new TOTP({
    issuer: config.get('authentication.issuer'),
    label: `${user.email} (${config.get('authentication.issuer')})`,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret,
  });

  user.mfa.app.secret = secret.base32;
  user.mfa.app.subscriber = subscriber;
  await user.save();

  const uri = totp.toString();

  return { uri };
};

export const setupSMSMFA = async (
  userId: string,
  subscriber: string,
): Promise<void> => {
  const user = await User.get(userId);

  if (!user) {
    throw new Error('User does not exist');
  }

  await sendSMSOtp(userId, subscriber, 'setup');

  user.mfa.sms.subscriber = subscriber;
  await user.save();
};

export const setupEmailMFA = async (
  userId: string,
  subscriber: string,
): Promise<void> => {
  const user = await User.get(userId);

  if (!user) {
    throw new Error('User does not exist');
  }
  await sendEmailOtp(userId, subscriber, 'setup');

  user.mfa.email.subscriber = subscriber;
  await user.save();
};
