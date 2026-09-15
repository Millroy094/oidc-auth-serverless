import React, { FC } from 'react';
import {
  Control,
  Controller,
  FieldErrors,
  UseFormRegister,
} from 'react-hook-form';
import { ILoginFormInput } from './types';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';

interface IRecoveryCodeInput {
  control: Control<ILoginFormInput>;
  register: UseFormRegister<ILoginFormInput>;
  errors: FieldErrors<ILoginFormInput>;
}

const RecoveryCodeInput: FC<IRecoveryCodeInput> = React.memo((props) => {
  const { register, control, errors } = props;

  return (
    <div className="space-y-6">
      <div className="text-center text-sm text-foreground">
        Please enter one your recovery codes to proceed.
      </div>
      <div className="space-y-4">
        <div>
          <Input
            {...register('recoveryCode')}
            placeholder="Recovery Code"
            className={errors.recoveryCode ? 'border-red-500' : ''}
          />
          {errors.recoveryCode && (
            <p className="text-sm text-red-500 mt-1">
              {errors.recoveryCode.message}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Controller
            name="resetMfa"
            control={control}
            render={({ field: props }) => (
              <Checkbox
                id="resetMfa"
                checked={props.value}
                onCheckedChange={props.onChange}
              />
            )}
          />
          <label
            htmlFor="resetMfa"
            className="text-sm text-foreground cursor-pointer"
          >
            Reset Multi-factor authentication
          </label>
        </div>
      </div>
    </div>
  );
});

export default RecoveryCodeInput;
