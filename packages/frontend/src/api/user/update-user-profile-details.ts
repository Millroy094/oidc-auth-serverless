import { AxiosResponse } from 'axios';
import axios from '@/utils/axios-instance';

type updateUserProfileDetailsArgs = {
  email: string;
  firstName: string;
  lastName: string;
  emailVerified: boolean;
  mobile?: string;
};

interface UpdateUserProfileDetailsResponseData {
  message: string;
}

const updateUserProfileDetails = async (
  args: updateUserProfileDetailsArgs,
): Promise<AxiosResponse<UpdateUserProfileDetailsResponseData>> => {
  const { email, emailVerified, firstName, lastName, mobile } = args;
  const response = await axios.put<UpdateUserProfileDetailsResponseData>(
    '/api/user/profile-details',
    {
      email,
      emailVerified,
      firstName,
      lastName,
      mobile,
    },
    { withCredentials: true },
  );

  return response;
};

export default updateUserProfileDetails;
