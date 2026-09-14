import { FC, useEffect, useState } from 'react';
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Grid,
  Modal,
  Skeleton,
  Typography,
} from '@mui/material';
import generateRecoveryCodes from '../../../../../api/user/generate-recovery-codes';
import useFeedback from '../../../../../hooks/useFeedback';

interface RecoveryCodeModalProps {
  open: boolean;
  onClose: () => void;
}

const RecoveryCodeModal: FC<RecoveryCodeModalProps> = (props) => {
  const { open, onClose } = props;
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const { feedbackAxiosError } = useFeedback();

  const fetchRecoveryCodes = async () => {
    try {
      setLoading(true);
      const response = await generateRecoveryCodes();
      setRecoveryCodes(response.data.recoveryCodes);
      setLoading(false);
    } catch (err) {
      feedbackAxiosError(err, 'Failed to generate new recovery codes');
      handleClose();
    }
  };

  const exportRecoveryCodes = () => {
    const fileData = recoveryCodes.join('\r\n');
    const blob = new Blob([fileData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'recoveryCodes.txt';
    link.href = url;
    link.click();
  };

  useEffect(() => {
    if (open) {
      fetchRecoveryCodes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleClose = () => {
    setRecoveryCodes([]);
    setLoading(false);
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Card
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600,
          bgcolor: 'background.paper',
          p: 2,
        }}
      >
        <CardHeader title="Recovery codes" />
        <CardContent>
          {loading ? (
            <>
              <Skeleton width="100%" height="20px" />
              <Skeleton width="100%" height="20px" />
              <Skeleton width="100%" height="20px" />
              <Skeleton width="100%" height="300px" />
            </>
          ) : (
            <>
              <Grid container spacing={1}>
                <Grid item>
                  <Typography>
                    Don't forget to save your recovery codes, without these you
                    will not able to recover your account if you were to lose
                    your 2FA Device.
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography>
                    Each code is one time use only therefore after its use, you
                    won't be able to use it again. If you lose your recovery
                    codes or run out of them you can always regenerate it here.
                  </Typography>
                </Grid>
              </Grid>
              {recoveryCodes?.length === 10 && (
                <Grid
                  container
                  sx={{ background: '#efefef', padding: '15px', marginTop: 2 }}
                >
                  {[
                    recoveryCodes.slice(0, 5),
                    recoveryCodes.slice(5, recoveryCodes.length),
                  ].map((chunk, index) => (
                    <Grid
                      key={`recoverycodechuck_${index}`}
                      container
                      item
                      direction="column"
                      xs={6}
                      spacing={1}
                    >
                      {chunk.map((recoveryCode) => (
                        <Grid item key={recoveryCode}>
                          <Typography variant="caption">
                            {recoveryCode}
                          </Typography>
                        </Grid>
                      ))}
                    </Grid>
                  ))}
                </Grid>
              )}
            </>
          )}
        </CardContent>
        <CardActions sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="error"
            onClick={exportRecoveryCodes}
          >
            Download Recovery Codes
          </Button>
        </CardActions>
      </Card>
    </Modal>
  );
};

export default RecoveryCodeModal;
