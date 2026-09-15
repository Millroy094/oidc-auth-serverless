import { AxiosResponse } from 'axios';
import axios from '@/utils/axios-instance';

interface GenerateRecoveryCodesResponseData {
  message: string;
  recoveryCodes: string[];
}

const generateRecoveryCodes = async (): Promise<
  AxiosResponse<GenerateRecoveryCodesResponseData>
> => {
  const response = await axios.get<GenerateRecoveryCodesResponseData>(
    '/api/user/generate-recovery-codes',
    {
      withCredentials: true,
    },
  );
  return response;
};

export default generateRecoveryCodes;
