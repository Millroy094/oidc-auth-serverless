import { AxiosResponse } from 'axios';
import axios from '../../utils/axios-instance';

const getClients = async (): Promise<AxiosResponse> => {
  const response = await axios.get(`/api/admin/clients`, {
    withCredentials: true,
  });
  return response;
};

export default getClients;
