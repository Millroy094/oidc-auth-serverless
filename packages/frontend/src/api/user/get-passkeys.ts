import { AxiosResponse } from 'axios';
import axios from '../../utils/axios-instance';

const getPasskeys = async (userId: string): Promise<AxiosResponse> => {
  const response = await axios.get('/api/user/get-passkeys', {
    params: { userId },
    withCredentials: true,
  });

  return response;
};

export default getPasskeys;
