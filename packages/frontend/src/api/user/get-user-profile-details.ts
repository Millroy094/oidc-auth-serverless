import { AxiosResponse } from 'axios';
import axios from '../../utils/axios-instance';

const getUserProfileDetails = async (): Promise<AxiosResponse> => {
  const response = await axios.get('/api/user/profile-details', {
    withCredentials: true,
  });
  return response;
};

export default getUserProfileDetails;
