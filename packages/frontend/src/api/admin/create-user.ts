import { AxiosResponse } from 'axios';
import { IResourceScope } from './types.ts';
import axios from '@/utils/axios-instance';

type CreateUserFields = {
  firstName: string;
  lastName: string;
  email: string;
  mobile?: string;
  roles: string[];
  resources: IResourceScope[];
};

interface CreateUserResponseData {
  message: string;
}

const createUser = async (
  fields: CreateUserFields,
): Promise<AxiosResponse<CreateUserResponseData>> => {
  const response = await axios.post<CreateUserResponseData>(
    `/api/admin/users/new`,
    fields,
    { withCredentials: true },
  );

  return response;
};

export default createUser;
