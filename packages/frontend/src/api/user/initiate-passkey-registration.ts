import { AxiosResponse } from 'axios';
import axios from '@/utils/axios-instance';

type initiatePasskeyRegistrationArgs = {
  userId: string;
};

interface InitiatePasskeyRegistrationResponse {
  sessionId: string;
  message: string;
}

const initiatePasskeyRegistration = async (
  args: initiatePasskeyRegistrationArgs,
): Promise<AxiosResponse<InitiatePasskeyRegistrationResponse>> => {
  const { userId } = args;
  const response = await axios.post<InitiatePasskeyRegistrationResponse>(
    '/api/user/initiate-passkey-registration',
    { userId },
    { withCredentials: true },
  );

  return response;
};

export default initiatePasskeyRegistration;
