import { AxiosResponse } from 'axios';
import axios from '@/utils/axios-instance';

interface ISendMFAOtpArgs {
  type: string;
  email: string;
}

interface SendOtpResponseData {
  message: string;
}

const sendOtp = async (
  args: ISendMFAOtpArgs,
): Promise<AxiosResponse<SendOtpResponseData>> => {
  const { type, email } = args;
  const response = await axios.post<SendOtpResponseData>(
    '/api/user/send-otp',
    {
      type,
      email,
    },
    { withCredentials: true },
  );

  return response;
};

export default sendOtp;
