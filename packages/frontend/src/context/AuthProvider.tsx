import { useSnackbar } from 'notistack';
import { useContext, createContext, useState, FC, ReactElement } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import authenticateUser from '@/api/user/authenticate-user';
import isAuthenticated from '@/api/user/is-authenticated-user';
import logoutUser from '@/api/user/logout-user';
import TransitionOverlay from '@/components/TransitionOverlay';
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
  isLoggingOut?: boolean;
  isSigningIn?: boolean;
}

const AuthContext = createContext<IAuthContext | null>(null);

const TRANSITION_OVERLAY_DELAY_MS = 500;

const AuthProvider: FC<{ children: ReactElement }> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { feedbackAxiosError } = useFeedback();
  const { enqueueSnackbar } = useSnackbar();

  const showTransitionThenNavigate = (
    setIsTransitioning: (value: boolean) => void,
    path: string,
  ): void => {
    setIsTransitioning(true);
    setTimeout(() => {
      void navigate(path);
      setIsTransitioning(false);
    }, TRANSITION_OVERLAY_DELAY_MS);
  };

  const login = async (data: ILoginFormInput): Promise<void> => {
    const response = await authenticateUser({
      ...data,
      captchaToken: data.captchaToken ?? '',
    });
    setUser(response.data.user);
    showTransitionThenNavigate(setIsSigningIn, '/account');
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const response = await isAuthenticated();
      setUser(response.data.user);
      await navigate('/account');
    } catch {
      const hadUser = user !== null;
      setUser(null);
      localStorage.removeItem(ACCOUNT_ACTIVE_TAB_STORAGE_KEY);
      await navigate('/login');
      if (hadUser && pathname !== '/') {
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
      showTransitionThenNavigate(setIsLoggingOut, '/login');
    } catch (err) {
      feedbackAxiosError(err, 'Failed to logout user, please try again.');
      setIsLoggingOut(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ login, logout, refreshUser, user, isLoggingOut, isSigningIn }}
    >
      <TransitionOverlay isVisible={isLoggingOut} message="Logging out..." />
      <TransitionOverlay isVisible={isSigningIn} message="Signing in..." />
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  return useContext(AuthContext);
};
