import { startRegistration } from '@simplewebauthn/browser';
import { useSearchParams } from 'react-router-dom';
import { useEffect, useState, FC } from 'react';
import axios from '@/utils/axios-instance';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import useFeedback from '@/hooks/useFeedback';

interface PasskeyRegisterProps {
  sessionId?: string;
  isModal?: boolean;
  onClose?: () => void;
}

const PasskeyRegisterComponent: FC<PasskeyRegisterProps> = ({
  sessionId: sessionIdProp,
  isModal = false,
  onClose,
}) => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { feedback } = useFeedback();

  const sessionId = sessionIdProp || searchParams.get('passkey-session');

  useEffect(() => {
    if (!sessionId) {
      setError('Invalid registration session. Missing session ID.');
    }
  }, [sessionId]);

  const handleRegister = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!sessionId) {
        throw new Error('Session ID is required');
      }

      const userAgent = navigator.userAgent;
      let deviceName = 'Unknown Device';

      if (/Mobi|Android/i.test(userAgent)) {
        deviceName = 'Mobile Device';
      } else if (/iPad|Tablet/i.test(userAgent)) {
        deviceName = 'Tablet';
      } else if (/Windows/i.test(userAgent)) {
        deviceName = 'Windows PC';
      } else if (/Mac/i.test(userAgent)) {
        deviceName = 'Mac';
      } else if (/Linux/i.test(userAgent)) {
        deviceName = 'Linux PC';
      }

      if (userAgent.includes('Firefox')) {
        deviceName += ' (Firefox)';
      } else if (userAgent.includes('Edg')) {
        deviceName += ' (Edge)';
      } else if (userAgent.includes('Chrome')) {
        deviceName += ' (Chrome)';
      } else if (userAgent.includes('Safari')) {
        deviceName += ' (Safari)';
      }

      const optionsResponse = await axios.post<{
        options: Parameters<typeof startRegistration>[0]['optionsJSON'];
      }>(
        '/api/user/register-passkey-with-session',
        { sessionId },
        { withCredentials: true },
      );

      const { options } = optionsResponse.data;

      const credential = await startRegistration({ optionsJSON: options });

      const verificationResponse = await axios.post<{ verified: boolean }>(
        '/api/user/complete-passkey-registration',
        {
          sessionId,
          credential,
          deviceName,
        },
        { withCredentials: true },
      );

      if (verificationResponse.data.verified) {
        setSuccess(true);
        feedback('Passkey registered successfully!', 'success');

        // Only the modal (same-device, authenticated) flow auto-closes;
        // the cross-device page has no session to redirect with.
        if (isModal && onClose) {
          setTimeout(() => onClose(), 2000);
        }
      } else {
        throw new Error('Verification failed');
      }
    } catch (err) {
      const errorMsg =
        err instanceof Error && err.name === 'InvalidStateError'
          ? 'This device already has a passkey for this account.'
          : err instanceof Error
            ? err.message
            : 'Registration failed';
      setError(errorMsg);
      feedback(`Registration error: ${errorMsg}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!isModal && (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Register Passkey</CardTitle>
              <CardDescription>
                Complete passkey registration on this device
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-800">
                    ✓ Passkey registered successfully! You can close this tab
                    and return to the device where you started registration.
                  </p>
                </div>
              )}

              {!success && !error && (
                <div className="space-y-4">
                  <p className="text-sm text-slate-600">
                    Click the button below to complete passkey registration on
                    this device.
                  </p>
                  <p className="text-xs text-slate-500">
                    Your device may ask for biometric verification or a PIN.
                  </p>
                </div>
              )}

              {!success && (
                <Button
                  onClick={handleRegister}
                  disabled={loading || !sessionId}
                  className="w-full"
                >
                  {loading ? 'Registering...' : 'Complete Registration'}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      )}
      {isModal && (
        <div className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-800">
                ✓ Passkey registered successfully!
              </p>
            </div>
          )}

          {!success && !error && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                Click the button below to complete passkey registration on this
                device.
              </p>
              <p className="text-xs text-slate-500">
                Your device may ask for biometric verification or a PIN.
              </p>
            </div>
          )}

          {!success && (
            <Button
              onClick={handleRegister}
              disabled={loading || !sessionId}
              className="w-full"
            >
              {loading ? 'Registering...' : 'Complete Registration'}
            </Button>
          )}

          {success && (
            <Button
              onClick={() => {
                if (onClose) {
                  onClose();
                }
              }}
              className="w-full"
            >
              Close
            </Button>
          )}
        </div>
      )}
    </>
  );
};

export default PasskeyRegisterComponent;
