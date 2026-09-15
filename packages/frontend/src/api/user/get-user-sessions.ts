import { AxiosResponse } from 'axios';
import axios from '@/utils/axios-instance';

export interface IUserSession {
  id: string;
  loggedInAt: number;
  clients: string[];
  iat: number;
  exp: number;
}

interface GetUserSessionsResponseData {
  sessions: IUserSession[];
}

const getUserSessions = async (): Promise<
  AxiosResponse<GetUserSessionsResponseData>
> => {
  const response = await axios.get<GetUserSessionsResponseData>(
    `/api/user/sessions`,
    {
      withCredentials: true,
    },
  );
  return response;
};

export default getUserSessions;
