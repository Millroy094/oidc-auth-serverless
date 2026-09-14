export interface IForgotPasswordFormInput {
  email: string;
  emailSent: boolean;
  otp?: string;
  password?: string;
  confirmPassword?: string;
}
