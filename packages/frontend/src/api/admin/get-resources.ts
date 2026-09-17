import { AxiosResponse } from 'axios';
import axios from '@/utils/axios-instance';

export interface IAdminResourceListItem {
  id: string;
  name: string;
  scopes: string[];
}

interface GetResourcesResponseData {
  results: IAdminResourceListItem[];
  message: string;
}

const getResources = async (): Promise<
  AxiosResponse<GetResourcesResponseData>
> => {
  const response = await axios.get<GetResourcesResponseData>(
    `/api/admin/resources`,
    {
      withCredentials: true,
    },
  );
  return response;
};

export default getResources;
