import { AxiosResponse } from 'axios';
import axios from '../../utils/axios-instance';

const deleteAllUserSession = async (): Promise<AxiosResponse> => {
  const response = await axios.delete('/api/user/sessions', {
    withCredentials: true,
  });
  return response;
};

export default deleteAllUserSession;
