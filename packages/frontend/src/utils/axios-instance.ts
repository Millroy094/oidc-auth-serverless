import axios, { AxiosError } from 'axios';
import globalRouter from './global-router';
import logoutUser from '@/api/user/logout-user';

interface IAuthErrorResponseData {
  error?: string;
}

const axiosInstance = axios.create();

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (
      error instanceof AxiosError &&
      error.response?.status === 401 &&
      (error.response?.data as IAuthErrorResponseData | undefined)?.error ===
        'Authentication failed, please check if you are still logged in' &&
      globalRouter.navigate
    ) {
      await logoutUser();
      await globalRouter.navigate('/login');
    }
    return Promise.reject(
      error instanceof Error ? error : new Error(String(error)),
    );
  },
);

export default axiosInstance;
