import { AxiosResponse } from 'axios';
import axios from '@/utils/axios-instance';

type validateCredentialsArgs = {
  email: string;
  password: string;
  otp?: string;
  loginWithRecoveryCode?: boolean;
  recoveryCode?: string;
  resetMfa?: boolean;
  interactionId: string;
};

interface AuthenticateInteractionResponseData {
  redirect: string;
  message?: string;
}

const authenticateInteraction = async (
  args: validateCredentialsArgs,
): Promise<AxiosResponse<AuthenticateInteractionResponseData>> => {
  const {
    email,
    password,
    otp,
    loginWithRecoveryCode,
    recoveryCode,
    resetMfa,
    interactionId,
  } = args;
  const response = await axios.post<AuthenticateInteractionResponseData>(
    `/api/oidc/interaction/${interactionId}/authenticate`,
    {
      email,
      password,
      otp,
      loginWithRecoveryCode,
      recoveryCode,
      resetMfa,
    },
    { withCredentials: true },
  );
  return response;
};

export default authenticateInteraction;
