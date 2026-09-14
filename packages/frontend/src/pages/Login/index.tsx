import { FC, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Container,
  Grid,
  Link,
  Typography,
  styled,
} from '@mui/material';
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

const StyledCard = styled(Card)({
  borderTop: '2px solid red',
  marginTop: 15,
});

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
    <Container maxWidth="sm">
      <StyledCard sx={{ marginTop: 15 }}>
        <CardHeader
          title={
            <Grid container spacing={2} justifyContent="center">
              <Grid container item xs={3}>
                <Box sx={{ height: 100, padding: '1 2', display: 'flex' }}>
                  <Logo />
                </Box>
              </Grid>
              <Grid
                xs={9}
                container
                item
                direction="column"
                justifyContent="flex-end"
                alignContent="baseline"
              >
                <Grid item>
                  <Typography variant="h5">Log in</Typography>
                </Grid>
                {!interactionId && (
                  <Grid item>
                    <Box sx={{ display: 'flex', gap: '2px' }}>
                      <Typography variant="caption">Not registered?</Typography>
                      <Link
                        variant="caption"
                        underline="none"
                        sx={{ cursor: 'pointer' }}
                        onClick={() => navigate('/registration')}
                      >
                        Click here
                      </Link>
                      <Typography variant="caption">to register</Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Grid>
          }
        />
        <CardContent>
          <Grid container direction="column" spacing={2} sx={{ p: '2' }}>
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
          </Grid>
        </CardContent>
        <CardActions
          sx={{
            display: 'flex',
            padding: '20px 20px',
            justifyContent:
              loginStage === 'USERNAME' ? 'flex-end' : 'space-between',
          }}
        >
          {loginStage !== USERNAME_LOGIN_STAGE &&
            loginStage !== MFA_LOGIN_STAGE && (
              <Button color="error" onClick={onReset}>
                Sign in with a different user
              </Button>
            )}
          {loginStage === MFA_LOGIN_STAGE && (
            <Button color="error" onClick={loginViaRecoveryCode}>
              Having trouble with MFA?
            </Button>
          )}
          {showButton && (
            <Button variant="contained" color="error" onClick={onNextStep}>
              {buttonText}
            </Button>
          )}
        </CardActions>
      </StyledCard>
    </Container>
  );
};

export default Login;
