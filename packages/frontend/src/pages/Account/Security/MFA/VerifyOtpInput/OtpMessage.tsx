import { Copy } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { FC } from 'react';
import { APP_MFA, EMAIL_MFA, SMS_MFA } from '@/constants';
import useFeedback from '@/hooks/useFeedback';

interface IOtpMessageProps {
  type: string;
  uri?: string;
}

const getManualSetupKey = (uri: string): string => {
  try {
    return new URL(uri).searchParams.get('secret') ?? '';
  } catch {
    return '';
  }
};

const OtpMessage: FC<IOtpMessageProps> = (props) => {
  const { type, uri = '' } = props;
  const { feedback } = useFeedback();
  switch (type) {
    case APP_MFA: {
      const manualSetupKey = getManualSetupKey(uri);
      return (
        <div className="flex flex-col items-center gap-4">
          <h3 className="text-lg font-semibold">Scan the QR Code</h3>
          <p className="text-sm text-slate-600 text-center">
            Scan the QR Code in your authenticator app and enter the code below
          </p>
          <div className="flex justify-center">
            <QRCodeSVG value={uri} />
          </div>
          {manualSetupKey && (
            <div className="flex flex-col items-center gap-1 w-full">
              <p className="text-xs text-slate-500 text-center">
                Can&apos;t scan the code? Enter this key manually in your
                authenticator app instead.
              </p>
              <button
                type="button"
                onClick={() => {
                  void navigator.clipboard.writeText(manualSetupKey);
                  feedback('Setup key copied to clipboard', 'success');
                }}
                title="Copy setup key"
                className="flex items-center gap-2 rounded border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-mono tracking-wide text-slate-700 transition-all hover:scale-[1.02] hover:bg-slate-100 active:scale-95"
              >
                <span className="break-all">{manualSetupKey}</span>
                <Copy className="w-3.5 h-3.5 shrink-0 text-primary" />
              </button>
            </div>
          )}
        </div>
      );
    }
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
