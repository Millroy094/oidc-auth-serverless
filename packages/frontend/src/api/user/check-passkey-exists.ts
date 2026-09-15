import { AxiosResponse } from 'axios';
import axios from '@/utils/axios-instance';

type registerPasskeyExistsArgs = {
  userId: string;
  deviceName: string;
};

interface CheckPasskeyExistsResponseData {
  exists: boolean;
}

const checkPasskeyAlreadyExists = async (
  args: registerPasskeyExistsArgs,
): Promise<AxiosResponse<CheckPasskeyExistsResponseData>> => {
  const { userId, deviceName } = args;
  const response = await axios.post<CheckPasskeyExistsResponseData>(
    '/api/user/check-passkey-already-exists',
    {
      userId,
      deviceName,
    },
    { withCredentials: true },
  );

  return response;
};

export default checkPasskeyAlreadyExists;
