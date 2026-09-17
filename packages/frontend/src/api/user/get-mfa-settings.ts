import { AxiosResponse } from 'axios';
import axios from '@/utils/axios-instance';

export interface IMFATypeSetting {
  type: string;
  subscriber: string;
  verified: boolean;
}

interface GetMFASettingsResponseData {
  settings: {
    types: IMFATypeSetting[];
    preference: string;
    recoveryCodeCount: number;
    passkeyVerified: boolean;
  };
}

const getMFASettings = async (): Promise<
  AxiosResponse<GetMFASettingsResponseData>
> => {
  const response = await axios.get<GetMFASettingsResponseData>(
    '/api/user/mfa-settings',
    {
      withCredentials: true,
    },
  );
  return response;
};

export default getMFASettings;
