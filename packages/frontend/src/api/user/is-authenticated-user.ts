import { AxiosResponse } from 'axios';
import axios from '@/utils/axios-instance';

export interface IAuthenticatedUserStatus {
  userId: string;
  email: string;
  roles: string[];
}

interface IsAuthenticatedResponseData {
  user: IAuthenticatedUserStatus;
}

const isAuthenticated = async (): Promise<
  AxiosResponse<IsAuthenticatedResponseData>
> => {
  const response = await axios.get<IsAuthenticatedResponseData>(
    '/api/user/is-authenticated',
    {
      withCredentials: true,
    },
  );

  return response;
};

export default isAuthenticated;
