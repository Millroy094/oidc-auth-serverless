import { AxiosResponse } from 'axios';
import axios from '@/utils/axios-instance';

interface ClearUserSessionsResponseData {
  message: string;
}

const clearUserSessions = async (
  id: string,
): Promise<AxiosResponse<ClearUserSessionsResponseData>> => {
  const response = await axios.delete<ClearUserSessionsResponseData>(
    `/api/admin/users/${id}/sessions`,
    {
      withCredentials: true,
    },
  );
  return response;
};

export default clearUserSessions;
