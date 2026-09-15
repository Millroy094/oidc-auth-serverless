import { AxiosResponse } from 'axios';
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
