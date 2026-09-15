import { AlertCircle, CheckCircle, ShieldCheck } from 'lucide-react';
import React, { FC, useEffect, useState } from 'react';
import Passkeys from './Passkeys';
import RecoveryCodes from './RecoveryCodes';
import SetupModal from './SetupModal';
import changeMFAPreference from '@/api/user/change-mfa-preference';
import getMFASettings from '@/api/user/get-mfa-settings';
import resetMfa from '@/api/user/reset-mfa';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import useFeedback from '@/hooks/useFeedback';

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
    void fetchMFASettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Card className="border-t-4 border-t-primary shadow-sm">
        <CardHeader className="flex flex-row items-start gap-3 space-y-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg">
              Multi-Factor Authentication
            </CardTitle>
            <CardDescription>
              Make your login more secure by enabling 2FA for your account. Once
              enabled you&apos;ll be required to complete an additional
              verification step whilst logging in.
            </CardDescription>
          </div>
        </CardHeader>
        <CardFooter>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
            {mfaTypes.map((mfaType) => (
              <div
                key={mfaType.type}
                className="border rounded-lg p-3 flex flex-col justify-between h-32 bg-card shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-sm">
                    {mfaType.type.toUpperCase()} MFA
                  </h3>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      disabled={!mfaType.verified}
                      value={mfaType.type}
                      checked={mfaPreference === mfaType.type}
                      onChange={onChange}
                      className="w-4 h-4"
                    />
                    <span className="sr-only">
                      Use {mfaType.type.toUpperCase()} as MFA preference
                    </span>
                  </label>
                </div>

                <div className="py-2">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-xs font-medium text-muted-foreground">
                      Subscriber
                    </p>
                    {mfaType.subscriber && mfaType.verified && (
                      <CheckCircle
                        className="w-3 h-3 text-emerald-600"
                        aria-label="Verified"
                      />
                    )}
                    {mfaType.subscriber && !mfaType.verified && (
                      <AlertCircle
                        className="w-3 h-3 text-amber-600"
                        aria-label="Not Verified"
                      />
                    )}
                  </div>
                  <p
                    className="text-xs text-muted-foreground truncate"
                    title={mfaType.subscriber || 'None'}
                  >
                    {mfaType.subscriber || 'None'}
                  </p>
                </div>

                <div className="flex justify-end">
                  {!mfaType.verified ? (
                    <Button
                      variant="outline"
                      size="sm"
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
                      variant="outline"
                      size="sm"
                      onClick={() => onReset(mfaType.type)}
                    >
                      Reset MFA
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardFooter>
      </Card>

      <div className="mt-6 space-y-6">
        <Passkeys fetchMFASettings={fetchMFASettings} />
        <RecoveryCodes
          recoveryCodeCount={recoveryCodeCount}
          fetchMFASettings={fetchMFASettings}
        />
      </div>
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

export default MFA;
