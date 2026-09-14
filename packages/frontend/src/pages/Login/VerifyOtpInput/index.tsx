import React, { FC, useEffect, useCallback } from 'react';
import {
  APP_MFA,
  EMAIL_MFA,
  EMAIL_VERIFICATION,
  SMS_MFA,
} from '../../../constants';
import { Button, FormHelperText, Grid, Typography } from '@mui/material';
import OTPInput from 'react-otp-input';
import useTimer from '../../../hooks/useTimer';
import sendOtp from '../../../api/user/send-otp';
import useFeedback from '../../../hooks/useFeedback';
import { Control, Controller } from 'react-hook-form';
import { ILoginFormInput } from '../types';
import OtpMessage from './OtpMessage';

interface IVerifyOtpInput {
  email: string;
  type: string;
  control: Control<ILoginFormInput>;
}

const OtpResendSection: FC<{ handleResendOtp: () => void; timer: number }> = ({
  handleResendOtp,
  timer,
}) => (
  <Grid item container alignItems="center" justifyContent="center">
    <Typography>Haven't received OTP?</Typography>
    <Button onClick={handleResendOtp} disabled={timer !== 0}>
      {timer ? `Click here in ${timer} seconds` : 'Click here'}
    </Button>
  </Grid>
);

const VerifyOtpInput: FC<IVerifyOtpInput> = React.memo(
  ({ email, type, control }) => {
    const { timer, resetTimer } = useTimer();
    const { feedbackAxiosError } = useFeedback();

    useEffect(() => {
      if ([SMS_MFA, EMAIL_MFA, EMAIL_VERIFICATION].includes(type))
        handleResendOtp();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [type]);

    const handleResendOtp = useCallback(async () => {
      try {
        await sendOtp({ type, email });
        resetTimer();
      } catch (err) {
        feedbackAxiosError(err, 'Failed to resend OTP');
      }
    }, [type, email, resetTimer, feedbackAxiosError]);

    return (
      <Grid container direction="column" alignItems="center" spacing={4}>
        <Grid item>
          <Typography align="center">
            <OtpMessage type={type} />
          </Typography>
        </Grid>

        {type !== APP_MFA && (
          <OtpResendSection handleResendOtp={handleResendOtp} timer={timer} />
        )}

        <Grid item>
          <Controller
            name="otp"
            control={control}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <Grid container spacing={1} justifyContent="center">
                <Grid item>
                  <OTPInput
                    value={value}
                    onChange={onChange}
                    numInputs={6}
                    renderInput={(props) => <input {...props} />}
                    inputType="tel"
                    containerStyle={{
                      display: 'flex',
                      gap: '10px',
                      justifyContent: 'center',
                    }}
                    inputStyle={{
                      width: '50px',
                      height: '50px',
                      fontSize: '20px',
                    }}
                  />
                </Grid>
                {error && (
                  <Grid item container justifyContent="center">
                    <FormHelperText error>OTP must be 6 digits</FormHelperText>
                  </Grid>
                )}
              </Grid>
            )}
          />
        </Grid>
      </Grid>
    );
  },
);

export default VerifyOtpInput;
