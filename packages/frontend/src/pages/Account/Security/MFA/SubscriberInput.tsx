import React, { FC } from 'react';
import { MobileNumberInput } from '@/components/MobileNumberInput';
import { EnterableInput } from '@/components/ui/enterable-input';
import { APP_MFA, EMAIL_MFA, SMS_MFA } from '@/constants';

interface ISubscriberInput {
  value: string;
  onChange: React.Dispatch<React.SetStateAction<string>>;
  type: string;
  error: boolean;
  disabled: boolean;
  onEnter?: () => void;
}

const SubscriberInput: FC<ISubscriberInput> = (props) => {
  const { value, onChange, type, error, disabled, onEnter } = props;
  const onChangeTextField = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const onChangePhoneNumber = (value: string) => {
    onChange(value);
  };

  if (type === APP_MFA) {
    return (
      <div className="w-full">
        <label htmlFor="subscriber" className="block text-sm font-medium mb-1">
          Device Name
        </label>
        <EnterableInput
          id="subscriber"
          name="subscriber"
          onChange={onChangeTextField}
          value={value}
          disabled={disabled}
          className={error ? 'border-red-500' : ''}
          onEnter={onEnter}
        />
        {error && <p className="text-sm text-red-500 mt-1">Required</p>}
      </div>
    );
  } else if (type === SMS_MFA) {
    return (
      <div className="w-full">
        <MobileNumberInput
          label="Mobile Number"
          onChange={onChangePhoneNumber}
          value={value}
          error={error}
          helperText={error ? 'Invalid number' : ''}
          disabled={disabled}
          onEnter={onEnter}
        />
      </div>
    );
  } else if (type === EMAIL_MFA) {
    return (
      <div className="w-full">
        <label htmlFor="subscriber" className="block text-sm font-medium mb-1">
          Email
        </label>
        <EnterableInput
          id="subscriber"
          name="subscriber"
          onChange={onChangeTextField}
          value={value}
          type="email"
          disabled={disabled}
          className={error ? 'border-red-500' : ''}
          onEnter={onEnter}
        />
        {error && <p className="text-sm text-red-500 mt-1">Invalid Email</p>}
      </div>
    );
  }

  return null;
};

export default SubscriberInput;
