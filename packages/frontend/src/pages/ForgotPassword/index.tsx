import React from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { SubmitHandler, useForm } from 'react-hook-form';
import schema from './schema';
import PasswordField from '../../components/PasswordField';
import PasswordPopover from '../../components/PasswordPopover';
import sendOtp from '../../api/user/send-otp';
import { FORGOT_PASSWORD } from '../../constants';
import useFeedback from '../../hooks/useFeedback';
import changePassword from '../../api/user/change-password';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { IForgotPasswordFormInput } from './types';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Input } from '../../components/ui/input';

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
    <div className="flex items-center justify-center min-h-screen bg-background">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-sm">
        <Card className="border-t-2 border-red-600 mt-8">
          <CardHeader className="text-center p-6">
            <h1 className="text-2xl font-semibold">Forgot Password</h1>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            {!emailSent && (
              <div>
                <Input
                  {...register('email')}
                  type="email"
                  placeholder="Email Address"
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>
            )}
            {emailSent && (
              <>
                <div>
                  <Input
                    {...register('otp')}
                    placeholder="OTP"
                    className={errors.otp ? 'border-red-500' : ''}
                  />
                  {errors.otp && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.otp.message}
                    </p>
                  )}
                </div>
                <div>
                  <PasswordField
                    name="password"
                    label="Password"
                    onFocus={handleFocus}
                    onBlur={handleClose}
                    register={register}
                    error={!!errors.password}
                  />
                </div>
                <div>
                  <PasswordField
                    name="confirmPassword"
                    label="Confirm Password"
                    onFocus={handleFocus}
                    onBlur={handleClose}
                    register={register}
                    error={!!errors.confirmPassword}
                  />
                </div>
              </>
            )}
            <PasswordPopover
              open={open}
              anchorEl={anchorEl}
              errors={errors}
              dirtyFields={dirtyFields}
            />
          </CardContent>
          <div className="flex justify-between gap-4 p-5">
            <Button 
              type="button" 
              variant="outline" 
              onClick={navigateToLogin}
            >
              Return to login
            </Button>
            <Button type="submit">
              {`${emailSent ? 'Change' : 'Reset'} Password`}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default ForgotPassword;
