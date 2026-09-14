import { FC } from 'react';
import { Typography, Grid } from '@mui/material';
import { APP_MFA, EMAIL_MFA, SMS_MFA } from '../../../../../constants';
import { QRCodeSVG } from 'qrcode.react';

interface IOtpMessageProps {
  type: string;
  uri?: string;
}

const OtpMessage: FC<IOtpMessageProps> = (props) => {
  const { type, uri = '' } = props;
  switch (type) {
    case APP_MFA:
      return (
        <>
          <Typography variant="h6">Scan the QR Code</Typography>
          <Typography>
            Scan the QR Code in your authenticator app and enter the code below
          </Typography>
          <Grid container item justifyContent="center">
            <QRCodeSVG value={uri} />
          </Grid>
        </>
      );
    case EMAIL_MFA:
      return (
        <Typography align="center">
          Please enter the 6 digit OTP sent to your email
        </Typography>
      );
    case SMS_MFA:
      return (
        <Typography align="center">
          Please enter the 6 digit OTP sent to your phone
        </Typography>
      );
    default:
      return null;
  }
};

export default OtpMessage;
