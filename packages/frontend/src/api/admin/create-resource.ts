import { AxiosResponse } from 'axios';
import axios from '@/utils/axios-instance';

type CreateResourceArgs = {
  id: string;
  name: string;
  scopes: string[];
};

interface CreateResourceResponseData {
  message: string;
}

const createResource = async (
  args: CreateResourceArgs,
): Promise<AxiosResponse<CreateResourceResponseData>> => {
  const { id, name, scopes } = args;
  const response = await axios.post<CreateResourceResponseData>(
    '/api/admin/resources/new',
    {
      id,
      name,
      scopes,
    },
    { withCredentials: true },
  );

  return response;
};

export default createResource;
