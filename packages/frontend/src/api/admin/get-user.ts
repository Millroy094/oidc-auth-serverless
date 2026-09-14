import { AxiosResponse } from 'axios';
import axios from '../../utils/axios-instance';

const getUser = async (id: string): Promise<AxiosResponse> => {
  const response = await axios.get(`/api/admin/users/${id}`, {
    withCredentials: true,
  });
  return response;
};

export default getUser;
