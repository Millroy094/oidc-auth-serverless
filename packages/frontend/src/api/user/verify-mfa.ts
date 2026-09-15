import { AxiosResponse } from 'axios';
import axios from '@/utils/axios-instance';

type VerifyMFAArgs = {
  type: string;
  otp: string;
};

interface VerifyMFAResponseData {
  message: string;
}

const verifyMFA = async (
  args: VerifyMFAArgs,
): Promise<AxiosResponse<VerifyMFAResponseData>> => {
  const { type, otp } = args;
  const response = await axios.post<VerifyMFAResponseData>(
    '/api/user/mfa-verify',
    {
      type,
      otp,
    },
    { withCredentials: true },
  );

  return response;
};

export default verifyMFA;
