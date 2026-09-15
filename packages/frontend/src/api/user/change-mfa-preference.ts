import { AxiosResponse } from 'axios';
import axios from '@/utils/axios-instance';

interface ChangeMFAPreferenceResponseData {
  message: string;
}

const changeMFAPreference = async (
  preference: string,
): Promise<AxiosResponse<ChangeMFAPreferenceResponseData>> => {
  const response = await axios.post<ChangeMFAPreferenceResponseData>(
    '/api/user/mfa-change-preference',
    {
      preference,
    },
    { withCredentials: true },
  );

  return response;
};

export default changeMFAPreference;
