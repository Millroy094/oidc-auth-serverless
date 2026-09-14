import { FC } from 'react';
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
        <div className="flex flex-col items-center gap-4">
          <h3 className="text-lg font-semibold">Scan the QR Code</h3>
          <p className="text-sm text-slate-600 text-center">
            Scan the QR Code in your authenticator app and enter the code below
          </p>
          <div className="flex justify-center">
            <QRCodeSVG value={uri} />
          </div>
        </div>
      );
    case EMAIL_MFA:
      return (
        <p className="text-sm text-slate-600 text-center">
          Please enter the 6 digit OTP sent to your email
        </p>
      );
    case SMS_MFA:
      return (
        <p className="text-sm text-slate-600 text-center">
          Please enter the 6 digit OTP sent to your phone
        </p>
      );
    default:
      return null;
  }
};

export default OtpMessage;
