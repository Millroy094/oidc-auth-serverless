import { AxiosResponse } from 'axios';
import axios from '../../utils/axios-instance';

type registrationPasskeyVerificationArgs = {
  userId: string;
  credential: unknown;
  deviceName: string;
};

const verifyPasskeyRegistration = async (
  args: registrationPasskeyVerificationArgs,
): Promise<AxiosResponse> => {
  const { userId, credential, deviceName } = args;
  const response = await axios.post(
    '/api/user/verify-passkey-registration',
    {
      userId,
      credential,
      deviceName,
    },
    { withCredentials: true },
  );

  return response;
};

export default verifyPasskeyRegistration;
