import { AxiosResponse } from 'axios';
import { IResourceScope } from './types.ts';
import axios from '@/utils/axios-instance';

type UpdateClientArgs = {
  scopes: string[];
  grants: string[];
  redirectUris: string[];
  resources: IResourceScope[];
};

interface UpdateClientResponseData {
  message: string;
}

const updateClient = async (
  id: string,
  args: UpdateClientArgs,
): Promise<AxiosResponse<UpdateClientResponseData>> => {
  const { scopes, grants, redirectUris, resources } = args;
  const response = await axios.put<UpdateClientResponseData>(
    `/api/admin/clients/${id}`,
    {
      scopes,
      grants,
      redirectUris,
      resources,
    },
    { withCredentials: true },
  );

  return response;
};

export default updateClient;
