import { AxiosResponse } from 'axios';
import axios from '../../utils/axios-instance';

const generateRecoveryCodes = async (): Promise<AxiosResponse> => {
  const response = await axios.get('/api/user/generate-recovery-codes', {
    withCredentials: true,
  });
  return response;
};

export default generateRecoveryCodes;
