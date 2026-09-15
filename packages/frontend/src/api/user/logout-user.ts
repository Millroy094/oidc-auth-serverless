import { AxiosResponse } from 'axios';
import axios from '@/utils/axios-instance';

interface LogoutUserResponseData {
  message: string;
}

const logoutUser = async (): Promise<AxiosResponse<LogoutUserResponseData>> => {
  const response = await axios.get<LogoutUserResponseData>('/api/user/logout', {
    withCredentials: true,
  });

  return response;
};

export default logoutUser;
