import { AxiosResponse } from 'axios';
import axios from '../../utils/axios-instance';

type registerPasskeyArgs = {
  userId: string;
};

const registerPasskey = async (
  args: registerPasskeyArgs,
): Promise<AxiosResponse> => {
  const { userId } = args;
  const response = await axios.post(
    '/api/user/register-passkey',
    {
      userId,
    },
    { withCredentials: true },
  );

  return response;
};

export default registerPasskey;
