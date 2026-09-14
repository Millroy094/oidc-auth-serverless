import React, { FC, useState } from 'react';
import { EyeOff, Eye } from 'lucide-react';
import { UseFormRegister } from 'react-hook-form';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { IRegisterFormInput } from '../pages/Register/types';
import { ILoginFormInput } from '../pages/Login/types';

interface PasswordFieldProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: UseFormRegister<any>;
  name: keyof IRegisterFormInput | keyof ILoginFormInput;
  label?: string;
  required?: boolean;
  error: boolean;
  helperText?: string;
  onFocus?: React.FocusEventHandler;
  onBlur?: React.FocusEventHandler;
}

const PasswordField: FC<PasswordFieldProps> = (props) => {
  const {
    name,
    label,
    register,
    error,
    helperText,
    required,
    onFocus,
    onBlur,
  } = props;
  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault();
  };

  return (
    <div className="w-full space-y-2">
      <label htmlFor={String(name)} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        {label ?? name} {required && <span className="text-destructive">*</span>}
      </label>
      <div className="relative flex items-center">
        <Input
          {...register(name)}
          id={String(name)}
          type={showPassword ? 'text' : 'password'}
          className={error ? 'border-destructive' : ''}
          onFocus={onFocus}
          onBlur={onBlur}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-2 h-8 w-8"
          aria-label="toggle password visibility"
          onClick={handleClickShowPassword}
          onMouseDown={handleMouseDownPassword}
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
      </div>
      {helperText && <p className={`text-sm ${error ? 'text-destructive' : 'text-muted-foreground'}`}>{helperText}</p>}
    </div>
  );
};

export default PasswordField;
