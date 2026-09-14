import { FC, useState } from 'react';
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Grid,
  Modal,
} from '@mui/material';
import setupMFA from '../../../../api/user/setup-mfa';
import SubscriberInput from './SubscriberInput';
import {
  APP_MFA,
  EMAIL_MFA,
  MFA_SETUP,
  MFA_VERIFY,
  SMS_MFA,
} from '../../../../constants';
import { isEmpty } from 'lodash';
import isPhoneValid from '../../../../utils/is-phone-valid';
import VerifyOtpInput from './VerifyOtpInput';
import verifyMFA from '../../../../api/user/verify-mfa';
import useFeedback from '../../../../hooks/useFeedback';
import { KeyboardDoubleArrowDown } from '@mui/icons-material';

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
    <Modal open={open} onClose={onCloseModal}>
      <Card
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600,
          bgcolor: 'background.paper',
          p: 2,
        }}
      >
        <CardHeader title={`${type.toUpperCase()} MFA Setup`} />
        <CardContent>
          <Grid container justifyItems="center" direction="column" spacing={2}>
            <Grid item>
              <SubscriberInput
                value={subscriber}
                type={type}
                onChange={setSubscriber}
                error={subscriberError}
                disabled={stage !== MFA_SETUP}
              />
            </Grid>
            {stage === MFA_VERIFY && (
              <>
                <Grid container item justifyContent="center">
                  <KeyboardDoubleArrowDown fontSize="large" color="primary" />
                </Grid>
                <Grid item>
                  <VerifyOtpInput
                    value={otp}
                    onChange={setOtp}
                    uri={uri}
                    type={type}
                    error={otpError}
                  />
                </Grid>
              </>
            )}
          </Grid>
        </CardContent>
        <CardActions sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="contained" onClick={onCloseModal} color="error">
            Cancel
          </Button>
          {stage === MFA_SETUP && (
            <Button variant="contained" onClick={initiateMFA}>
              Setup
            </Button>
          )}
          {stage === MFA_VERIFY && (
            <Button variant="contained" onClick={verifyOtp} color="success">
              Verify
            </Button>
          )}
        </CardActions>
      </Card>
    </Modal>
  );
};

export default SetupModal;
