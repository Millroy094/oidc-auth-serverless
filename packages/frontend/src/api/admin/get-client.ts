import { AxiosResponse } from 'axios';
import { IResourceScope } from './types.ts';
import axios from '@/utils/axios-instance';

export interface IAdminClient {
  id: string;
  clientId: string;
  clientName: string;
  secret: string;
  scopes: string[];
  grants: string[];
  redirectUris: string[];
  resources: IResourceScope[];
}

interface GetClientResponseData {
  client: IAdminClient;
}

const getClient = async (
  id: string,
): Promise<AxiosResponse<GetClientResponseData>> => {
  const response = await axios.get<GetClientResponseData>(
    `/api/admin/clients/${id}`,
    {
      withCredentials: true,
    },
  );
  return response;
};

export default getClient;
