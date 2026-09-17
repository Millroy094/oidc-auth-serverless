import { useSnackbar } from 'notistack';
import { useContext, createContext, useState, FC, ReactElement } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import authenticateUser from '@/api/user/authenticate-user';
import isAuthenticated from '@/api/user/is-authenticated-user';
import logoutUser from '@/api/user/logout-user';
import { ACCOUNT_ACTIVE_TAB_STORAGE_KEY } from '@/constants';
import useFeedback from '@/hooks/useFeedback';
import { ILoginFormInput } from '@/pages/Login/types';

interface IUser {
  userId: string;
  email: string;
  roles: string[];
}

interface IAuthContext {
  user: IUser | null;
  login: (data: ILoginFormInput) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<IAuthContext | null>(null);

const AuthProvider: FC<{ children: ReactElement }> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { feedbackAxiosError } = useFeedback();
  const { enqueueSnackbar } = useSnackbar();

  const login = async (data: ILoginFormInput): Promise<void> => {
    try {
      const response = await authenticateUser({
        ...data,
      });
      setUser(response.data.user);
      await navigate('/account');
    } catch (err) {
      feedbackAxiosError(
        err,
        'Failed to authenticate credentials, please try again.',
      );
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const response = await isAuthenticated();
      setUser(response.data.user);
      await navigate('/account');
    } catch {
      await logout();
      if (pathname !== '/') {
        enqueueSnackbar('Session expired, please login again', {
          variant: 'error',
        });
      }
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await logoutUser();
      setUser(null);
      localStorage.removeItem(ACCOUNT_ACTIVE_TAB_STORAGE_KEY);
      await navigate('/login');
    } catch (err) {
      feedbackAxiosError(err, 'Failed to logout user, please try again.');
    }
  };

  return (
    <AuthContext.Provider value={{ login, logout, refreshUser, user }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  return useContext(AuthContext);
};
