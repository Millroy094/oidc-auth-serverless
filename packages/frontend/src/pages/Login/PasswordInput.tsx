import { FC } from 'react';
import { FieldErrors, UseFormRegister } from 'react-hook-form';
import { ILoginFormInput } from './types';
import PasswordField from '@/components/PasswordField';
import { Button } from '@/components/ui/button';

interface PasswordInputProps {
  register: UseFormRegister<ILoginFormInput>;
  errors: FieldErrors<ILoginFormInput>;
  email: string;
  navigateToForgotPassword: () => void;
}

const PasswordInput: FC<PasswordInputProps> = ({
  register,
  errors,
  email,
  navigateToForgotPassword,
}) => {
  return (
    <div className="space-y-4">
      <div className="text-sm text-foreground">{email}</div>
      <div>
        <PasswordField
          name="password"
          label="Password"
          register={register}
          error={!!errors.password}
          helperText={errors.password?.message}
        />
      </div>
      <div className="flex justify-end">
        <Button
          variant="link"
          onClick={navigateToForgotPassword}
          className="text-sm p-0 h-auto"
        >
          Forgot Password?
        </Button>
      </div>
    </div>
  );
};

export default PasswordInput;
