import { AxiosResponse } from 'axios';
import axios from '@/utils/axios-instance';

interface GetInteractionStatusResponseData {
  status: string;
}

const getInteractionStatus = async (
  interactionId: string,
): Promise<AxiosResponse<GetInteractionStatusResponseData>> => {
  const response = await axios.get<GetInteractionStatusResponseData>(
    `/api/oidc/interaction/${interactionId}/status`,
    {
      withCredentials: true,
    },
  );
  return response;
};

export default getInteractionStatus;
