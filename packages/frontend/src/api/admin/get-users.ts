import { AxiosResponse } from 'axios';
import axios from '@/utils/axios-instance';

export interface IAdminUserListItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  roles: string[];
}

interface GetUsersResponseData {
  results: IAdminUserListItem[];
  message: string;
}

const getUsers = async (): Promise<AxiosResponse<GetUsersResponseData>> => {
  const response = await axios.get<GetUsersResponseData>(`/api/admin/users`, {
    withCredentials: true,
  });
  return response;
};

export default getUsers;
