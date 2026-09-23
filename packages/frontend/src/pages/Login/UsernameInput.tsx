import { FC } from 'react';
import { FieldErrors, UseFormRegister } from 'react-hook-form';
import { ILoginFormInput } from './types';
import { EnterableInput } from '@/components/ui/enterable-input';

interface UsernameInputProps {
  register: UseFormRegister<ILoginFormInput>;
  errors: FieldErrors<ILoginFormInput>;
  onEnter?: () => void;
}

const UsernameInput: FC<UsernameInputProps> = ({
  register,
  errors,
  onEnter,
}) => {
  return (
    <div>
      <EnterableInput
        {...register('email')}
        type="email"
        placeholder="Email Address"
        className={errors.email ? 'border-red-500' : ''}
        onEnter={onEnter}
      />
      {errors.email && (
        <p className="text-sm text-red-500 mt-1">{errors.email?.message}</p>
      )}
    </div>
  );
};

export default UsernameInput;
