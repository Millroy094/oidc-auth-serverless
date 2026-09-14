import { AxiosResponse } from 'axios';
import axios from '../../utils/axios-instance';

const getUsers = async (): Promise<AxiosResponse> => {
  const response = await axios.get(`/api/admin/users`, {
    withCredentials: true,
  });
  return response;
};

export default getUsers;
