import { AxiosResponse } from 'axios';
import axios from '../../utils/axios-instance';

const changeMFAPreference = async (
  preference: string,
): Promise<AxiosResponse> => {
  const response = await axios.post(
    '/api/user/mfa-change-preference',
    {
      preference,
    },
    { withCredentials: true },
  );

  return response;
};

export default changeMFAPreference;
