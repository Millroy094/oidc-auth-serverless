import { AxiosResponse } from 'axios';
import axios from '../../utils/axios-instance';

const deletePasskey = async (
  userId: string,
  deviceName: string,
): Promise<AxiosResponse> => {
  const response = await axios.delete('/api/user/delete-passkey', {
    withCredentials: true,
    data: { userId, deviceName },
  });

  return response;
};

export default deletePasskey;
