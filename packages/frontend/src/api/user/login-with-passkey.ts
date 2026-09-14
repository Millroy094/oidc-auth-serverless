import { AxiosResponse } from 'axios';
import axios from '../../utils/axios-instance';

type loginWithPasskeyArgs = {
  email: string;
};

const loginWithPasskey = async (
  args: loginWithPasskeyArgs,
): Promise<AxiosResponse> => {
  const { email } = args;
  const response = await axios.post(
    '/api/user/login-with-passkey',
    {
      email,
    },
    { withCredentials: true },
  );

  return response;
};

export default loginWithPasskey;
