export interface EmailVerificationRequiredResponse {
  challengeName: 'EMAIL_VERIFICATION_REQUIRED';
  challengeParameters: {
    userId: string;
    email: string;
  };
}

export interface MfaRequiredResponse {
  challengeName: 'MFA_REQUIRED';
  challengeParameters: {
    mfaType: string;
    userId: string;
    email: string;
  };
}

export interface AuthenticateCredentialsArgs {
  email: string;
  password: string;
  otp?: string;
  loginWithRecoveryCode?: boolean;
  recoveryCode?: string;
  resetMfa?: boolean;
  captchaToken: string;
}
