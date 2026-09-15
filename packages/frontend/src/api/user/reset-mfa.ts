import { AxiosResponse } from 'axios';
import axios from '@/utils/axios-instance';

interface ResetMfaResponseData {
  message: string;
}

const resetMfa = async (
  type: string,
): Promise<AxiosResponse<ResetMfaResponseData>> => {
  const response = await axios.post<ResetMfaResponseData>(
    '/api/user/mfa-reset',
    {
      type,
    },
    { withCredentials: true },
  );

  return response;
};

export default resetMfa;
