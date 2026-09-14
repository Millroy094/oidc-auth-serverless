import axios from 'axios';
import globalRouter from './global-router';
import logoutUser from '../api/user/logout-user';

const axiosInstance = axios.create();

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (
      error.response.status == 401 &&
      error?.response?.data?.error ===
        'Authentication failed, please check if you are still logged in' &&
      globalRouter.navigate
    ) {
      await logoutUser();
      globalRouter.navigate('/login');
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
