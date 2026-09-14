import { FC, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import schema from './schema';
import { useNavigate, useParams } from 'react-router-dom';
import authenticateInteraction from '../../api/oidc/authenticate-interaction';
import useFeedback from '../../hooks/useFeedback';
import { useAuth } from '../../context/AuthProvider';
import getLoginConfiguration from '../../api/user/get-login-configuration';
import {
  EMAIL_VERIFICATION,
  MFA_LOGIN_STAGE,
  PASSWORD_LOGIN_STAGE,
  RECOVERY_CODE_STAGE,
  USERNAME_LOGIN_STAGE,
} from '../../constants';
import { ILoginFormInput } from './types';
import UsernameInput from './UsernameInput';
import PasswordInput from './PasswordInput';
import VerifyMFAOtpInput from './VerifyOtpInput';
import RecoveryCodeInput from './RecoveryCodeInput';
import Logo from '../../assets/logo.svg';
import PasskeyAuthentication from './PasskeyAuthentication';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader } from '../../components/ui/card';

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
    resolver: yupResolver(schema),
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
      mfaType ? setLoginStage(MFA_LOGIN_STAGE) : handleSubmit(onSubmit)();
    } else {
      handleSubmit(onSubmit)();
    }
  };

  const onSubmit = async (data: ILoginFormInput) => {
    try {
      const response = interactionId
        ? await authenticateInteraction({ ...data, interactionId })
        : await Auth?.login(data);

      response?.data.redirect &&
        (window.location.href = response.data.redirect);
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
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-sm border-t-2 border-red-600 mt-8">
        <CardHeader className="p-6">
          <div className="flex items-end gap-4">
            <div className="h-24 w-20 flex items-center">
              <Logo />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-semibold mb-2">Log in</h1>
              {!interactionId && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <span>Not registered?</span>
                  <button
                    onClick={() => navigate('/registration')}
                    className="text-sm text-primary hover:underline cursor-pointer"
                  >
                    Click here
                  </button>
                  <span>to register</span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
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
          className={`flex gap-4 p-5 ${
            loginStage === 'USERNAME' ? 'justify-end' : 'justify-between'
          }`}
        >
          {loginStage !== USERNAME_LOGIN_STAGE &&
            loginStage !== MFA_LOGIN_STAGE && (
              <Button variant="outline" onClick={onReset}>
                Sign in with a different user
              </Button>
            )}
          {loginStage === MFA_LOGIN_STAGE && (
            <Button variant="outline" onClick={loginViaRecoveryCode}>
              Having trouble with MFA?
            </Button>
          )}
          {showButton && (
            <Button onClick={onNextStep}>
              {buttonText}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Login;
