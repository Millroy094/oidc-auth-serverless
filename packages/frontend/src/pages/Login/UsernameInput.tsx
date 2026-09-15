import { FC } from 'react';
import { FieldErrors, UseFormRegister } from 'react-hook-form';
import { ILoginFormInput } from './types';
import { Input } from '@/components/ui/input';

interface UsernameInputProps {
  register: UseFormRegister<ILoginFormInput>;
  errors: FieldErrors<ILoginFormInput>;
}

const UsernameInput: FC<UsernameInputProps> = ({ register, errors }) => {
  return (
    <div>
      <Input
        {...register('email')}
        type="email"
        placeholder="Email Address"
        className={errors.email ? 'border-red-500' : ''}
      />
      {errors.email && (
        <p className="text-sm text-red-500 mt-1">{errors.email?.message}</p>
      )}
    </div>
  );
};

export default UsernameInput;
