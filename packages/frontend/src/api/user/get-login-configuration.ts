import { AxiosResponse } from 'axios';
import axios from '@/utils/axios-instance';

interface GetLoginConfigurationResponseData {
  emailVerified: boolean;
  mfa: { enabled: boolean; type: string };
}

const getLoginConfiguration = async (
  email: string,
): Promise<AxiosResponse<GetLoginConfigurationResponseData>> => {
  const response = await axios.get<GetLoginConfigurationResponseData>(
    `/api/user/get-login-configuration`,
    {
      params: { email },
      withCredentials: true,
    },
  );
  return response;
};

export default getLoginConfiguration;
