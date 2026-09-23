import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import schema from './schema';
import { IForgotPasswordFormInput } from './types';
import changePassword from '@/api/user/change-password';
import sendOtp from '@/api/user/send-otp';
import AuthCardLayout from '@/components/AuthCardLayout';
import PasswordField from '@/components/PasswordField';
import PasswordPopover from '@/components/PasswordPopover';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { FORGOT_PASSWORD } from '@/constants';
import useFeedback from '@/hooks/useFeedback';

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
    resolver: zodResolver(schema, {}),
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
      void navigate(`/oauth/login/${searchParams.get('interactionId')}`);
    } else {
      void navigate('/login');
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
    <AuthCardLayout>
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-sm">
        <Card className="border-t-4 border-t-primary shadow-xl shadow-slate-200/60">
          <CardHeader className="text-center p-6 pb-4 sm:p-8 sm:pb-4">
            <h1 className="text-2xl font-semibold tracking-tight">
              Forgot Password
            </h1>
          </CardHeader>
          <CardContent className="space-y-4 px-6 pb-6 sm:px-8 sm:pb-8">
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
          <div className="flex flex-col-reverse gap-3 px-6 pb-6 sm:flex-row sm:justify-between sm:gap-4 sm:px-8 sm:pb-8">
            <Button
              type="button"
              variant="outline"
              onClick={navigateToLogin}
              className="w-full sm:w-auto"
            >
              Return to login
            </Button>
            <Button type="submit" className="w-full sm:w-auto">
              {`${emailSent ? 'Change' : 'Reset'} Password`}
            </Button>
          </div>
        </Card>
      </form>
    </AuthCardLayout>
  );
};

export default ForgotPassword;
