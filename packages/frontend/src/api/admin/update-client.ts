import { AxiosResponse } from 'axios';
import axios from '@/utils/axios-instance';

type UpdateClientArgs = {
  scopes: string[];
  grants: string[];
  redirectUris: string[];
};

interface UpdateClientResponseData {
  message: string;
}

const updateClient = async (
  id: string,
  args: UpdateClientArgs,
): Promise<AxiosResponse<UpdateClientResponseData>> => {
  const { scopes, grants, redirectUris } = args;
  const response = await axios.put<UpdateClientResponseData>(
    `/api/admin/clients/${id}`,
    {
      scopes,
      grants,
      redirectUris,
    },
    { withCredentials: true },
  );

  return response;
};

export default updateClient;
