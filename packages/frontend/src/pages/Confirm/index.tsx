import { FC } from 'react';
import { useParams } from 'react-router-dom';
import authorizeInteraction from '../../api/oidc/authorize-interaction';
import useFeedback from '../../hooks/useFeedback';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader } from '../../components/ui/card';

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
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-sm border-t-2 border-red-600 mt-8">
        <CardHeader className="p-6">
          <h1 className="text-2xl font-semibold">Authorize</h1>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <p className="text-foreground">
            Can you confirm you want to authorize this request?
          </p>
          <div className="flex gap-2">
            <Button
              onClick={() => onAuthorize(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              Yes
            </Button>
            <Button
              onClick={() => onAuthorize(false)}
              className="bg-red-600 hover:bg-red-700"
            >
              No
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Confirm;
