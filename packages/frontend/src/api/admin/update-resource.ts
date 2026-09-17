import { AxiosResponse } from 'axios';
import axios from '@/utils/axios-instance';
import encodePathParam from '@/utils/encode-path-param';

type UpdateResourceArgs = {
  name: string;
  scopes: string[];
};

interface UpdateResourceResponseData {
  message: string;
}

const updateResource = async (
  id: string,
  args: UpdateResourceArgs,
): Promise<AxiosResponse<UpdateResourceResponseData>> => {
  const { name, scopes } = args;
  const response = await axios.put<UpdateResourceResponseData>(
    `/api/admin/resources/${encodePathParam(id)}`,
    {
      name,
      scopes,
    },
    { withCredentials: true },
  );

  return response;
};

export default updateResource;
