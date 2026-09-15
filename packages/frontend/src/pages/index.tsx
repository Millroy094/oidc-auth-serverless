import { lazy, Suspense, useEffect } from 'react';
import { MutatingDots } from 'react-loader-spinner';
import {
  Route,
  Routes,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import getInteractionStatus from '@/api/oidc/get-interaction-status';
import { PUBLIC_ROUTES } from '@/constants';
import { useAuth } from '@/context/AuthProvider';
import useFeedback from '@/hooks/useFeedback';
import globalRouter from '@/utils/global-router';

const Login = lazy(() => import('./Login'));
const Confirm = lazy(() => import('./Confirm'));
const Register = lazy(() => import('./Register'));
const ForgotPassword = lazy(() => import('./ForgotPassword'));
const Account = lazy(() => import('./Account'));

function Pages() {
  const { feedbackAxiosError } = useFeedback();
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const Auth = useAuth();
  globalRouter.navigate = navigate;

  const navigateByInteractionStage = async (
    interactionId: string,
  ): Promise<void> => {
    try {
      const response = await getInteractionStatus(interactionId);
      if (response.data.status) {
        await navigate(
          `/oauth/${response.data.status}/${searchParams.get('interactionId')}`,
        );
      }
    } catch (err) {
      feedbackAxiosError(err, 'Failed to process authentication');
    }
  };

  useEffect(() => {
    if (pathname === '/' && searchParams.has('interactionId')) {
      void navigateByInteractionStage(searchParams.get('interactionId') ?? '');
    } else if (!PUBLIC_ROUTES.includes(pathname) && pathname !== '/login') {
      void Auth?.refreshUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Suspense
      fallback={
        <div className="max-w-2xl mx-auto min-h-[500px] flex justify-center items-center">
          <MutatingDots
            visible
            height="100"
            width="100"
            color="#4fa94d"
            secondaryColor="#4fa94d"
            radius="12.5"
            ariaLabel="mutating-dots-loading"
            wrapperStyle={{}}
            wrapperClass=""
          />
        </div>
      }
    >
      <Routes>
        <Route path={`/registration`} element={<Register />} />
        <Route path={`/login`} element={<Login />} />
        <Route path={`/forgot-password`} element={<ForgotPassword />} />
        <Route path={`/account`} element={<Account />} />
        <Route path={`/oauth/login/:interactionId`} element={<Login />} />
        <Route path={`/oauth/consent/:interactionId`} element={<Confirm />} />
      </Routes>
    </Suspense>
  );
}

export default Pages;
