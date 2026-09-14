import { ReactNode } from 'react';
import {
  APP_MFA,
  EMAIL_MFA,
  EMAIL_VERIFICATION,
  SMS_MFA,
} from '../../../constants';

interface IOtpMessageProps {
  type: string;
}

const OtpMessage = (props: IOtpMessageProps): ReactNode => {
  const { type } = props;
  switch (type) {
    case APP_MFA:
      return 'Please enter the 6 digit passcode shown on your authenticator app';
    case EMAIL_MFA:
      return 'Please enter the 6 digit OTP sent to your selected email';
    case SMS_MFA:
      return 'Please enter the 6 digit OTP sent to your selected phone number';
    case EMAIL_VERIFICATION:
      return 'Please enter the 6 digit OTP sent to your email to verify your email';
    default:
      return '';
  }
};

export default OtpMessage;
