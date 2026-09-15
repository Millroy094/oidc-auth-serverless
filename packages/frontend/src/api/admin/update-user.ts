import { AxiosResponse } from 'axios';
import axios from '@/utils/axios-instance';

type updateUserFields = {
  firstName: string;
  lastName: string;
  emailVerified: boolean;
  mobile?: string;
  roles: string[];
  suspended: boolean;
};

interface UpdateUserResponseData {
  message: string;
}

const updateUser = async (
  id: string,
  updatedFields: updateUserFields,
): Promise<AxiosResponse<UpdateUserResponseData>> => {
  const { emailVerified, firstName, lastName, mobile, roles, suspended } =
    updatedFields;
  const response = await axios.put<UpdateUserResponseData>(
    `/api/admin/users/${id}`,
    {
      emailVerified,
      firstName,
      lastName,
      mobile,
      roles,
      suspended,
    },
    { withCredentials: true },
  );

  return response;
};

export default updateUser;
