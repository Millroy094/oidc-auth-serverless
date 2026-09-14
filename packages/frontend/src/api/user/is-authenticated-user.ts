import { AxiosResponse } from 'axios';
import axios from '../../utils/axios-instance';

const isAuthenticated = async (): Promise<AxiosResponse> => {
  const response = await axios.get('/api/user/is-authenticated', {
    withCredentials: true,
  });

  return response;
};

export default isAuthenticated;
