import { AxiosResponse } from 'axios';
import axios from '../../utils/axios-instance';

type SetupMFAArgs = {
  type: string;
  subscriber: string;
};

const setupMFA = async (args: SetupMFAArgs): Promise<AxiosResponse> => {
  const { type, subscriber } = args;
  const response = await axios.post(
    '/api/user/mfa-setup',
    {
      type,
      subscriber,
    },
    { withCredentials: true },
  );

  return response;
};

export default setupMFA;
