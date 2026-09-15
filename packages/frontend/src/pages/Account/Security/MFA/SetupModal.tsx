import { isEmpty } from 'lodash';
import { ChevronDown } from 'lucide-react';
import { FC, useState } from 'react';
import SubscriberInput from './SubscriberInput';
import VerifyOtpInput from './VerifyOtpInput';
import setupMFA from '@/api/user/setup-mfa';
import verifyMFA from '@/api/user/verify-mfa';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  APP_MFA,
  EMAIL_MFA,
  MFA_SETUP,
  MFA_VERIFY,
  SMS_MFA,
} from '@/constants';
import useFeedback from '@/hooks/useFeedback';
import isPhoneValid from '@/utils/is-phone-valid';

interface SetupModalProps {
  open: boolean;
  type: string;
  defaultValue: string;
  onClose: () => void;
}

const SetupModal: FC<SetupModalProps> = (props) => {
  const { open, type, defaultValue, onClose } = props;
  const [subscriber, setSubscriber] = useState(defaultValue);
  const [subscriberError, setSubscriberError] = useState(false);
  const [stage, setStage] = useState(MFA_SETUP);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState(false);
  const [uri, setUri] = useState('');

  const { feedbackAxiosError } = useFeedback();

  const validateSubscriber = () => {
    let isValid = true;
    if (type === APP_MFA) {
      isValid = !isEmpty(subscriber);
    } else if (type === SMS_MFA) {
      isValid = isPhoneValid(subscriber);
    } else if (type === EMAIL_MFA) {
      isValid = /\S+@\S+\.\S+/.test(subscriber);
    }
    return isValid;
  };

  const initiateMFA = async () => {
    try {
      setSubscriberError(false);
      const isValid = validateSubscriber();
      if (isValid) {
        const response = await setupMFA({ type, subscriber });
        if (type === APP_MFA && response.data.uri) {
          setUri(response.data.uri);
        }
        setStage(MFA_VERIFY);
      } else {
        setSubscriberError(true);
      }
    } catch (err) {
      feedbackAxiosError(err, 'There was an issue setting up MFA');
    }
  };

  const validateOtp = () => otp && otp.length === 6;

  const verifyOtp = async () => {
    try {
      setOtpError(false);
      const isValid = validateOtp();
      if (isValid) {
        await verifyMFA({ type, otp });
        onCloseModal();
      } else {
        setOtpError(true);
      }
    } catch (err) {
      feedbackAxiosError(err, 'Invalid OTP');
    }
  };

  const onCloseModal = () => {
    setSubscriber('');
    setSubscriberError(false);
    setStage(MFA_SETUP);
    setUri('');
    setOtp('');
    setOtpError(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onCloseModal}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <Card className="border-0">
          <CardHeader>
            <h2 className="font-semibold">{`${type.toUpperCase()} MFA Setup`}</h2>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 justify-center">
              <SubscriberInput
                value={subscriber}
                type={type}
                onChange={setSubscriber}
                error={subscriberError}
                disabled={stage !== MFA_SETUP}
              />
              {stage === MFA_VERIFY && (
                <>
                  <div className="flex justify-center">
                    <ChevronDown className="w-6 h-6 text-slate-600" />
                  </div>
                  <VerifyOtpInput
                    value={otp}
                    onChange={setOtp}
                    uri={uri}
                    type={type}
                    error={otpError}
                  />
                </>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={onCloseModal}>
              Cancel
            </Button>
            {stage === MFA_SETUP && (
              <Button onClick={initiateMFA}>Setup</Button>
            )}
            {stage === MFA_VERIFY && (
              <Button onClick={verifyOtp}>Verify</Button>
            )}
          </CardFooter>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default SetupModal;
