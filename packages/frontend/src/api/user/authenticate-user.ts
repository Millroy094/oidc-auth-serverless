import { AxiosResponse } from 'axios';
import axios from '@/utils/axios-instance';
import {
  AuthenticateCredentialsArgs,
  EmailVerificationRequiredResponse,
  MfaRequiredResponse,
} from '@/api/shared/auth-types';

type AuthenticateUserArgs = AuthenticateCredentialsArgs;

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

export type AuthenticateUserResponseData =
  | EmailVerificationRequiredResponse
  | MfaRequiredResponse
  | LoginSuccessResponse;

const authenticateUser = async (
  args: AuthenticateUserArgs,
): Promise<AxiosResponse<AuthenticateUserResponseData>> => {
  const response = await axios.post<AuthenticateUserResponseData>(
    '/api/user/login',
    args,
    { withCredentials: true },
  );
  return response;
};

export default authenticateUser;
