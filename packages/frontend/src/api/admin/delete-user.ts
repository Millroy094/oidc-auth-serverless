import { AxiosResponse } from 'axios';
import axios from '../../utils/axios-instance';

const deleteUser = async (id: string): Promise<AxiosResponse> => {
  const response = await axios.delete(`/api/admin/users/${id}`, {
    withCredentials: true,
  });
  return response;
};

export default deleteUser;
