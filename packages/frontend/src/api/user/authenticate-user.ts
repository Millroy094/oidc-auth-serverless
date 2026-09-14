import { AxiosResponse } from 'axios';
import axios from '../../utils/axios-instance';

type AuthenticateUserArgs = {
  email: string;
  password: string;
  otp?: string;
  loginWithRecoveryCode?: boolean;
  recoveryCode?: string;
  resetMfa?: boolean;
};

const authenticateUser = async (
  args: AuthenticateUserArgs,
): Promise<AxiosResponse> => {
  const {
    email,
    password,
    otp,
    loginWithRecoveryCode,
    recoveryCode,
    resetMfa,
  } = args;
  const response = await axios.post(
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
