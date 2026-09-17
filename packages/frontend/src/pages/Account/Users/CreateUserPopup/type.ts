import { IResourceScopeInput } from '@/components/ResourceScopesField';

export interface ICreateUserPopupInput {
  firstName: string;
  lastName: string;
  email: string;
  mobile?: string;
  roles: string[];
  resources: IResourceScopeInput[];
}
