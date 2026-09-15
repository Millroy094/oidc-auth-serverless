import { startRegistration } from '@simplewebauthn/browser';
import { Trash2, Fingerprint } from 'lucide-react';
import { FC, useEffect, useState } from 'react';
import checkPasskeyAlreadyExists from '@/api/user/check-passkey-exists';
import deletePasskey from '@/api/user/delete-passkey';
import getPasskeys from '@/api/user/get-passkeys';
import registerPasskey from '@/api/user/register-passkey';
import verifyPasskeyRegistration from '@/api/user/verify-passkey-registration';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { useAuth } from '@/context/AuthProvider';
import useFeedback from '@/hooks/useFeedback';

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
  if (userAgent.includes('Firefox')) {
    return 'Firefox';
  }
  if (userAgent.includes('Edg')) {
    return 'Edge';
  }
  if (userAgent.includes('Chrome')) {
    return 'Chrome';
  }
  if (userAgent.includes('Safari')) {
    return 'Safari';
  }
  if (userAgent.includes('Opera') || userAgent.includes('OPR')) {
    return 'Opera';
  }
  return 'Unknown Browser';
}

interface PasskeysProps {
  fetchMFASettings: () => Promise<void>;
}

const Passkeys: FC<PasskeysProps> = (props) => {
  const { fetchMFASettings } = props;
  const [devices, setDevices] = useState<string[]>([]);

  const auth = useAuth();
  const { feedbackAxiosError, feedbackAxiosResponse, feedback } = useFeedback();

  const fetchPasskeys = async (userId: string) => {
    try {
      const response = await getPasskeys(userId);
      setDevices(response.data.deviceNames);
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
    void fetchPasskeys(auth?.user?.userId ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Card className="border-t-4 border-t-primary shadow-sm">
      <CardHeader className="flex flex-row items-start gap-3 space-y-0">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Fingerprint className="h-5 w-5" />
        </div>
        <div>
          <CardTitle className="text-lg">Passkeys</CardTitle>
          <CardDescription>
            Passkeys are webauthn credentials that validate your identity using
            touch, facial recognition, a device password, or a PIN. They can be
            used as a password replacement or as a 2FA method.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {devices.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No passkeys registered yet.
            </p>
          )}
          {devices.map((device) => (
            <div
              key={device}
              className="flex items-center justify-between p-2.5 border rounded-lg bg-muted/30"
            >
              <p className="text-sm">{device}</p>
              <button
                onClick={() =>
                  handleDeletePasskey(auth?.user?.userId ?? '', device)
                }
                className="p-1 text-destructive hover:bg-destructive/10 rounded"
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
