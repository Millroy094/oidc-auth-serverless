import { AxiosResponse } from 'axios';
import axios from '@/utils/axios-instance';

interface DeleteUserSessionResponseData {
  message: string;
}

const deleteUserSession = async (
  sessionId: string,
): Promise<AxiosResponse<DeleteUserSessionResponseData>> => {
  const response = await axios.delete<DeleteUserSessionResponseData>(
    `/api/user/sessions/${sessionId}`,
    {
      withCredentials: true,
    },
  );
  return response;
};

export default deleteUserSession;
