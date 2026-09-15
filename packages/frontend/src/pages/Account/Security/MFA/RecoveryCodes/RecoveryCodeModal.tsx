import { Download } from 'lucide-react';
import { FC, useEffect, useState } from 'react';
import generateRecoveryCodes from '@/api/user/generate-recovery-codes';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import useFeedback from '@/hooks/useFeedback';

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
      void fetchRecoveryCodes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleClose = () => {
    setRecoveryCodes([]);
    setLoading(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <Card className="border-0">
          <CardHeader>
            <h2 className="font-semibold">Recovery codes</h2>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <div className="h-4 bg-slate-200 rounded animate-pulse" />
                <div className="h-4 bg-slate-200 rounded animate-pulse" />
                <div className="h-4 bg-slate-200 rounded animate-pulse" />
                <div className="h-32 bg-slate-200 rounded animate-pulse" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-slate-700">
                    Don&apos;t forget to save your recovery codes, without these
                    you will not able to recover your account if you were to
                    lose your 2FA Device.
                  </p>
                  <p className="text-sm text-slate-700">
                    Each code is one time use only therefore after its use, you
                    won&apos;t be able to use it again. If you lose your
                    recovery codes or run out of them you can always regenerate
                    it here.
                  </p>
                </div>

                {recoveryCodes?.length === 10 && (
                  <div className="grid grid-cols-2 gap-4 bg-slate-100 p-4 rounded">
                    {[
                      recoveryCodes.slice(0, 5),
                      recoveryCodes.slice(5, recoveryCodes.length),
                    ].map((chunk, index) => (
                      <div
                        key={`recoverycodechuck_${index}`}
                        className="space-y-1"
                      >
                        {chunk.map((recoveryCode) => (
                          <p key={recoveryCode} className="text-xs font-mono">
                            {recoveryCode}
                          </p>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={exportRecoveryCodes} className="gap-2">
              <Download className="w-4 h-4" />
              Download Recovery Codes
            </Button>
          </CardFooter>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default RecoveryCodeModal;
