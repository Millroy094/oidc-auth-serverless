import { AxiosResponse } from 'axios';
import axios from '@/utils/axios-instance';

interface DeleteAllUserSessionResponseData {
  message: string;
}

const deleteAllUserSession = async (): Promise<
  AxiosResponse<DeleteAllUserSessionResponseData>
> => {
  const response = await axios.delete<DeleteAllUserSessionResponseData>(
    '/api/user/sessions',
    {
      withCredentials: true,
    },
  );
  return response;
};

export default deleteAllUserSession;
