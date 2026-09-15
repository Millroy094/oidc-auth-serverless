import { AxiosResponse } from 'axios';
import axios from '@/utils/axios-instance';

type SetupMFAArgs = {
  type: string;
  subscriber: string;
};

interface SetupMFAResponseData {
  uri?: string;
  message: string;
}

const setupMFA = async (
  args: SetupMFAArgs,
): Promise<AxiosResponse<SetupMFAResponseData>> => {
  const { type, subscriber } = args;
  const response = await axios.post<SetupMFAResponseData>(
    '/api/user/mfa-setup',
    {
      type,
      subscriber,
    },
    { withCredentials: true },
  );

  return response;
};

export default setupMFA;
