import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Typography,
} from '@mui/material';
import { startRegistration } from '@simplewebauthn/browser';
import registerPasskey from '../../../../../api/user/register-passkey';
import verifyPasskeyRegistration from '../../../../../api/user/verify-passkey-registration';
import { useAuth } from '../../../../../context/AuthProvider';
import checkPasskeyAlreadyExists from '../../../../../api/user/check-passkey-exists';
import { FC, useEffect, useState } from 'react';
import useFeedback from '../../../../../hooks/useFeedback';
import getPasskeys from '../../../../../api/user/get-passkeys';
import { List } from '@mui/material';
import { ListItem } from '@mui/material';
import { IconButton } from '@mui/material';
import { Delete } from '@mui/icons-material';
import deletePasskey from '../../../../../api/user/delete-passkey';
import { Switch } from '@mui/material';
import { FormControlLabel } from '@mui/material';

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
  const { mfaPreference, onMfaPreferenceChange, fetchMFASettings } = props;
  const [devices, setDevices] = useState([]);
  const [passkeyVerified, setPasskeyVerified] = useState(false);

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
    <Card elevation={0}>
      <CardHeader
        title="Passkeys"
        action={
          <FormControlLabel
            labelPlacement="start"
            control={
              <Switch
                disabled={!passkeyVerified}
                color="error"
                value="passkey"
                checked={mfaPreference === 'passkey'}
                onChange={onMfaPreferenceChange}
              />
            }
            label="Use passkey for MFA"
          />
        }
      />
      <CardContent>
        <Typography>
          Passkeys are webauthn credentials that validate your identity using
          touch, facial recognition, a device password, or a PIN. They can be
          used as a password replacement or as a 2FA method.
        </Typography>
        <List sx={{ marginTop: '5px' }}>
          {devices.map((device) => (
            <ListItem
              sx={{
                border: '1px solid #cccccc',
                borderRadius: '4px',
                padding: '10px',
                marginBottom: '10px',
              }}
              key={device}
              secondaryAction={
                <IconButton
                  edge="end"
                  aria-label="device name"
                  color="error"
                  onClick={() =>
                    handleDeletePasskey(auth?.user?.userId ?? '', device)
                  }
                >
                  <Delete />
                </IconButton>
              }
            >
              <Typography>{device}</Typography>
            </ListItem>
          ))}
        </List>
      </CardContent>
      <CardActions sx={{ display: 'flex', justifyContent: 'end' }}>
        <Button
          variant="outlined"
          color="success"
          onClick={() => register(auth?.user?.userId ?? '')}
        >
          Add Passkey
        </Button>
      </CardActions>
    </Card>
  );
};

export default Passkeys;
