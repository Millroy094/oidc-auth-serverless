import React, { FC } from 'react';
import OTPInput from 'react-otp-input';
import OtpMessage from './OtpMessage';
import sendOtp from '@/api/user/send-otp';
import { Button } from '@/components/ui/button';
import { APP_MFA } from '@/constants';
import { useAuth } from '@/context/AuthProvider';
import useFeedback from '@/hooks/useFeedback';
import useTimer from '@/hooks/useTimer';

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
  <div className="flex items-center justify-center gap-2">
    <p className="text-sm">Haven&apos;t received OTP?</p>
    <Button
      variant="link"
      size="sm"
      onClick={handleResend}
      disabled={timer !== 0}
    >
      {timer ? `Click here in ${timer} seconds` : 'Click here'}
    </Button>
  </div>
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
    <div className="flex flex-col items-center gap-8">
      <div className="flex flex-col items-center gap-4">
        {type === APP_MFA ? (
          <OtpMessage type={type} uri={uri} />
        ) : (
          <>
            <OtpMessage type={type} />
            <OtpResendSection handleResend={handleResendOtp} timer={timer} />
          </>
        )}
      </div>
      <div className="flex flex-col items-center justify-center gap-4">
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <OTPInput
            value={value}
            onChange={onChange}
            numInputs={6}
            renderInput={(props) => (
              <input
                {...props}
                className="w-12 h-12 text-center text-xl border border-slate-300 rounded focus:outline-none focus:border-slate-500"
              />
            )}
            inputType="tel"
            containerStyle={{
              display: 'flex',
              gap: '10px',
              justifyContent: 'center',
            }}
          />
        </div>
        {error && <p className="text-sm text-red-500">OTP must be 6 digits</p>}
      </div>
    </div>
  );
};

export default VerifyOtpInput;
