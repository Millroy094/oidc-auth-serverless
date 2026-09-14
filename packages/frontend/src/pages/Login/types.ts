export interface ILoginFormInput {
  email: string;
  password: string;
  mfaType?: string;
  otp?: string;
  loginWithRecoveryCode: boolean;
  recoveryCode?: string;
  resetMfa?: boolean;
}
