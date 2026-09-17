import { AxiosResponse } from 'axios';
import axios from '@/utils/axios-instance';
import encodePathParam from '@/utils/encode-path-param';

interface DeleteResourceResponseData {
  message: string;
}

const deleteResource = async (
  id: string,
): Promise<AxiosResponse<DeleteResourceResponseData>> => {
  const response = await axios.delete<DeleteResourceResponseData>(
    `/api/admin/resources/${encodePathParam(id)}`,
    {
      withCredentials: true,
    },
  );
  return response;
};

export default deleteResource;
