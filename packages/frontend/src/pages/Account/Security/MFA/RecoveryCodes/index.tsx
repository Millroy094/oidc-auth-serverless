import { FC, useState } from 'react';
import { Button } from '../../../../../components/ui/button';
import { Card, CardHeader, CardFooter, CardTitle, CardDescription } from '../../../../../components/ui/card';
import { KeyRound } from 'lucide-react';
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
      <Card className="border-t-4 border-t-primary shadow-sm">
        <CardHeader className="flex flex-row items-start gap-3 space-y-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <KeyRound className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg">Recovery Codes</CardTitle>
            <CardDescription>
              Recovery codes can be used when your MFA method isn&apos;t available to
              you or if you have completely lost access to your MFA method.
            </CardDescription>
          </div>
        </CardHeader>
        <CardFooter className="flex justify-between items-center">
          <p className={`text-sm font-medium ${recoveryCodeCount === 0 ? 'text-destructive' : 'text-emerald-600'}`}>
            {recoveryCodeCount}/10 Recovery codes left
          </p>
          <Button
            variant="outline"
            onClick={onGenerateRecoveryCodes}
          >
            Generate recovery codes
          </Button>
        </CardFooter>
      </Card>
      <RecoveryCodeModal open={open} onClose={onClose} />
    </>
  );
};

export default RecoveryCodes;
