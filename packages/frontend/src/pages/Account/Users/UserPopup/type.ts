export interface IUserPopupInput {
  firstName: string;
  lastName: string;
  email: string;
  emailVerified: boolean;
  mobile?: string;
  roles: string[];
  suspended: boolean;
  lastLoggedIn?: number;
}
