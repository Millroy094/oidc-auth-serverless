import { AxiosResponse } from 'axios';
import axios from '@/utils/axios-instance';
import {
  AuthenticateCredentialsArgs,
  EmailVerificationRequiredResponse,
  MfaRequiredResponse,
} from '@/api/shared/auth-types';

type validateCredentialsArgs = AuthenticateCredentialsArgs & {
  interactionId: string;
};

interface LoginSuccessResponse {
  challengeName: 'LOGIN_SUCCESS';
  redirect: string;
  message: string;
}

interface RedirectOnlyResponse {
  redirect: string;
  message?: string;
}

export type AuthenticateInteractionResponseData =
  | EmailVerificationRequiredResponse
  | MfaRequiredResponse
  | LoginSuccessResponse
  | RedirectOnlyResponse;

const authenticateInteraction = async (
  args: validateCredentialsArgs,
): Promise<AxiosResponse<AuthenticateInteractionResponseData>> => {
  const {
    email,
    password,
    otp,
    loginWithRecoveryCode,
    recoveryCode,
    resetMfa,
    interactionId,
    captchaToken,
  } = args;
  const response = await axios.post<AuthenticateInteractionResponseData>(
    `/api/oidc/interaction/${interactionId}/authenticate`,
    {
      email,
      password,
      otp,
      loginWithRecoveryCode,
      recoveryCode,
      resetMfa,
      captchaToken,
    },
    { withCredentials: true },
  );
  return response;
};

export default authenticateInteraction;
