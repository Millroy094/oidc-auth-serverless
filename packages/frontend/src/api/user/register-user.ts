import { AxiosResponse } from 'axios';
import axios from '../../utils/axios-instance';

type registerUserArgs = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  mobile?: string;
};

const registerUser = async (args: registerUserArgs): Promise<AxiosResponse> => {
  const { email, password, firstName, lastName, mobile } = args;
  const response = await axios.post(
    '/api/user/register',
    {
      email,
      password,
      firstName,
      lastName,
      mobile,
    },
    { withCredentials: true },
  );

  return response;
};

export default registerUser;
