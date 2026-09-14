import { AxiosResponse } from 'axios';
import axios from '../../utils/axios-instance';

type updateUserFields = {
  firstName: string;
  lastName: string;
  emailVerified: boolean;
  mobile?: string;
  roles: string[];
  suspended: boolean;
};

const updateUser = async (
  id: string,
  updatedFields: updateUserFields,
): Promise<AxiosResponse> => {
  const { emailVerified, firstName, lastName, mobile, roles, suspended } =
    updatedFields;
  const response = await axios.put(
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
