import React, { FC } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import { omit } from 'lodash';
import PasswordField from '../../components/PasswordField';
import schema from './schema';
import PasswordPopover from '../../components/PasswordPopover';
import registerUser from '../../api/user/register-user';
import { useNavigate } from 'react-router-dom';
import useFeedback from '../../hooks/useFeedback';
import { MobileNumberInput } from '../../components/MobileNumberInput';
import { IRegisterFormInput } from './types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import AuthCardLayout from '../../components/AuthCardLayout';

const Register: FC = () => {
  const { feedbackAxiosResponse, feedbackAxiosError } = useFeedback();
  const navigate = useNavigate();
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, dirtyFields },
    reset,
  } = useForm<IRegisterFormInput>({
    resolver: yupResolver(schema, {}),
    criteriaMode: 'all',
    mode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      mobile: '',
    },
  });

  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

  const open = Boolean(anchorEl);
  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    setAnchorEl(event.target.parentElement);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const onSubmit = async (data: IRegisterFormInput): Promise<void> => {
    try {
      const response = await registerUser(omit(data, 'confirmPassword'));
      feedbackAxiosResponse(
        response,
        'Successfully registered user',
        'success',
      );
      reset();
      navigate('/login');
    } catch (err) {
      feedbackAxiosError(
        err,
        'There was an issue registering the user, please try again',
      );
    }
  };

  return (
    <AuthCardLayout>
      <Card className="w-full max-w-sm border-t-4 border-t-primary shadow-xl shadow-slate-200/60 dark:shadow-none">
        <CardHeader className="text-center gap-1.5 p-6 pb-4 sm:p-8 sm:pb-4">
          <CardTitle>Create an account</CardTitle>
          <CardDescription>
            Already registered?{' '}
            <button
              onClick={() => navigate('/login')}
              className="font-medium text-primary underline-offset-4 hover:underline cursor-pointer"
            >
              Sign in
            </button>
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6 sm:px-8 sm:pb-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="firstName" className="text-sm font-medium">
                  First Name <span className="text-destructive">*</span>
                </label>
                <Input
                  {...register('firstName')}
                  id="firstName"
                  className={errors.firstName ? 'border-destructive' : ''}
                />
                {errors.firstName && (
                  <p className="text-sm text-destructive">{errors.firstName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <label htmlFor="lastName" className="text-sm font-medium">
                  Last Name <span className="text-destructive">*</span>
                </label>
                <Input
                  {...register('lastName')}
                  id="lastName"
                  className={errors.lastName ? 'border-destructive' : ''}
                />
                {errors.lastName && (
                  <p className="text-sm text-destructive">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email Address <span className="text-destructive">*</span>
              </label>
              <Input
                {...register('email')}
                id="email"
                type="email"
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div>
              <Controller
                name="mobile"
                control={control}
                render={({ field: { onChange, value, disabled } }) => (
                  <MobileNumberInput
                    label="Mobile Number"
                    onChange={onChange}
                    value={value ?? ''}
                    error={!!errors.mobile}
                    helperText={errors.mobile ? errors.mobile.message : ''}
                    readOnly={disabled ?? false}
                  />
                )}
              />
            </div>

            <div>
              <PasswordField
                name="password"
                label="Password"
                onFocus={handleFocus}
                onBlur={handleClose}
                register={register}
                error={!!errors.password}
                helperText={errors.password?.message}
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
                helperText={errors.confirmPassword?.message}
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit">
                Register
              </Button>
            </div>
          </form>
          <PasswordPopover
            open={open}
            anchorEl={anchorEl}
            errors={errors}
            dirtyFields={dirtyFields}
          />
        </CardContent>
      </Card>
    </AuthCardLayout>
  );
};

export default Register;
