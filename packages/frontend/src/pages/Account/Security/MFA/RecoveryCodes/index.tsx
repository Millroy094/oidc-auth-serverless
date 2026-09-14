import { FC, useState } from 'react';
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Typography,
} from '@mui/material';
import RecoveryCodeModal from './RecoveryCodeModal';

interface IRecoveryCodeProps {
  recoveryCodeCount: number;
  fetchMFASettings: () => Promise<void>;
}

const RecoveryCodes: FC<IRecoveryCodeProps> = (props) => {
  const { recoveryCodeCount, fetchMFASettings } = props;

  const [open, setOpen] = useState(false);

  const onGenerateRecoveryCodes = () => {
    setOpen(true);
  };

  const onClose = async () => {
    await fetchMFASettings();
    setOpen(false);
  };

  return (
    <>
      <Card elevation={0}>
        <CardHeader title="Recovery codes" />
        <CardContent>
          <Typography variant="body1">
            Recovery codes can be used when your MFA method isn't available to
            you or if you have completely lost access to your MFA method.
          </Typography>
        </CardContent>
        <CardActions
          sx={{
            padding: '20px 20px 0 20px',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <Typography
            variant="button"
            color={recoveryCodeCount === 0 ? 'red' : 'green'}
          >{`${recoveryCodeCount}/10 Recovery codes left`}</Typography>
          <Button
            variant="outlined"
            color="success"
            onClick={onGenerateRecoveryCodes}
          >
            Generate recovery codes
          </Button>
        </CardActions>
      </Card>
      <RecoveryCodeModal open={open} onClose={onClose} />
    </>
  );
};

export default RecoveryCodes;
