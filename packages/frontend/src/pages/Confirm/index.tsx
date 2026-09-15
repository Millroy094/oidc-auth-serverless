import { FC } from 'react';
import { useParams } from 'react-router-dom';
import authorizeInteraction from '@/api/oidc/authorize-interaction';
import AuthCardLayout from '@/components/AuthCardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import useFeedback from '@/hooks/useFeedback';

const Confirm: FC = () => {
  const { interactionId } = useParams();
  const { feedbackAxiosError } = useFeedback();
  const onAuthorize = async (authorize: boolean): Promise<void> => {
    try {
      const response = await authorizeInteraction(
        interactionId ?? '',
        authorize,
      );
      if (response.data.redirect) {
        window.location.href = response.data.redirect;
      }
    } catch (err) {
      feedbackAxiosError(err, 'Failed to authorize request, please try again.');
    }
  };

  return (
    <AuthCardLayout>
      <Card className="w-full max-w-sm border-t-4 border-t-primary shadow-xl shadow-slate-200/60 dark:shadow-none">
        <CardHeader className="p-6 pb-4 sm:p-8 sm:pb-4">
          <h1 className="text-2xl font-semibold tracking-tight">Authorize</h1>
        </CardHeader>
        <CardContent className="space-y-4 px-6 pb-6 sm:px-8 sm:pb-8">
          <p className="text-foreground">
            Can you confirm you want to authorize this request?
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              onClick={() => onAuthorize(true)}
              className="w-full sm:w-auto"
            >
              Yes
            </Button>
            <Button
              variant="destructive"
              onClick={() => onAuthorize(false)}
              className="w-full sm:w-auto"
            >
              No
            </Button>
          </div>
        </CardContent>
      </Card>
    </AuthCardLayout>
  );
};

export default Confirm;
