import { AxiosResponse } from 'axios';
import axios from '../../utils/axios-instance';

const getLoginConfiguration = async (email: string): Promise<AxiosResponse> => {
  const response = await axios.get(`/api/user/get-login-configuration`, {
    params: { email },
    withCredentials: true,
  });
  return response;
};

export default getLoginConfiguration;
