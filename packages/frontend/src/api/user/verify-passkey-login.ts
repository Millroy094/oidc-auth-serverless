import { AxiosResponse } from 'axios';
import axios from '@/utils/axios-instance';

type loginPasskeyVerificationArgs = {
  email: string;
  credential: unknown;
};

export interface IAuthenticatedUser {
  userId: string;
  email: string;
  roles: string[];
}

interface LoginSuccessResponse {
  challengeName: 'LOGIN_SUCCESS';
  user: IAuthenticatedUser;
  message: string;
}

interface VerificationFailedResponse {
  verified: false;
}

type VerifyPasskeyLoginResponseData =
  LoginSuccessResponse | VerificationFailedResponse;

const verifyPasskeyLogin = async (
  args: loginPasskeyVerificationArgs,
): Promise<AxiosResponse<VerifyPasskeyLoginResponseData>> => {
  const { email, credential } = args;
  const response = await axios.post<VerifyPasskeyLoginResponseData>(
    '/api/user/verify-passkey-login',
    {
      email,
      credential,
    },
    { withCredentials: true },
  );

  return response;
};

export default verifyPasskeyLogin;
