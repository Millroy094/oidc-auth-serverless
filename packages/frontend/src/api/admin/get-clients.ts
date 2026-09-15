import { AxiosResponse } from 'axios';
import axios from '@/utils/axios-instance';

export interface IAdminClientListItem {
  id: string;
  clientId: string;
  clientName: string;
  secret: string;
}

interface GetClientsResponseData {
  results: IAdminClientListItem[];
  message: string;
}

const getClients = async (): Promise<AxiosResponse<GetClientsResponseData>> => {
  const response = await axios.get<GetClientsResponseData>(
    `/api/admin/clients`,
    {
      withCredentials: true,
    },
  );
  return response;
};

export default getClients;
