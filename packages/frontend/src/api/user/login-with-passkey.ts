import { PublicKeyCredentialRequestOptionsJSON } from '@simplewebauthn/browser';
import { AxiosResponse } from 'axios';
import axios from '@/utils/axios-instance';

type loginWithPasskeyArgs = {
  email: string;
};

interface LoginWithPasskeyResponseData {
  options: PublicKeyCredentialRequestOptionsJSON;
}

const loginWithPasskey = async (
  args: loginWithPasskeyArgs,
): Promise<AxiosResponse<LoginWithPasskeyResponseData>> => {
  const { email } = args;
  const response = await axios.post<LoginWithPasskeyResponseData>(
    '/api/user/login-with-passkey',
    {
      email,
    },
    { withCredentials: true },
  );

  return response;
};

export default loginWithPasskey;
