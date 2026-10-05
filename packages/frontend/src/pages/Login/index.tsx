import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { FC, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import PasskeyAuthentication from './PasskeyAuthentication';
import PasswordInput from './PasswordInput';
import RecoveryCodeInput from './RecoveryCodeInput';
import schema from './schema';
import { ILoginFormInput } from './types';
import UsernameInput from './UsernameInput';
import VerifyMFAOtpInput from './VerifyOtpInput';
import authenticateInteraction from '@/api/oidc/authenticate-interaction';
import authenticateUser from '@/api/user/authenticate-user';
import getLoginConfiguration from '@/api/user/get-login-configuration';
import getPublicConfig from '@/api/user/get-public-config';
import Logo from '@/assets/logo.svg';
import AuthCardLayout from '@/components/AuthCardLayout';
import TransitionOverlay from '@/components/TransitionOverlay';
import Turnstile from '@/components/Turnstile';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  EMAIL_VERIFICATION,
  MFA_LOGIN_STAGE,
  PASSWORD_LOGIN_STAGE,
  RECOVERY_CODE_STAGE,
  USERNAME_LOGIN_STAGE,
} from '@/constants';
import useFeedback from '@/hooks/useFeedback';

type ILoginStage = 'USERNAME' | 'PASSWORD' | 'MFA' | 'RECOVERY_CODE';

interface ChallengeParameters {
  mfaType?: string;
  userId?: string;
  email?: string;
}

const Login: FC = () => {
  const [loginStage, setLoginStage] = useState<ILoginStage>('USERNAME');
  const [turnstileSiteKey, setTurnstileSiteKey] = useState<string>('');
  const [registrationEnabled, setRegistrationEnabled] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const { interactionId } = useParams();
  const navigate = useNavigate();
  const { feedbackAxiosError } = useFeedback();

  const {
    control,
    reset,
    setValue,
    getValues,
    watch,
    trigger,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ILoginFormInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: '',
      mfaType: '',
      otp: '',
      loginWithRecoveryCode: false,
      recoveryCode: '',
      resetMfa: false,
      captchaToken: '',
    },
  });

  const email = getValues('email');
  const mfaType = getValues('mfaType');
  const captchaToken = watch('captchaToken');

  useEffect(() => {
    const fetchPublicConfig = async () => {
      const response = await getPublicConfig();
      setTurnstileSiteKey(response.data.turnstileSiteKey);
      setRegistrationEnabled(response.data.registrationEnabled);
    };
    void fetchPublicConfig();
  }, []);

  const onReset = () => {
    setLoginStage(USERNAME_LOGIN_STAGE);
    reset();
  };

  const handleEmailVerification = async () => {
    try {
      const email = getValues('email');
      const { data } = await getLoginConfiguration(email);
      setValue(
        'mfaType',
        !data.emailVerified ? EMAIL_VERIFICATION : data.mfa.type,
      );
    } catch (err) {
      feedbackAxiosError(err, 'Failed to retrieve login configuration');
    }
  };

  const handleChallenge = (
    challengeName: string,
    challengeParameters?: ChallengeParameters,
  ) => {
    if (challengeName === 'EMAIL_VERIFICATION_REQUIRED') {
      setLoginStage(MFA_LOGIN_STAGE);
      setValue('mfaType', EMAIL_VERIFICATION);
      setIsLoading(false);
    } else if (challengeName === 'MFA_REQUIRED') {
      const mfaType = challengeParameters?.mfaType ?? '';
      setValue('mfaType', mfaType);
      setLoginStage(MFA_LOGIN_STAGE);
      setIsLoading(false);
    }
  };

  const handleAuthenticationSuccess = (redirect?: string) => {
    setIsAuthenticating(true);
    setTimeout(() => {
      window.location.href = redirect || '/account';
    }, 500);
  };

  const authenticatePasswordStage = async () => {
    setIsLoading(true);
    try {
      const response = interactionId
        ? await authenticateInteraction({
            ...getValues(),
            captchaToken: getValues('captchaToken') ?? '',
            interactionId,
          })
        : await authenticateUser({
            email: getValues('email'),
            password: getValues('password'),
            captchaToken: getValues('captchaToken') ?? '',
          });

      if (!response || !response.data) {
        throw new Error('Invalid response from authentication');
      }

      const responseData = response.data;
      const challengeName =
        'challengeName' in responseData
          ? responseData.challengeName
          : undefined;
      const redirect =
        'redirect' in responseData ? responseData.redirect : undefined;

      if (challengeName === 'LOGIN_SUCCESS' || redirect) {
        handleAuthenticationSuccess(redirect);
      } else if (challengeName) {
        const challengeParams =
          'challengeParameters' in responseData
            ? responseData.challengeParameters
            : undefined;
        handleChallenge(String(challengeName), challengeParams);
      }
    } catch (err) {
      feedbackAxiosError(
        err,
        'Failed to authenticate credentials, please try again.',
      );
      setIsLoading(false);
    }
  };

  const authenticateMfaOrRecovery = async (data: ILoginFormInput) => {
    setIsLoading(true);
    try {
      const response = interactionId
        ? await authenticateInteraction({
            ...data,
            captchaToken: data.captchaToken ?? '',
            interactionId,
          })
        : await authenticateUser({
            ...data,
            captchaToken: data.captchaToken ?? '',
          });

      if (!response || !response.data) {
        throw new Error('Invalid response from authentication');
      }

      const responseData = response.data;
      const challengeName =
        'challengeName' in responseData
          ? responseData.challengeName
          : undefined;
      const redirect =
        'redirect' in responseData ? responseData.redirect : undefined;

      if (challengeName === 'LOGIN_SUCCESS' || redirect) {
        handleAuthenticationSuccess(redirect);
      } else {
        setIsLoading(false);
      }
    } catch (err) {
      feedbackAxiosError(err, 'Failed to authenticate, please try again.');
      setIsLoading(false);
    }
  };

  const onNextStep = async () => {
    if (loginStage === USERNAME_LOGIN_STAGE && (await trigger('email'))) {
      await handleEmailVerification();
      setLoginStage(PASSWORD_LOGIN_STAGE);
    } else if (
      loginStage === PASSWORD_LOGIN_STAGE &&
      (await trigger('password'))
    ) {
      await authenticatePasswordStage();
    } else {
      await handleSubmit(onSubmit)();
    }
  };

  const onSubmit = async (data: ILoginFormInput) => {
    await authenticateMfaOrRecovery(data);
  };

  const navigateToForgotPassword = () =>
    navigate(
      `/forgot-password${interactionId ? `?interactionId=${interactionId}` : ''}`,
    );
  const loginViaRecoveryCode = () => {
    setValue('loginWithRecoveryCode', true);
    setLoginStage(RECOVERY_CODE_STAGE);
  };
  const goBackToPassword = () => {
    setLoginStage(PASSWORD_LOGIN_STAGE);
    setValue('otp', '');
    setValue('recoveryCode', '');
  };

  const showButton = !(mfaType === 'passkey' && loginStage === MFA_LOGIN_STAGE);
  const buttonText =
    [MFA_LOGIN_STAGE, RECOVERY_CODE_STAGE].includes(loginStage) ||
    (loginStage === PASSWORD_LOGIN_STAGE && !mfaType)
      ? 'Sign in'
      : 'Next';
  return (
    <AuthCardLayout>
      <TransitionOverlay isVisible={isAuthenticating} />
      <Card className="w-full max-w-sm border-t-4 border-t-primary shadow-xl shadow-slate-200/60">
        <CardHeader className="items-center text-center gap-3 p-6 pb-4 sm:p-8 sm:pb-4">
          <div className="h-16 w-16">
            <Logo />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-2xl font-semibold tracking-tight">
              Welcome back
            </h1>
            {!interactionId && registrationEnabled && (
              <p className="text-sm text-muted-foreground">
                Not registered?{' '}
                <button
                  onClick={() => navigate('/registration')}
                  className="font-medium text-primary underline-offset-4 hover:underline cursor-pointer"
                >
                  Create an account
                </button>
              </p>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4 px-6 pb-6 sm:px-8 sm:pb-8">
          {loginStage === USERNAME_LOGIN_STAGE && (
            <UsernameInput
              register={register}
              errors={errors}
              onEnter={onNextStep}
            />
          )}
          {loginStage === USERNAME_LOGIN_STAGE && turnstileSiteKey && (
            <Turnstile
              siteKey={turnstileSiteKey}
              onVerify={(token) => setValue('captchaToken', token)}
              onExpire={() => setValue('captchaToken', '')}
            />
          )}
          {loginStage === PASSWORD_LOGIN_STAGE && (
            <PasswordInput
              register={register}
              errors={errors}
              email={email}
              navigateToForgotPassword={navigateToForgotPassword}
              onEnter={onNextStep}
            />
          )}
          {loginStage === MFA_LOGIN_STAGE && mfaType !== 'passkey' && (
            <VerifyMFAOtpInput
              email={email}
              control={control}
              type={mfaType ?? ''}
              onEnter={onNextStep}
            />
          )}
          {loginStage === MFA_LOGIN_STAGE && mfaType === 'passkey' && (
            <PasskeyAuthentication
              email={email}
              handleSubmit={handleSubmit(onSubmit)}
              interactionId={interactionId}
            />
          )}
          {loginStage === RECOVERY_CODE_STAGE && (
            <RecoveryCodeInput
              register={register}
              control={control}
              errors={errors}
              onEnter={onNextStep}
            />
          )}
        </CardContent>
        <div className="px-6 pb-5 sm:px-8 sm:pb-6">
          <div
            className={`flex gap-3 ${loginStage === MFA_LOGIN_STAGE ? 'justify-between mb-3' : loginStage === 'USERNAME' ? 'justify-end' : 'justify-between'}`}
          >
            {loginStage !== USERNAME_LOGIN_STAGE &&
              loginStage !== MFA_LOGIN_STAGE && (
                <Button
                  variant="outline"
                  onClick={onReset}
                  disabled={isLoading}
                  className="w-full sm:w-auto"
                >
                  Sign in with a different user
                </Button>
              )}
            {loginStage === MFA_LOGIN_STAGE && (
              <Button
                variant="outline"
                onClick={goBackToPassword}
                disabled={isLoading || mfaType === 'passkey'}
                className="w-full sm:w-auto text-sm"
              >
                Back
              </Button>
            )}
            {showButton && (
              <Button
                onClick={onNextStep}
                disabled={isLoading || (!!turnstileSiteKey && !captchaToken)}
                className="w-full sm:w-auto whitespace-nowrap"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  buttonText
                )}
              </Button>
            )}
          </div>
          {loginStage === MFA_LOGIN_STAGE && (
            <div className="flex justify-center pt-2 border-t border-border">
              <Button
                variant="link"
                onClick={loginViaRecoveryCode}
                disabled={isLoading || mfaType === 'passkey'}
                className="text-xs sm:text-sm"
              >
                Having trouble with MFA?
              </Button>
            </div>
          )}
        </div>
      </Card>
    </AuthCardLayout>
  );
};

export default Login;
