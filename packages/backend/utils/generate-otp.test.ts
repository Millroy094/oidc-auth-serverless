import generateOtp from './generate-otp';

describe('generateOtp', () => {
  it('should return a string', () => {
    const otp = generateOtp();
    expect(typeof otp).toBe('string');
  });

  it('should return a six-digit string', () => {
    const otp = generateOtp();
    expect(otp.length).toBe(6);
  });

  it('should return a number between 100000 and 999999', () => {
    const otp = generateOtp();
    const otpNumber = parseInt(otp, 10);
    expect(otpNumber).toBeGreaterThanOrEqual(100000);
    expect(otpNumber).toBeLessThanOrEqual(999999);
  });

  it('should generate different OTPs on successive calls', () => {
    const otp1 = generateOtp();
    const otp2 = generateOtp();
    expect(otp1).not.toEqual(otp2);
  });
});
