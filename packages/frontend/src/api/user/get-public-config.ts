import { AxiosResponse } from 'axios';
import axios from '@/utils/axios-instance';

interface GetPublicConfigResponseData {
  turnstileSiteKey: string;
}

const getPublicConfig = async (): Promise<
  AxiosResponse<GetPublicConfigResponseData>
> => {
  const response = await axios.get<GetPublicConfigResponseData>(
    '/api/user/public-config',
  );
  return response;
};

export default getPublicConfig;
