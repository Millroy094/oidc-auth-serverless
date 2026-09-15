import { PublicKeyCredentialCreationOptionsJSON } from '@simplewebauthn/browser';
import { AxiosResponse } from 'axios';
import axios from '@/utils/axios-instance';

type registerPasskeyArgs = {
  userId: string;
};

interface RegisterPasskeyResponseData {
  options: PublicKeyCredentialCreationOptionsJSON;
}

const registerPasskey = async (
  args: registerPasskeyArgs,
): Promise<AxiosResponse<RegisterPasskeyResponseData>> => {
  const { userId } = args;
  const response = await axios.post<RegisterPasskeyResponseData>(
    '/api/user/register-passkey',
    {
      userId,
    },
    { withCredentials: true },
  );

  return response;
};

export default registerPasskey;
