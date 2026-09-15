import { AxiosResponse } from 'axios';
import axios from '@/utils/axios-instance';

export interface IUserProfile {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  emailVerified: boolean;
  mobile?: string;
}

interface GetUserProfileDetailsResponseData {
  user: IUserProfile;
}

const getUserProfileDetails = async (): Promise<
  AxiosResponse<GetUserProfileDetailsResponseData>
> => {
  const response = await axios.get<GetUserProfileDetailsResponseData>(
    '/api/user/profile-details',
    {
      withCredentials: true,
    },
  );
  return response;
};

export default getUserProfileDetails;
