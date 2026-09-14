import { AxiosResponse } from 'axios';
import axios from '../../utils/axios-instance';

const clearUserSessions = async (id: string): Promise<AxiosResponse> => {
  const response = await axios.delete(`/api/admin/users/${id}/sessions`, {
    withCredentials: true,
  });
  return response;
};

export default clearUserSessions;
