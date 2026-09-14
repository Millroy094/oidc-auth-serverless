import { AxiosResponse } from 'axios';
import axios from '../../utils/axios-instance';

interface ISendMFAOtpArgs {
  type: string;
  email: string;
}

const sendOtp = async (args: ISendMFAOtpArgs): Promise<AxiosResponse> => {
  const { type, email } = args;
  const response = await axios.post(
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
