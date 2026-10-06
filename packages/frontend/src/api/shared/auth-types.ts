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

export interface PasswordStageArgs {
  email: string;
  password: string;
  captchaToken: string;
  stage: 'PASSWORD';
}

export interface MfaStageArgs {
  email: string;
  otp: string;
  stage: 'MFA';
}

export interface RecoveryCodeStageArgs {
  email: string;
  recoveryCode: string;
  resetMfa?: boolean;
  stage: 'RECOVERY_CODE';
}

export interface PasskeyStageArgs {
  email: string;
  stage: 'PASSKEY';
}

export type AuthenticateCredentialsArgs =
  PasswordStageArgs | MfaStageArgs | RecoveryCodeStageArgs | PasskeyStageArgs;
