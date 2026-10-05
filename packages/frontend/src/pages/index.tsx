import { lazy, Suspense, useEffect } from 'react';
import { MutatingDots } from 'react-loader-spinner';
import {
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';
import getInteractionStatus from '@/api/oidc/get-interaction-status';
import { PUBLIC_ROUTES } from '@/constants';
import { useAuth } from '@/context/AuthProvider';
import useFeedback from '@/hooks/useFeedback';
import globalRouter from '@/utils/global-router';
import PasskeyRegisterComponent from './PasskeyRegister';

const Login = lazy(() => import('./Login'));
const Confirm = lazy(() => import('./Confirm'));
const Register = lazy(() => import('./Register'));
const ForgotPassword = lazy(() => import('./ForgotPassword'));
const Account = lazy(() => import('./Account'));

function InteractionEntry() {
  const { interactionId } = useParams();
  const navigate = useNavigate();
  const { feedbackAxiosError } = useFeedback();

  useEffect(() => {
    const navigateByInteractionStage = async (): Promise<void> => {
      if (!interactionId) {
        return;
      }

      try {
        const response = await getInteractionStatus(interactionId);
        if (response.data.status) {
          await navigate(`/oauth/${response.data.status}/${interactionId}`);
        }
      } catch (err) {
        feedbackAxiosError(err, 'Failed to process authentication');
        // The interaction this link/redirect pointed at is gone (expired,
        // already completed, or never existed) - there's nothing more this
        // route can do with it, so send the user back to start a fresh
        // login rather than leaving them on a blank page.
        await navigate('/login');
      }
    };

    void navigateByInteractionStage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interactionId]);

  return null;
}

function PasskeyRegisterRoute() {
  const { sessionId } = useParams();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <PasskeyRegisterComponent sessionId={sessionId} />
    </div>
  );
}

function Pages() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const Auth = useAuth();
  globalRouter.navigate = navigate;

  // The `/interaction/:interactionId` entry route kicks off an OIDC
  // interaction and shouldn't trigger a refreshUser() call before the
  // interaction status redirect has had a chance to run.
  const isDynamicInteractionEntry = pathname.startsWith('/interaction/');

  useEffect(() => {
    if (
      !isDynamicInteractionEntry &&
      !PUBLIC_ROUTES.includes(pathname) &&
      pathname !== '/login'
    ) {
      void Auth?.refreshUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Suspense
      fallback={
        <div className="max-w-2xl mx-auto min-h-125 flex justify-center items-center">
          <MutatingDots
            visible
            height="100"
            width="100"
            color="hsl(var(--primary))"
            secondaryColor="hsl(var(--primary))"
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
        <Route
          path={`/passkey-register/:sessionId`}
          element={<PasskeyRegisterRoute />}
        />
        <Route
          path={`/interaction/:interactionId`}
          element={<InteractionEntry />}
        />
      </Routes>
    </Suspense>
  );
}

export default Pages;
