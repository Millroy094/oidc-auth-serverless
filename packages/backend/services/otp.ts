import isEmpty from 'lodash/isEmpty.js';
import OTP from '../models/OTP.ts';

class OTPService {
  public static async storeOtp(
    userId: string,
    type: 'app' | 'sms' | 'email',
    otp: string,
  ): Promise<void> {
    await OTP.create({
      userId,
      type,
      otp,
      expiresAt: Math.floor(Date.now() / 1000) + 300,
    });
  }

  public static async validateOtp(
    userId: string,
    type: 'sms' | 'email',
    otp: string,
  ): Promise<boolean> {
    let isValid = false;
    const [otpResult] = await OTP.scan('userId')
      .eq(userId)
      .and()
      .where('type')
      .eq(type)
      .and()
      .where('otp')
      .eq(otp)
      .exec();
    if (!isEmpty(otpResult)) {
      isValid =
        otpResult.expiresAt && Date.now() <= otpResult.expiresAt.getTime();
      await otpResult.delete();
    }
    return isValid;
  }
}

export default OTPService;
