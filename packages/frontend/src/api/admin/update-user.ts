import { AxiosResponse } from 'axios';
import { IResourceScope } from './types.ts';
import axios from '@/utils/axios-instance';

type updateUserFields = {
  firstName: string;
  lastName: string;
  emailVerified: boolean;
  mobile?: string;
  roles: string[];
  suspended: boolean;
  resources: IResourceScope[];
};

interface UpdateUserResponseData {
  message: string;
}

const updateUser = async (
  id: string,
  updatedFields: updateUserFields,
): Promise<AxiosResponse<UpdateUserResponseData>> => {
  const {
    emailVerified,
    firstName,
    lastName,
    mobile,
    roles,
    suspended,
    resources,
  } = updatedFields;
  const response = await axios.put<UpdateUserResponseData>(
    `/api/admin/users/${id}`,
    {
      emailVerified,
      firstName,
      lastName,
      mobile,
      roles,
      suspended,
      resources,
    },
    { withCredentials: true },
  );

  return response;
};

export default updateUser;
