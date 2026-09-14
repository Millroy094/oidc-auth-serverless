import OTPService from '../services/otp.ts';
import OTP from '../models/OTP.ts';

jest.mock('../models/OTP');

describe('OTPService', () => {
  const userId = 'user123';
  const otpData = {
    userId,
    type: 'sms',
    otp: '123456',
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    delete: jest.fn(),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('storeOtp', () => {
    it('should store OTP with an expiration time of 5 minutes', async () => {
      (OTP.create as jest.Mock).mockResolvedValue(otpData);

      await OTPService.storeOtp(userId, 'sms', '123456');
      expect(OTP.create).toHaveBeenCalledWith({
        userId,
        type: 'sms',
        otp: '123456',
        expiresAt: Math.floor(Date.now() / 1000) + 300,
      });
    });
  });

  describe('validateOtp', () => {
    it('should return true for a valid OTP and delete it', async () => {
      (OTP.scan as jest.Mock).mockReturnValue({
        eq: jest.fn().mockReturnThis(),
        and: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([otpData]),
      });

      otpData.delete = jest.fn().mockResolvedValue(true);

      const result = await OTPService.validateOtp(userId, 'sms', '123456');
      expect(result).toBe(true);
      expect(OTP.scan).toHaveBeenCalled();
      expect(otpData.delete).toHaveBeenCalled();
    });

    it('should return false for an invalid OTP', async () => {
      (OTP.scan as jest.Mock).mockReturnValue({
        eq: jest.fn().mockReturnThis(),
        and: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      });

      const result = await OTPService.validateOtp(userId, 'sms', 'wrongOTP');
      expect(result).toBe(false);
      expect(OTP.scan).toHaveBeenCalled();
    });

    it('should return false if OTP is expired', async () => {
      const expiredOtpData = {
        ...otpData,
        expiresAt: new Date(Date.now() - 1000),
      };

      (OTP.scan as jest.Mock).mockReturnValue({
        eq: jest.fn().mockReturnThis(),
        and: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([expiredOtpData]),
      });

      const result = await OTPService.validateOtp(userId, 'sms', '123456');
      expect(result).toBe(false);
      expect(OTP.scan).toHaveBeenCalled();
    });
  });
});
