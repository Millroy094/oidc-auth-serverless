import { AxiosResponse } from 'axios';
import axios from '@/utils/axios-instance';

interface ResetMfaResponseData {
  message: string;
}

const resetMfa = async (
  id: string,
): Promise<AxiosResponse<ResetMfaResponseData>> => {
  const response = await axios.post<ResetMfaResponseData>(
    `/api/admin/users/${id}/mfa-reset`,
    {},
    { withCredentials: true },
  );

  return response;
};

export default resetMfa;
