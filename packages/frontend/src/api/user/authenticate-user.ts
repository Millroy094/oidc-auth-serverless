import { AxiosResponse } from 'axios';
import axios from '@/utils/axios-instance';

type AuthenticateUserArgs = {
  email: string;
  password: string;
  otp?: string;
  loginWithRecoveryCode?: boolean;
  recoveryCode?: string;
  resetMfa?: boolean;
};

export interface IAuthenticatedUser {
  userId: string;
  email: string;
  roles: string[];
}

interface AuthenticateUserResponseData {
  user: IAuthenticatedUser;
  message: string;
}

const authenticateUser = async (
  args: AuthenticateUserArgs,
): Promise<AxiosResponse<AuthenticateUserResponseData>> => {
  const {
    email,
    password,
    otp,
    loginWithRecoveryCode,
    recoveryCode,
    resetMfa,
  } = args;
  const response = await axios.post<AuthenticateUserResponseData>(
    '/api/user/login',
    {
      email,
      password,
      otp,
      loginWithRecoveryCode,
      recoveryCode,
      resetMfa,
    },
    { withCredentials: true },
  );
  return response;
};

export default authenticateUser;
