import { AxiosResponse } from 'axios';
import { ITtlSettings } from './get-settings';
import axios from '@/utils/axios-instance';

interface UpdateSettingsResponseData {
  settings: ITtlSettings;
  message: string;
}

const updateSettings = async (
  args: ITtlSettings,
): Promise<AxiosResponse<UpdateSettingsResponseData>> => {
  const response = await axios.put<UpdateSettingsResponseData>(
    '/api/admin/settings',
    args,
    { withCredentials: true },
  );

  return response;
};

export default updateSettings;
