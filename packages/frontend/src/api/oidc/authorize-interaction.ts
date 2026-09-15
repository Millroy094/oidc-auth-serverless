import { AxiosResponse } from 'axios';
import axios from '@/utils/axios-instance';

interface AuthorizeInteractionResponseData {
  redirect: string;
  message?: string;
}

const authorizeInteraction = async (
  interactionId: string,
  authorize: boolean,
): Promise<AxiosResponse<AuthorizeInteractionResponseData>> => {
  const response = await axios.post<AuthorizeInteractionResponseData>(
    `/api/oidc/interaction/${interactionId}/authorize`,
    { authorize },
    { withCredentials: true },
  );
  return response;
};

export default authorizeInteraction;
