import { EyeOff, Eye } from 'lucide-react';
import React, { useState } from 'react';
import { FieldValues, Path, UseFormRegister } from 'react-hook-form';
import { Button } from './ui/button';
import { EnterableInput } from './ui/enterable-input';

interface PasswordFieldProps<T extends FieldValues> {
  register: UseFormRegister<T>;
  name: Path<T>;
  label?: string;
  required?: boolean;
  error: boolean;
  helperText?: string;
  onFocus?: React.FocusEventHandler;
  onBlur?: React.FocusEventHandler;
  onEnter?: () => void | Promise<void>;
}

const PasswordField = <T extends FieldValues>(props: PasswordFieldProps<T>) => {
  const {
    name,
    label,
    register,
    error,
    helperText,
    required,
    onFocus,
    onBlur,
    onEnter,
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
      <label
        htmlFor={String(name)}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {label ?? name}{' '}
        {required && <span className="text-destructive">*</span>}
      </label>
      <div className="relative flex items-center">
        <EnterableInput
          {...register(name)}
          id={String(name)}
          type={showPassword ? 'text' : 'password'}
          className={error ? 'border-destructive' : ''}
          onFocus={onFocus}
          onBlur={onBlur}
          onEnter={onEnter}
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
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </Button>
      </div>
      {helperText && (
        <p
          className={`text-sm ${error ? 'text-destructive' : 'text-muted-foreground'}`}
        >
          {helperText}
        </p>
      )}
    </div>
  );
};

export default PasswordField;
