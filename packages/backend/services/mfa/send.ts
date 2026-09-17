import User from '../../models/User.ts';
import generateOtp from '../../utils/generate-otp.ts';
import { sendEmail, sendSMS } from '../../utils/notification.ts';
import OTPService from '../otp.ts';

type OtpPurpose = 'login' | 'setup';

const purposeMessage: Record<OtpPurpose, string> = {
  login: 'to login',
  setup: 'to verify and complete MFA setup',
};

export const sendEmailOtp = async (
  userId: string,
  subscriber: string,
  purpose: OtpPurpose = 'login',
): Promise<void> => {
  const user = await User.get(userId);

  if (!user) {
    throw new Error('User does not exist');
  }

  const otp = generateOtp();
  await OTPService.storeOtp(userId, 'email', otp);
  await sendEmail(
    subscriber,
    purpose === 'setup' ? 'MFA setup OTP' : 'Login OTP',
    `Here's your OTP ${otp} ${purposeMessage[purpose]}`,
  );
};

export const sendSMSOtp = async (
  userId: string,
  subscriber: string,
  purpose: OtpPurpose = 'login',
): Promise<void> => {
  const user = await User.get(userId);

  if (!user) {
    throw new Error('User does not exist');
  }

  const otp = generateOtp();
  await OTPService.storeOtp(userId, 'sms', otp);
  await sendSMS(
    subscriber,
    `Here's your OTP ${otp} ${purposeMessage[purpose]}`,
  );
};
