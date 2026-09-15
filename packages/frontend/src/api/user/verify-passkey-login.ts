import { AxiosResponse } from 'axios';
import axios from '@/utils/axios-instance';

type loginPasskeyVerificationArgs = {
  email: string;
  credential: unknown;
};

interface VerifyPasskeyLoginResponseData {
  verified: boolean;
}

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
