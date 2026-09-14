import { FC } from 'react';
import { Grid, Button, Typography } from '@mui/material';
import PasswordField from '../../components/PasswordField'; // Ensure you have this component defined
import { UseFormRegister } from 'react-hook-form';
import { ILoginFormInput } from './types'; // Ensure you have this type defined somewhere

interface PasswordInputProps {
  register: UseFormRegister<ILoginFormInput>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors: Record<string, any>;
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
    <Grid container item direction="column" spacing={2}>
      <Grid item>
        <Typography variant="body2">{email}</Typography>
      </Grid>
      <Grid item>
        <PasswordField
          name="password"
          label="Password"
          register={register}
          error={!!errors.password}
          helperText={errors.password?.message}
        />
      </Grid>
      <Grid item alignSelf="flex-end">
        <Button color="error" onClick={navigateToForgotPassword}>
          <Typography variant="caption">Forgot Password?</Typography>
        </Button>
      </Grid>
    </Grid>
  );
};

export default PasswordInput;
