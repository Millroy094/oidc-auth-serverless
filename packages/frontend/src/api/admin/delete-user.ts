import { AxiosResponse } from 'axios';
import axios from '@/utils/axios-instance';

interface DeleteUserResponseData {
  message: string;
}

const deleteUser = async (
  id: string,
): Promise<AxiosResponse<DeleteUserResponseData>> => {
  const response = await axios.delete<DeleteUserResponseData>(
    `/api/admin/users/${id}`,
    {
      withCredentials: true,
    },
  );
  return response;
};

export default deleteUser;
