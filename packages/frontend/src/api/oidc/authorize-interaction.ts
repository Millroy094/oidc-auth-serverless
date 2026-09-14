import { AxiosResponse } from 'axios';
import axios from '../../utils/axios-instance';

const authorizeInteraction = async (
  interactionId: string,
  authorize: boolean,
): Promise<AxiosResponse> => {
  const response = await axios.post(
    `/api/oidc/interaction/${interactionId}/authorize`,
    { authorize },
    { withCredentials: true },
  );
  return response;
};

export default authorizeInteraction;
