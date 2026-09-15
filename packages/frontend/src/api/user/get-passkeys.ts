import { AxiosResponse } from 'axios';
import axios from '@/utils/axios-instance';

interface GetPasskeysResponseData {
  messages: string;
  deviceNames: string[];
  verified: boolean;
}

const getPasskeys = async (
  userId: string,
): Promise<AxiosResponse<GetPasskeysResponseData>> => {
  const response = await axios.get<GetPasskeysResponseData>(
    '/api/user/get-passkeys',
    {
      params: { userId },
      withCredentials: true,
    },
  );

  return response;
};

export default getPasskeys;
