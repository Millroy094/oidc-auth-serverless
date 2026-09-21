import { AxiosResponse } from 'axios';
import { ISettings } from './get-settings';
import axios from '@/utils/axios-instance';

interface UpdateSettingsResponseData {
  settings: ISettings;
  message: string;
}

const updateSettings = async (
  args: Partial<ISettings>,
): Promise<AxiosResponse<UpdateSettingsResponseData>> => {
  const response = await axios.put<UpdateSettingsResponseData>(
    '/api/admin/settings',
    args,
    { withCredentials: true },
  );

  return response;
};

export default updateSettings;
