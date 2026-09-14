import { TextField } from '@mui/material';
import React, { FC } from 'react';
import { MobileNumberInput } from '../../../../components/MobileNumberInput';
import { APP_MFA, EMAIL_MFA, SMS_MFA } from '../../../../constants';
interface ISubscriberInput {
  value: string;
  onChange: React.Dispatch<React.SetStateAction<string>>;
  type: string;
  error: boolean;
  disabled: boolean;
}

const SubscriberInput: FC<ISubscriberInput> = (props) => {
  const { value, onChange, type, error, disabled } = props;
  const onChangeTextField = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const onChangePhoneNumber = (value: string) => {
    onChange(value);
  };

  if (type === APP_MFA) {
    return (
      <TextField
        label="Device Name"
        name="subscriber"
        onChange={onChangeTextField}
        value={value}
        fullWidth
        error={error}
        helperText={error ? 'Required' : ''}
        disabled={disabled}
      />
    );
  } else if (type === SMS_MFA) {
    return (
      <MobileNumberInput
        name="subscriber"
        onChange={onChangePhoneNumber}
        value={value}
        fullWidth
        error={error}
        helperText={error ? 'Invalid number' : ''}
        disabled={disabled}
      />
    );
  } else if (type === EMAIL_MFA) {
    return (
      <TextField
        label="Email"
        name="subscriber"
        onChange={onChangeTextField}
        value={value}
        type="email"
        fullWidth
        error={error}
        helperText={error ? 'Invalid Email' : ''}
        disabled={disabled}
      />
    );
  }

  return null;
};

export default SubscriberInput;
