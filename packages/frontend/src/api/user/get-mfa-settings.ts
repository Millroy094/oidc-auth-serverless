import { AxiosResponse } from 'axios';
import axios from '../../utils/axios-instance';

const getMFASettings = async (): Promise<AxiosResponse> => {
  const response = await axios.get('/api/user/mfa-settings', {
    withCredentials: true,
  });
  return response;
};

export default getMFASettings;
