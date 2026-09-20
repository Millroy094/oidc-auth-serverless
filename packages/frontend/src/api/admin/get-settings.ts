import { AxiosResponse } from 'axios';
import axios from '@/utils/axios-instance';

export interface ITtlSettings {
  accessTokenTtl: number;
  idTokenTtl: number;
  refreshTokenTtl: number;
  sessionTtl: number;
  grantTtl: number;
}

interface GetSettingsResponseData {
  settings: ITtlSettings;
}

const getSettings = async (): Promise<
  AxiosResponse<GetSettingsResponseData>
> => {
  const response = await axios.get<GetSettingsResponseData>(
    '/api/admin/settings',
    {
      withCredentials: true,
    },
  );
  return response;
};

export default getSettings;
