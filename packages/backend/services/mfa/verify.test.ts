import { verifyAppMFA } from './verify.ts';
import User from '../../models/User.ts';
import { TOTP } from 'otpauth';

jest.mock('../../models/User.ts');
jest.mock('../otp.ts');

describe('verifyAppMFA', () => {
  const userId = 'user-123';
  const validOtp = '123456';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should verify the OTP successfully', async () => {
    const user = {
      userId,
      mfa: { app: { secret: 'secretKey', verified: false }, preference: null },
      save: jest.fn(),
    };

    (User.get as jest.Mock).mockResolvedValue(user);

    const totp = new TOTP({
      issuer: 'example.com',
      label: 'example.com',
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: 'secretKey',
    });

    jest.spyOn(TOTP.prototype, 'validate').mockReturnValue(0);

    await verifyAppMFA(userId, validOtp);

    expect(user.mfa.app.verified).toBe(true);
    expect(user.mfa.preference).toBe('app');
    expect(user.save).toHaveBeenCalled();
  });

  it('should throw an error if user does not exist', async () => {
    (User.get as jest.Mock).mockResolvedValue(null);

    await expect(verifyAppMFA(userId, validOtp)).rejects.toThrow(
      'User does not exist',
    );
  });

  it('should throw an error for invalid OTP', async () => {
    const user = {
      userId,
      mfa: { app: { secret: 'secretKey', verified: false }, preference: null },
      save: jest.fn(),
    };

    (User.get as jest.Mock).mockResolvedValue(user);

    const totp = new TOTP({
      issuer: 'example.com',
      label: 'example.com',
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: 'secretKey',
    });

    jest.spyOn(totp, 'validate').mockReturnValue(null);

    await expect(verifyAppMFA(userId, validOtp)).rejects.toThrow('Invalid OTP');
  });
});
