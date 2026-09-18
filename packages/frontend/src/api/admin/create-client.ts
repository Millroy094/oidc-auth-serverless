import { AxiosResponse } from 'axios';
import axios from '@/utils/axios-instance';

type CreateClientArgs = {
  clientId: string;
  clientName: string;
  scopes: string[];
  grants: string[];
  redirectUris: string[];
  requirePkce: boolean;
};

interface CreateClientResponseData {
  message: string;
}

const createClient = async (
  args: CreateClientArgs,
): Promise<AxiosResponse<CreateClientResponseData>> => {
  const { clientId, clientName, scopes, grants, redirectUris, requirePkce } =
    args;
  const response = await axios.post<CreateClientResponseData>(
    '/api/admin/clients/new',
    {
      clientId,
      clientName,
      scopes,
      grants,
      redirectUris,
      requirePkce,
    },
    { withCredentials: true },
  );

  return response;
};

export default createClient;
