import { AxiosResponse } from 'axios';
import axios from '@/utils/axios-instance';

interface DeletePasskeyResponseData {
  messages: string;
  // Note: the backend response uses `messages` (not `message`); this optional
  // `message` field exists only so the response type satisfies
  // `feedbackAxiosResponse`'s generic constraint. It is never actually sent.
  message?: string;
}

const deletePasskey = async (
  userId: string,
  deviceName: string,
): Promise<AxiosResponse<DeletePasskeyResponseData>> => {
  const response = await axios.delete<DeletePasskeyResponseData>(
    '/api/user/delete-passkey',
    {
      withCredentials: true,
      data: { userId, deviceName },
    },
  );

  return response;
};

export default deletePasskey;
