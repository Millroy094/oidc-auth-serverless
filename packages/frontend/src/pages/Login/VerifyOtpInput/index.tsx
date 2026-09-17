import React, { FC, useEffect, useCallback } from 'react';
import { Control, Controller } from 'react-hook-form';
import OTPInput from 'react-otp-input';
import OtpMessage from './OtpMessage';
import sendOtp from '@/api/user/send-otp';
import { Button } from '@/components/ui/button';
import { APP_MFA, EMAIL_MFA, EMAIL_VERIFICATION, SMS_MFA } from '@/constants';
import useFeedback from '@/hooks/useFeedback';
import useTimer from '@/hooks/useTimer';
import { ILoginFormInput } from '@/pages/Login/types';

interface IVerifyOtpInput {
  email: string;
  type: string;
  control: Control<ILoginFormInput>;
}

const OtpResendSection: FC<{ handleResendOtp: () => void; timer: number }> = ({
  handleResendOtp,
  timer,
}) => (
  <div className="flex items-center justify-center gap-2">
    <span className="text-sm text-foreground">Haven&apos;t received OTP?</span>
    <Button
      variant="link"
      onClick={handleResendOtp}
      disabled={timer !== 0}
      className="text-sm p-0 h-auto"
    >
      {timer ? `Click here in ${timer} seconds` : 'Click here'}
    </Button>
  </div>
);

const VerifyOtpInput: FC<IVerifyOtpInput> = React.memo(
  ({ email, type, control }) => {
    const { timer, resetTimer } = useTimer();
    const { feedbackAxiosError } = useFeedback();

    useEffect(() => {
      if ([SMS_MFA, EMAIL_MFA, EMAIL_VERIFICATION].includes(type)) {
        void handleResendOtp();
      }
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
      <div className="flex flex-col items-center gap-6">
        <div className="text-center text-sm text-foreground">
          <OtpMessage type={type} />
        </div>

        {type !== APP_MFA && (
          <OtpResendSection handleResendOtp={handleResendOtp} timer={timer} />
        )}

        <div>
          <Controller
            name="otp"
            control={control}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <div className="flex flex-col items-center gap-2">
                <div>
                  <OTPInput
                    value={value}
                    onChange={onChange}
                    numInputs={6}
                    skipDefaultStyles
                    renderInput={(props) => (
                      <input
                        {...props}
                        className="w-12 h-12 text-xl border border-input rounded-md text-center focus:outline-none focus:ring-2 focus:ring-ring"
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
                {error && (
                  <div className="text-center">
                    <p className="text-sm text-red-500">OTP must be 6 digits</p>
                  </div>
                )}
              </div>
            )}
          />
        </div>
      </div>
    );
  },
);

export default VerifyOtpInput;
