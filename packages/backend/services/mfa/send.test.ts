import { sendEmailOtp, sendSMSOtp } from './send.ts';
import User from '../../models/User.ts';
import OTPService from '../otp.ts';
import { sendEmail, sendSMS } from '../../utils/notification.ts';

jest.mock('../../models/User.ts');
jest.mock('../otp.ts');
jest.mock('../../utils/notification.ts');

describe('OTP Service', () => {
  const userId = 'user-123';
  const subscriberEmail = 'test@example.com';
  const subscriberPhone = '+1234567890';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should send email OTP successfully', async () => {
    (User.get as jest.Mock).mockResolvedValue({ userId });
    await sendEmailOtp(userId, subscriberEmail);

    expect(OTPService.storeOtp).toHaveBeenCalledWith(
      userId,
      'email',
      expect.any(String),
    );
    expect(sendEmail).toHaveBeenCalledWith(
      subscriberEmail,
      'Login OTP',
      expect.stringContaining("Here's your OTP"),
    );
  });

  it('should throw an error if user does not exist', async () => {
    (User.get as jest.Mock).mockResolvedValue(null);

    await expect(sendEmailOtp(userId, subscriberEmail)).rejects.toThrow(
      'User does not exist',
    );
  });

  it('should send SMS OTP successfully', async () => {
    (User.get as jest.Mock).mockResolvedValue({ userId });
    await sendSMSOtp(userId, subscriberPhone);

    expect(OTPService.storeOtp).toHaveBeenCalledWith(
      userId,
      'sms',
      expect.any(String),
    );
    expect(sendSMS).toHaveBeenCalledWith(
      subscriberPhone,
      expect.stringContaining("Here's your OTP"),
    );
  });

  it('should throw an error if user does not exist for SMS', async () => {
    (User.get as jest.Mock).mockResolvedValue(null);

    await expect(sendSMSOtp(userId, subscriberPhone)).rejects.toThrow(
      'User does not exist',
    );
  });
});
