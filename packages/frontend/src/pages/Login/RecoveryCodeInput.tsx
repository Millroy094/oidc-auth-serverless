import React, { FC } from 'react';

import {
  Checkbox,
  FormControlLabel,
  Grid,
  TextField,
  Typography,
} from '@mui/material';
import {
  Control,
  Controller,
  FieldErrors,
  UseFormRegister,
} from 'react-hook-form';
import { ILoginFormInput } from './types';

interface IRecoveryCodeInput {
  control: Control<ILoginFormInput>;
  register: UseFormRegister<ILoginFormInput>;
  errors: FieldErrors<ILoginFormInput>;
}

const RecoveryCodeInput: FC<IRecoveryCodeInput> = React.memo((props) => {
  const { register, control, errors } = props;

  return (
    <Grid item container direction="column" spacing={4}>
      <Grid container item justifyContent="center">
        <Typography align="center">
          Please enter one your recovery codes to proceed.
        </Typography>
      </Grid>
      <Grid container item spacing={1}>
        <Grid container item>
          <TextField
            {...register('recoveryCode')}
            label="Recovery Code"
            variant="outlined"
            fullWidth
            error={!!errors.recoveryCode}
            helperText={errors.recoveryCode ? errors.recoveryCode.message : ''}
          />
        </Grid>
        <Grid container item>
          <FormControlLabel
            control={
              <Controller
                name="resetMfa"
                control={control}
                render={({ field: props }) => (
                  <Checkbox
                    color="success"
                    {...props}
                    checked={props.value}
                    onChange={(e) => props.onChange(e.target.checked)}
                  />
                )}
              />
            }
            label="Reset Multi-factor authentication"
          />
        </Grid>
      </Grid>
    </Grid>
  );
});

export default RecoveryCodeInput;
