import { AxiosResponse } from 'axios';
import axios from '../../utils/axios-instance';

type registerPasskeyExistsArgs = {
  userId: string;
  deviceName: string;
};

const checkPasskeyAlreadyExists = async (
  args: registerPasskeyExistsArgs,
): Promise<AxiosResponse> => {
  const { userId, deviceName } = args;
  const response = await axios.post(
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
