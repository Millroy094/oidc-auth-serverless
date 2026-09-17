import { AxiosResponse } from 'axios';
import axios from '@/utils/axios-instance';
import encodePathParam from '@/utils/encode-path-param';

export interface IAdminResource {
  id: string;
  name: string;
  scopes: string[];
}

interface GetResourceResponseData {
  resource: IAdminResource;
}

const getResource = async (
  id: string,
): Promise<AxiosResponse<GetResourceResponseData>> => {
  const response = await axios.get<GetResourceResponseData>(
    `/api/admin/resources/${encodePathParam(id)}`,
    {
      withCredentials: true,
    },
  );
  return response;
};

export default getResource;
