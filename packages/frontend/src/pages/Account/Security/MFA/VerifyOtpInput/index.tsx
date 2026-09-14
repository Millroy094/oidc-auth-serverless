import React, { FC } from 'react';
import { APP_MFA } from '../../../../../constants';
import { Button, FormHelperText, Grid, Typography } from '@mui/material';
import OTPInput from 'react-otp-input';
import useTimer from '../../../../../hooks/useTimer';
import sendOtp from '../../../../../api/user/send-otp';
import { useAuth } from '../../../../../context/AuthProvider';
import useFeedback from '../../../../../hooks/useFeedback';
import OtpMessage from './OtpMessage';

interface IVerifyOtpInput {
  value: string;
  onChange: React.Dispatch<React.SetStateAction<string>>;
  type: string;
  uri?: string;
  error: boolean;
}

const OtpResendSection: FC<{ handleResend: () => void; timer: number }> = ({
  handleResend,
  timer,
}) => (
  <Grid item container alignItems="center" justifyContent="center">
    <Typography>Haven't received OTP?</Typography>
    <Button onClick={handleResend} disabled={timer !== 0}>
      {timer ? `Click here in ${timer} seconds` : 'Click here'}
    </Button>
  </Grid>
);

const VerifyOtpInput: FC<IVerifyOtpInput> = ({
  type,
  onChange,
  value,
  uri,
  error,
}) => {
  const { timer, resetTimer } = useTimer();
  const auth = useAuth();
  const { feedbackAxiosError } = useFeedback();

  const handleResendOtp = async () => {
    try {
      await sendOtp({ type, email: auth!.user!.email });
      resetTimer();
    } catch (err) {
      feedbackAxiosError(err, 'Failed to resend OTP');
    }
  };

  return (
    <Grid container direction="column" alignItems="center" spacing={4}>
      <Grid item container direction="column" alignItems="center" spacing={2}>
        {type === APP_MFA ? (
          <OtpMessage type={type} uri={uri} />
        ) : (
          <>
            <OtpMessage type={type} />
            <OtpResendSection handleResend={handleResendOtp} timer={timer} />
          </>
        )}
      </Grid>
      <Grid item container direction="column" justifyContent="center">
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
          inputStyle={{ width: '50px', height: '50px', fontSize: '20px' }}
        />
        {error && (
          <Grid container justifyContent="center">
            <FormHelperText error>OTP must be 6 digits</FormHelperText>
          </Grid>
        )}
      </Grid>
    </Grid>
  );
};

export default VerifyOtpInput;
