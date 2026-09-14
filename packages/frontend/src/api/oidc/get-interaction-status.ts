import { AxiosResponse } from 'axios';
import axios from '../../utils/axios-instance';

const getInteractionStatus = async (
  interactionId: string,
): Promise<AxiosResponse> => {
  const response = await axios.get(
    `/api/oidc/interaction/${interactionId}/status`,
    {
      withCredentials: true,
    },
  );
  return response;
};

export default getInteractionStatus;
