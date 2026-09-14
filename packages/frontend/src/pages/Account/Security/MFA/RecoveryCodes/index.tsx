import { FC, useState } from 'react';
import { Button } from '../../../../../components/ui/button';
import { Card, CardContent, CardHeader, CardFooter } from '../../../../../components/ui/card';
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
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Recovery codes</h2>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-700">
            Recovery codes can be used when your MFA method isn't available to
            you or if you have completely lost access to your MFA method.
          </p>
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <p className={`text-sm font-medium ${recoveryCodeCount === 0 ? 'text-red-600' : 'text-green-600'}`}>
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
