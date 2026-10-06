import { useSnackbar } from 'notistack';
import { useContext, createContext, useState, FC, ReactElement } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import authenticateInteraction from '@/api/oidc/authenticate-interaction';
import { AuthenticateCredentialsArgs } from '@/api/shared/auth-types';
import authenticateUser from '@/api/user/authenticate-user';
import isAuthenticated from '@/api/user/is-authenticated-user';
import logoutUser from '@/api/user/logout-user';
import TransitionOverlay from '@/components/TransitionOverlay';
import { ACCOUNT_ACTIVE_TAB_STORAGE_KEY } from '@/constants';
import useFeedback from '@/hooks/useFeedback';

interface IUser {
  userId: string;
  email: string;
  roles: string[];
}

export interface ChallengeParameters {
  mfaType?: string;
  userId?: string;
  email?: string;
}

export interface LoginChallenge {
  challengeName: string;
  challengeParameters?: ChallengeParameters;
}

interface LoginResponseLike {
  challengeName?: string;
  challengeParameters?: ChallengeParameters;
  redirect?: string;
  user?: IUser;
}

interface IAuthContext {
  user: IUser | null;
  login: (
    data: AuthenticateCredentialsArgs,
    interactionId?: string,
  ) => Promise<LoginChallenge | void>;
  completeLogin: (responseData: LoginResponseLike) => LoginChallenge | void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isLoggingOut?: boolean;
  isSigningIn?: boolean;
}

const AuthContext = createContext<IAuthContext | null>(null);

const AuthProvider: FC<{ children: ReactElement }> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { feedbackAxiosError } = useFeedback();
  const { enqueueSnackbar } = useSnackbar();

  const completeLogin = (
    responseData: LoginResponseLike,
  ): LoginChallenge | void => {
    const {
      challengeName,
      challengeParameters,
      redirect,
      user: authUser,
    } = responseData;

    if (challengeName === 'LOGIN_SUCCESS' || redirect) {
      if (authUser) {
        setUser(authUser);
      }
      setIsSigningIn(true);
      setTimeout(() => {
        if (redirect) {
          window.location.href = redirect;
        } else {
          setIsSigningIn(false);
          void navigate('/account');
        }
      }, 500);
      return;
    }

    if (challengeName) {
      return { challengeName, challengeParameters };
    }
  };

  const login = async (
    data: AuthenticateCredentialsArgs,
    interactionId?: string,
  ): Promise<LoginChallenge | void> => {
    const response = interactionId
      ? await authenticateInteraction({ ...data, interactionId })
      : await authenticateUser(data);

    return completeLogin(response.data);
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
      setIsLoggingOut(true);
      setTimeout(() => {
        setIsLoggingOut(false);
        void navigate('/login');
      }, 500);
    } catch (err) {
      feedbackAxiosError(err, 'Failed to logout user, please try again.');
      setIsLoggingOut(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        login,
        completeLogin,
        logout,
        refreshUser,
        user,
        isLoggingOut,
        isSigningIn,
      }}
    >
      <TransitionOverlay isVisible={isLoggingOut} message="Logging out..." />
      <TransitionOverlay isVisible={isSigningIn} message="Signing in..." />
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): IAuthContext => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
