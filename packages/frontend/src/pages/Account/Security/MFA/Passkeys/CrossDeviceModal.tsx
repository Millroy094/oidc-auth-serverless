import { QRCodeSVG } from 'qrcode.react';
import { Copy, RefreshCw } from 'lucide-react';
import { FC, useState } from 'react';
import { Button } from '@/components/ui/button';
import useFeedback from '@/hooks/useFeedback';

interface CrossDevicePasskeyModalProps {
  sessionId: string;
  onCancel: () => void;
}

const CrossDevicePasskeyModal: FC<CrossDevicePasskeyModalProps> = ({
  sessionId,
  onCancel,
}) => {
  const { feedback } = useFeedback();
  const [copied, setCopied] = useState(false);

  // Build registration URL with session ID
  const baseUrl = window.location.origin;
  const registrationUrl = `${baseUrl}/?passkey-session=${sessionId}`;

  const handleCopyUrl = async () => {
    await navigator.clipboard.writeText(registrationUrl);
    feedback('Registration URL copied to clipboard', 'success');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">
          Register Passkey on Another Device
        </h3>
        <p className="text-sm text-slate-600">
          Scan this QR code with another device to complete passkey registration
        </p>
      </div>

      {/* QR Code */}
      <div className="flex justify-center p-4 bg-white rounded-lg border border-slate-200">
        <QRCodeSVG value={registrationUrl} size={256} level="H" includeMargin />
      </div>

      {/* Alternative: Copy URL */}
      <div className="w-full">
        <p className="text-xs text-slate-500 mb-2 text-center">
          Or copy this link to another device:
        </p>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={registrationUrl}
            readOnly
            className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded font-mono"
          />
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopyUrl}
            className="shrink-0"
            title={copied ? 'Copied!' : 'Copy link'}
          >
            <Copy className={`w-4 h-4 ${copied ? 'text-green-600' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Instructions */}
      <div className="w-full bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-xs text-blue-900 font-medium mb-2">📱 Next Steps:</p>
        <ol className="text-xs text-blue-800 space-y-1 list-decimal list-inside">
          <li>Scan QR code or click link on another device</li>
          <li>Complete passkey registration on that device</li>
          <li>Return to this screen to finish</li>
        </ol>
      </div>

      {/* Buttons */}
      <div className="flex gap-2 w-full">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          className="flex-1"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Check Status
        </Button>
      </div>
    </div>
  );
};

export default CrossDevicePasskeyModal;
