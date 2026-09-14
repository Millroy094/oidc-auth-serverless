import { AxiosResponse } from 'axios';
import axios from '../../utils/axios-instance';

interface IChangePasswordArgs {
  email: string;
  otp: string;
  password: string;
}

const changePassword = async (
  args: IChangePasswordArgs,
): Promise<AxiosResponse> => {
  const { email, otp, password } = args;
  const response = await axios.post(
    '/api/user/change-password',
    {
      email,
      otp,
      password,
    },
    { withCredentials: true },
  );

  return response;
};

export default changePassword;
