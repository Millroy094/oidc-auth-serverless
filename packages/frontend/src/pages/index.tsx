import { lazy, Suspense, useEffect } from 'react';
import { MutatingDots } from 'react-loader-spinner';
import {
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';
import { useAuth } from '@/context/AuthProvider';
import { PUBLIC_ROUTES, DYNAMIC_PUBLIC_ROUTES } from '@/constants';
import globalRouter from '@/utils/global-router';
import PasskeyRegisterComponent from './PasskeyRegister';

const Login = lazy(() => import('./Login'));
const Confirm = lazy(() => import('./Confirm'));
const Register = lazy(() => import('./Register'));
const ForgotPassword = lazy(() => import('./ForgotPassword'));
const Account = lazy(() => import('./Account'));

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
  const auth = useAuth();
  globalRouter.navigate = navigate;

  useEffect(() => {
    if (
      !PUBLIC_ROUTES.includes(pathname) &&
      !DYNAMIC_PUBLIC_ROUTES.some((route) => pathname.startsWith(route)) &&
      pathname !== '/login'
    ) {
      void auth.refreshUser();
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
        <Route path={`/oidc/login/:interactionId`} element={<Login />} />
        <Route path={`/oidc/consent/:interactionId`} element={<Confirm />} />
        <Route
          path={`/passkey-register/:sessionId`}
          element={<PasskeyRegisterRoute />}
        />
      </Routes>
    </Suspense>
  );
}

export default Pages;
