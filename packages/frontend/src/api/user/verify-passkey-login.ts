import { AxiosResponse } from 'axios';
import axios from '../../utils/axios-instance';

type loginPasskeyVerificationArgs = {
  email: string;
  credential: unknown;
};

const verifyPasskeyLogin = async (
  args: loginPasskeyVerificationArgs,
): Promise<AxiosResponse> => {
  const { email, credential } = args;
  const response = await axios.post(
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
