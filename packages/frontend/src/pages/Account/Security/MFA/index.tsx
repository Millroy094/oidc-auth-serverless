import React, { FC, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  Paper,
  Switch,
  Tooltip,
  Typography,
} from '@mui/material';
import getMFASettings from '../../../../api/user/get-mfa-settings';
import useFeedback from '../../../../hooks/useFeedback';
import SetupModal from './SetupModal';
import changeMFAPreference from '../../../../api/user/change-mfa-preference';
import resetMfa from '../../../../api/user/reset-mfa';
import { NewReleases, Verified } from '@mui/icons-material';
import RecoveryCodes from './RecoveryCodes';
import Passkeys from './Passkeys';

interface IMFAType {
  type: string;
  subscriber: string;
  verified: boolean;
}

interface ISetupModal {
  open: boolean;
  type: string;
  defaultValue: string;
}

const setupModalDefault = { open: false, type: '', defaultValue: '' };

const MFA: FC = () => {
  const [mfaPreference, setMfaPreference] = useState<string>('');
  const [recoveryCodeCount, setRecoveryCodeCount] = useState<number>(0);
  const [mfaTypes, setMfaTypes] = useState<IMFAType[]>([]);
  const [setupModal, setSetupModal] = useState<ISetupModal>(setupModalDefault);
  const { feedbackAxiosError, feedback } = useFeedback();

  const fetchMFASettings = async (): Promise<void> => {
    try {
      const response = await getMFASettings();
      setMfaTypes(response.data.settings.types);
      setMfaPreference(response.data.settings.preference);
      setRecoveryCodeCount(response.data.settings.recoveryCodeCount);
    } catch (err) {
      feedbackAxiosError(
        err,
        'There was an issue retrieving mfa setting, please try again',
      );
    }
  };

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const checked = e.target.checked;
      const name = e.target.value;
      if (checked) {
        await changeMFAPreference(name);
      } else {
        await changeMFAPreference('');
      }
      await fetchMFASettings();
      feedback('Successfully updated MFA preference', 'success');
    } catch (err) {
      feedbackAxiosError(err, 'There was an issue changing MFA preference');
    }
  };

  const onCloseSetupModal = async () => {
    setSetupModal(setupModalDefault);
    await fetchMFASettings();
  };

  const onReset = async (type: string) => {
    try {
      await resetMfa(type);
      await fetchMFASettings();
      feedback('Successfully resetted MFA', 'success');
    } catch (err) {
      feedbackAxiosError(err, 'Failed to reset MFA');
    }
  };

  useEffect(() => {
    fetchMFASettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Card elevation={0}>
        <CardHeader title="Mulit-Factor Authentication" />
        <CardContent>
          <Typography variant="body1">
            You can make your login more secure by enabling 2FA for your
            account. Once enabled you will be required to through an additional
            step of verification whilst logging in.
          </Typography>
        </CardContent>
        <CardActions
          sx={{ display: 'flex', justifyContent: 'flex-end', padding: '10px' }}
        >
          <Grid container spacing={2}>
            {mfaTypes.map((mfaType) => (
              <Grid item key={mfaType.type}>
                <Paper
                  elevation={2}
                  sx={{ p: '10px', width: '240px', height: '120px' }}
                >
                  <Grid
                    container
                    direction="column"
                    justifyContent="space-between"
                    height="100%"
                  >
                    <Grid
                      item
                      container
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Grid item>
                        <Typography variant="body1">{`${mfaType.type.toUpperCase()} MFA`}</Typography>
                      </Grid>
                      <Grid item>
                        <Switch
                          size="small"
                          disabled={!mfaType.verified}
                          color="error"
                          value={mfaType.type}
                          checked={mfaPreference === mfaType.type}
                          onChange={onChange}
                        />
                      </Grid>
                    </Grid>
                    <Grid item sx={{ p: '10px 0' }}>
                      <Grid container item alignContent="center" spacing={1}>
                        <Grid item>
                          <Typography variant="subtitle2">
                            Subscriber
                          </Typography>
                        </Grid>
                        {mfaType.subscriber && mfaType.verified && (
                          <Grid item>
                            <Tooltip title="Verified">
                              <Verified fontSize="small" color="success" />
                            </Tooltip>
                          </Grid>
                        )}
                        {mfaType.subscriber && !mfaType.verified && (
                          <Grid item>
                            <Tooltip title="Not Verified">
                              <NewReleases fontSize="small" color="error" />
                            </Tooltip>
                          </Grid>
                        )}
                      </Grid>
                      <Tooltip title={mfaType.subscriber || 'None'}>
                        <Box
                          sx={{
                            textOverflow: 'ellipsis',
                            overflow: 'hidden',
                            width: '240px',
                            whiteSpace: 'normal',
                          }}
                        >
                          <Typography noWrap variant="caption">
                            {mfaType.subscriber || 'None'}
                          </Typography>
                        </Box>
                      </Tooltip>
                    </Grid>
                    <Grid container item justifyContent="flex-end">
                      {!mfaType.verified ? (
                        <Button
                          variant="outlined"
                          color="success"
                          size="small"
                          onClick={() =>
                            setSetupModal({
                              open: true,
                              type: mfaType.type,
                              defaultValue: mfaType.subscriber || '',
                            })
                          }
                        >
                          Setup MFA
                        </Button>
                      ) : (
                        <Button
                          variant="outlined"
                          color="success"
                          size="small"
                          onClick={() => onReset(mfaType.type)}
                        >
                          Reset MFA
                        </Button>
                      )}
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </CardActions>
      </Card>
      <Passkeys
        mfaPreference={mfaPreference}
        onMfaPreferenceChange={onChange}
        fetchMFASettings={fetchMFASettings}
      />
      <Divider sx={{ m: '30px 10px' }} />
      <RecoveryCodes
        recoveryCodeCount={recoveryCodeCount}
        fetchMFASettings={fetchMFASettings}
      />
      {setupModal.open && (
        <SetupModal
          open={setupModal.open}
          type={setupModal.type}
          defaultValue={setupModal.defaultValue}
          onClose={onCloseSetupModal}
        />
      )}
    </>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export default MFA;
