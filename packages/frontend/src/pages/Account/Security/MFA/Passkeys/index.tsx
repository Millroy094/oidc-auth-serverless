import {
  Button,
} from '../../../../../components/ui/button';
import { Card, CardContent, CardHeader, CardFooter } from '../../../../../components/ui/card';
import { startRegistration } from '@simplewebauthn/browser';
import registerPasskey from '../../../../../api/user/register-passkey';
import verifyPasskeyRegistration from '../../../../../api/user/verify-passkey-registration';
import { useAuth } from '../../../../../context/AuthProvider';
import checkPasskeyAlreadyExists from '../../../../../api/user/check-passkey-exists';
import { FC, useEffect, useState } from 'react';
import useFeedback from '../../../../../hooks/useFeedback';
import getPasskeys from '../../../../../api/user/get-passkeys';
import { Trash2 } from 'lucide-react';
import deletePasskey from '../../../../../api/user/delete-passkey';

function getDetailedDeviceInfo(): string {
  const userAgent = navigator.userAgent;
  const platform = navigator.platform || 'Unknown platform';
  const browserName = getBrowserName(userAgent);

  let deviceType = 'Unknown Device';

  if (/Mobi|Android/i.test(userAgent)) {
    deviceType = 'Mobile Device';
  } else if (/Tablet/i.test(userAgent)) {
    deviceType = 'Tablet';
  } else if (/Windows/i.test(userAgent)) {
    deviceType = 'Windows PC';
  } else if (/Mac/i.test(userAgent)) {
    deviceType = 'Mac';
  } else if (/Linux/i.test(userAgent)) {
    deviceType = 'Linux PC';
  }

  return `${deviceType} (${browserName}) on ${platform}`;
}

function getBrowserName(userAgent: string): string {
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Edg')) return 'Edge';
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Opera') || userAgent.includes('OPR')) return 'Opera';
  return 'Unknown Browser';
}

interface PasskeysProps {
  mfaPreference: string;
  onMfaPreferenceChange: (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => Promise<void>;
  fetchMFASettings: () => Promise<void>;
}

const Passkeys: FC<PasskeysProps> = (props) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { mfaPreference: _mfaPreference, onMfaPreferenceChange: _onMfaPreferenceChange, fetchMFASettings } = props;
  const [devices, setDevices] = useState([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_passkeyVerified, setPasskeyVerified] = useState(false);

  const auth = useAuth();
  const { feedbackAxiosError, feedbackAxiosResponse, feedback } = useFeedback();

  const fetchPasskeys = async (userId: string) => {
    try {
      const response = await getPasskeys(userId);
      setDevices(response.data.deviceNames);
      setPasskeyVerified(response.data.verified);
    } catch (err) {
      feedbackAxiosError(
        err,
        'There was an issue retrieving passkeys, please try again',
      );
    }
  };

  const handleDeletePasskey = async (userId: string, deviceName: string) => {
    try {
      const response = await deletePasskey(userId, deviceName);
      feedbackAxiosResponse(
        response,
        'Successfully deleted passkey',
        'success',
      );
      await fetchPasskeys(userId);
      await fetchMFASettings();
    } catch (err) {
      feedbackAxiosError(
        err,
        'There was an issue deleting passkey, please try again',
      );
    }
  };

  const register = async (userId: string) => {
    try {
      const deviceName = getDetailedDeviceInfo();

      const response = await checkPasskeyAlreadyExists({ userId, deviceName });

      if (response.data.exists) {
        throw new Error('passkey already exists');
      }

      const registerResponse = await registerPasskey({ userId });
      const options = registerResponse.data.options;
      const credential = await startRegistration({ optionsJSON: options });

      const verificationResponse = await verifyPasskeyRegistration({
        userId,
        credential,
        deviceName,
      });

      const result = verificationResponse.data;

      if (!result.verified) {
        throw new Error('Passkey could be verified');
      }
      feedback('Passkey registration successful', 'success');
      await fetchPasskeys(userId);
      await fetchMFASettings();
    } catch (error) {
      feedback(
        `An error occurred during passkey registration: ${(error as Error).message}`,
        'error',
      );
    }
  };

  useEffect(() => {
    fetchPasskeys(auth?.user?.userId ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold">Passkeys</h2>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-700 mb-4">
          Passkeys are webauthn credentials that validate your identity using
          touch, facial recognition, a device password, or a PIN. They can be
          used as a password replacement or as a 2FA method.
        </p>
        <div className="space-y-2">
          {devices.map((device) => (
            <div
              key={device}
              className="flex items-center justify-between p-2.5 border border-slate-200 rounded"
            >
              <p className="text-sm">{device}</p>
              <button
                onClick={() =>
                  handleDeletePasskey(auth?.user?.userId ?? '', device)
                }
                className="p-1 text-red-600 hover:bg-red-100 rounded"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button
          variant="outline"
          onClick={() => register(auth?.user?.userId ?? '')}
        >
          Add Passkey
        </Button>
      </CardFooter>
    </Card>
  );
};

export default Passkeys;
