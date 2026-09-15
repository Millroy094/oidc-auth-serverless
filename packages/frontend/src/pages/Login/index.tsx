import { zodResolver } from '@hookform/resolvers/zod';
import { FC, useState } from 'react';
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
import getLoginConfiguration from '@/api/user/get-login-configuration';
import Logo from '@/assets/logo.svg';
import AuthCardLayout from '@/components/AuthCardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  EMAIL_VERIFICATION,
  MFA_LOGIN_STAGE,
  PASSWORD_LOGIN_STAGE,
  RECOVERY_CODE_STAGE,
  USERNAME_LOGIN_STAGE,
} from '@/constants';
import { useAuth } from '@/context/AuthProvider';
import useFeedback from '@/hooks/useFeedback';

type ILoginStage = 'USERNAME' | 'PASSWORD' | 'MFA' | 'RECOVERY_CODE';

const Login: FC = () => {
  const [loginStage, setLoginStage] = useState<ILoginStage>('USERNAME');
  const { interactionId } = useParams();
  const navigate = useNavigate();
  const { feedbackAxiosError } = useFeedback();
  const Auth = useAuth();

  const {
    control,
    reset,
    setValue,
    getValues,
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
    },
  });

  const email = getValues('email');
  const mfaType = getValues('mfaType');

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

  const onNextStep = async () => {
    if (loginStage === USERNAME_LOGIN_STAGE && (await trigger('email'))) {
      await handleEmailVerification();
      setLoginStage(PASSWORD_LOGIN_STAGE);
    } else if (
      loginStage === PASSWORD_LOGIN_STAGE &&
      (await trigger('password'))
    ) {
      if (mfaType) {
        setLoginStage(MFA_LOGIN_STAGE);
      } else {
        await handleSubmit(onSubmit)();
      }
    } else {
      await handleSubmit(onSubmit)();
    }
  };

  const onSubmit = async (data: ILoginFormInput) => {
    try {
      const response = interactionId
        ? await authenticateInteraction({ ...data, interactionId })
        : await Auth?.login(data);

      if (response?.data.redirect) {
        window.location.href = response.data.redirect;
      }
    } catch (err) {
      feedbackAxiosError(
        err,
        'Failed to authenticate credentials, please try again.',
      );
    }
    onReset();
  };

  const navigateToForgotPassword = () =>
    navigate(
      `/forgot-password${interactionId ? `?interactionId=${interactionId}` : ''}`,
    );
  const loginViaRecoveryCode = () => {
    setValue('loginWithRecoveryCode', true);
    setLoginStage(RECOVERY_CODE_STAGE);
  };

  const showButton = !(mfaType === 'passkey' && loginStage === MFA_LOGIN_STAGE);
  const buttonText =
    [MFA_LOGIN_STAGE, RECOVERY_CODE_STAGE].includes(loginStage) ||
    (loginStage === PASSWORD_LOGIN_STAGE && !mfaType)
      ? 'Sign in'
      : 'Next';
  return (
    <AuthCardLayout>
      <Card className="w-full max-w-sm border-t-4 border-t-primary shadow-xl shadow-slate-200/60 dark:shadow-none">
        <CardHeader className="items-center text-center gap-3 p-6 pb-4 sm:p-8 sm:pb-4">
          <div className="h-16 w-16">
            <Logo />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-2xl font-semibold tracking-tight">
              Welcome back
            </h1>
            {!interactionId && (
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
            <UsernameInput register={register} errors={errors} />
          )}
          {loginStage === PASSWORD_LOGIN_STAGE && (
            <PasswordInput
              register={register}
              errors={errors}
              email={email}
              navigateToForgotPassword={navigateToForgotPassword}
            />
          )}
          {loginStage === MFA_LOGIN_STAGE && mfaType !== 'passkey' && (
            <VerifyMFAOtpInput
              email={email}
              control={control}
              type={mfaType ?? ''}
            />
          )}
          {loginStage === MFA_LOGIN_STAGE && mfaType === 'passkey' && (
            <PasskeyAuthentication
              email={email}
              handleSubmit={handleSubmit(onSubmit)}
            />
          )}
          {loginStage === RECOVERY_CODE_STAGE && (
            <RecoveryCodeInput
              register={register}
              control={control}
              errors={errors}
            />
          )}
        </CardContent>
        <div
          className={`flex flex-col-reverse gap-3 px-6 pb-6 sm:flex-row sm:gap-4 sm:px-8 sm:pb-8 ${
            loginStage === 'USERNAME' ? 'sm:justify-end' : 'sm:justify-between'
          }`}
        >
          {loginStage !== USERNAME_LOGIN_STAGE &&
            loginStage !== MFA_LOGIN_STAGE && (
              <Button
                variant="outline"
                onClick={onReset}
                className="w-full sm:w-auto"
              >
                Sign in with a different user
              </Button>
            )}
          {loginStage === MFA_LOGIN_STAGE && (
            <Button
              variant="outline"
              onClick={loginViaRecoveryCode}
              className="w-full sm:w-auto"
            >
              Having trouble with MFA?
            </Button>
          )}
          {showButton && (
            <Button onClick={onNextStep} className="w-full sm:w-auto">
              {buttonText}
            </Button>
          )}
        </div>
      </Card>
    </AuthCardLayout>
  );
};

export default Login;
