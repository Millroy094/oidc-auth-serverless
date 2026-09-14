import { FC } from 'react';
import { TextField, Grid } from '@mui/material';
import { UseFormRegister } from 'react-hook-form';
import { ILoginFormInput } from './types';

interface UsernameInputProps {
  register: UseFormRegister<ILoginFormInput>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors: Record<string, any>;
}

const UsernameInput: FC<UsernameInputProps> = ({ register, errors }) => {
  return (
    <Grid item>
      <TextField
        {...register('email')}
        label="Email Address"
        variant="outlined"
        fullWidth
        error={!!errors.email}
        helperText={errors.email?.message}
      />
    </Grid>
  );
};

export default UsernameInput;
