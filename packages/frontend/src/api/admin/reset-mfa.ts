import { AxiosResponse } from 'axios';
import axios from '../../utils/axios-instance';

const resetMfa = async (id: string): Promise<AxiosResponse> => {
  const response = await axios.post(
    `/api/admin/users/${id}/mfa-reset`,
    {},
    { withCredentials: true },
  );

  return response;
};

export default resetMfa;
