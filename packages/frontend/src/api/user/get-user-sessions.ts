import { AxiosResponse } from 'axios';
import axios from '../../utils/axios-instance';

const getUserSessions = async (): Promise<AxiosResponse> => {
  const response = await axios.get(`/api/user/sessions`, {
    withCredentials: true,
  });
  return response;
};

export default getUserSessions;
