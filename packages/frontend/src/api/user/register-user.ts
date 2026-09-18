import { AxiosResponse } from 'axios';
import axios from '@/utils/axios-instance';

type registerUserArgs = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  mobile?: string;
  captchaToken: string;
};

interface RegisterUserResponseData {
  message: string;
}

const registerUser = async (
  args: registerUserArgs,
): Promise<AxiosResponse<RegisterUserResponseData>> => {
  const { email, password, firstName, lastName, mobile, captchaToken } = args;
  const response = await axios.post<RegisterUserResponseData>(
    '/api/user/register',
    {
      email,
      password,
      firstName,
      lastName,
      mobile,
      captchaToken,
    },
    { withCredentials: true },
  );

  return response;
};

export default registerUser;
