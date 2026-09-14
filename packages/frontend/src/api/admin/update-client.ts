import { AxiosResponse } from 'axios';
import axios from '../../utils/axios-instance';

type UpdateClientArgs = {
  scopes: string[];
  grants: string[];
  redirectUris: string[];
};

const updateClient = async (
  id: string,
  args: UpdateClientArgs,
): Promise<AxiosResponse> => {
  const { scopes, grants, redirectUris } = args;
  const response = await axios.put(
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
