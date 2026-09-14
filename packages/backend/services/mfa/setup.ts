import { v4 as uuid } from 'uuid';
import { Secret, TOTP } from 'otpauth';
import User from '../../models/User.ts';
import { sendEmailOtp, sendSMSOtp } from './send.ts';
import config from '../../support/env-config.ts';

export const setupAppMFA = async (
  userId: string,
  subscriber: string,
): Promise<{ uri: string }> => {
  const user = await User.get(userId);

  if (!user) {
    throw new Error('User does not exist');
  }

  const secret = uuid();

  const totp = new TOTP({
    issuer: config.get('authentication.issuer'),
    label: config.get('authentication.issuer'),
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: Secret.fromUTF8(secret),
  });

  user.mfa.app.secret = secret;
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

  await sendSMSOtp(userId, subscriber);

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
  await sendEmailOtp(userId, subscriber);

  user.mfa.email.subscriber = subscriber;
  await user.save();
};
