import React from 'react';
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Container,
  Grid,
  styled,
  TextField,
} from '@mui/material';
import PasswordField from '../../components/PasswordField';
import { yupResolver } from '@hookform/resolvers/yup';
import { SubmitHandler, useForm } from 'react-hook-form';
import schema from './schema';
import PasswordPopover from '../../components/PasswordPopover';
import sendOtp from '../../api/user/send-otp';
import { FORGOT_PASSWORD } from '../../constants';
import useFeedback from '../../hooks/useFeedback';
import changePassword from '../../api/user/change-password';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { IForgotPasswordFormInput } from './types';

const StyledCard = styled(Card)({
  borderTop: '2px solid red',
});

const ForgotPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { feedback, feedbackAxiosError, feedbackAxiosResponse } = useFeedback();
  const {
    reset,
    watch,
    register,
    handleSubmit,
    formState: { errors, dirtyFields },
    setValue,
  } = useForm<IForgotPasswordFormInput>({
    resolver: yupResolver(schema, {}),
    criteriaMode: 'all',
    mode: 'onChange',
    defaultValues: {
      email: '',
      emailSent: false,
      otp: '',
      password: '',
      confirmPassword: '',
    },
  });

  const emailSent = watch('emailSent', false);

  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

  const open = Boolean(anchorEl);
  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    setAnchorEl(event.target.parentElement);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const navigateToLogin = () => {
    if (searchParams.has('interactionId')) {
      navigate(`/oauth/login/${searchParams.get('interactionId')}`);
    } else {
      navigate('/login');
    }
  };

  const sendForgotPasswordCode = async (email: string) => {
    await sendOtp({ email, type: FORGOT_PASSWORD });
    feedback(
      'An email with a code to reset password has been send to your email. Please use this code to reset your password.',
      'info',
    );
  };

  const onSubmit: SubmitHandler<IForgotPasswordFormInput> = async (values) => {
    const { email, emailSent, otp, password } = values;
    if (!emailSent) {
      try {
        await sendForgotPasswordCode(email);
        setValue('emailSent', true);
      } catch (err) {
        feedbackAxiosError(err, 'Failed to send password reset email');
      }
    } else if (otp && password) {
      try {
        const response = await changePassword({ email, otp, password });
        feedbackAxiosResponse(
          response,
          'Successfully Reset Password!',
          'success',
        );
        reset();
        navigateToLogin();
      } catch (err) {
        feedbackAxiosError(err, 'Failed to reset password');
      }
    }
  };

  return (
    <Container maxWidth="sm">
      <form onSubmit={handleSubmit(onSubmit)}>
        <StyledCard sx={{ marginTop: 15 }}>
          <CardHeader
            title="Forgot Password"
            titleTypographyProps={{ align: 'center' }}
          />
          <CardContent>
            <Grid container direction="column" spacing={2} sx={{ p: 2 }}>
              {!emailSent && (
                <Grid item>
                  <TextField
                    {...register('email')}
                    label="Email Address"
                    variant="outlined"
                    fullWidth
                    error={!!errors.email}
                    helperText={errors.email ? errors.email.message : ''}
                  />
                </Grid>
              )}
              {emailSent && (
                <>
                  <Grid item>
                    <TextField
                      {...register('otp')}
                      label="OTP"
                      variant="outlined"
                      fullWidth
                      error={!!errors.otp}
                      helperText={errors.otp ? errors.otp.message : ''}
                    />
                  </Grid>
                  <Grid item>
                    <PasswordField
                      name="password"
                      label="Password"
                      onFocus={handleFocus}
                      onBlur={handleClose}
                      register={register}
                      error={!!errors.password}
                    />
                  </Grid>
                  <Grid item>
                    <PasswordField
                      name="confirmPassword"
                      label="Confirm Password"
                      onFocus={handleFocus}
                      onBlur={handleClose}
                      register={register}
                      error={!!errors.confirmPassword}
                    />
                  </Grid>
                </>
              )}
            </Grid>
            <PasswordPopover
              open={open}
              anchorEl={anchorEl}
              errors={errors}
              dirtyFields={dirtyFields}
            />
          </CardContent>
          <CardActions
            sx={{ justifyContent: 'space-between', padding: '20px 20px' }}
          >
            <Button type="submit" color="error" onClick={navigateToLogin}>
              Return to login
            </Button>
            <Button variant="contained" type="submit" color="error">
              {`${emailSent ? 'Change' : 'Reset'} Password`}
            </Button>
          </CardActions>
        </StyledCard>
      </form>
    </Container>
  );
};

export default ForgotPassword;
