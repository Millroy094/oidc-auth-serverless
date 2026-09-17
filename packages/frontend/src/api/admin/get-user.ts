import { AxiosResponse } from 'axios';
import { IResourceScope } from './types.ts';
import axios from '@/utils/axios-instance';

export interface IAdminUser {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile?: string;
  roles: string[];
  emailVerified: boolean;
  suspended: boolean;
  lastLoggedIn: number;
  resources: IResourceScope[];
}

interface GetUserResponseData {
  user: IAdminUser;
}

const getUser = async (
  id: string,
): Promise<AxiosResponse<GetUserResponseData>> => {
  const response = await axios.get<GetUserResponseData>(
    `/api/admin/users/${id}`,
    {
      withCredentials: true,
    },
  );
  return response;
};

export default getUser;
