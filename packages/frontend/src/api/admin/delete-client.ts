import { AxiosResponse } from 'axios';
import axios from '@/utils/axios-instance';

interface DeleteClientResponseData {
  message: string;
}

const deleteClient = async (
  id: string,
): Promise<AxiosResponse<DeleteClientResponseData>> => {
  const response = await axios.delete<DeleteClientResponseData>(
    `/api/admin/clients/${id}`,
    {
      withCredentials: true,
    },
  );
  return response;
};

export default deleteClient;
