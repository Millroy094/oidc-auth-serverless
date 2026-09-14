import { Button } from '../../components/ui/button';
import { FC, useEffect, useState } from 'react';
import { ThreeDots } from 'react-loader-spinner';
import loginWithPasskey from '../../api/user/login-with-passkey';
import { startAuthentication } from '@simplewebauthn/browser';
import verifyPasskeyLogin from '../../api/user/verify-passkey-login';
import useFeedback from '../../hooks/useFeedback';

interface PasskeyAuthenticationProps {
  email: string;
  handleSubmit: () => Promise<void>;
}

const PasskeyAuthentication: FC<PasskeyAuthenticationProps> = (props) => {
  const { email, handleSubmit } = props;
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const { feedbackAxiosError } = useFeedback();
  console.log(error);

  const handleLogin = async (email: string) => {
    try {
      setLoading(true);

      const loginResponse = await loginWithPasskey({ email });
      const authResponse = await startAuthentication({
        optionsJSON: loginResponse.data.options,
      });

      const verificationResponse = await verifyPasskeyLogin({
        email,
        credential: authResponse,
      });

      if (!verificationResponse.data.verified) {
        throw new Error('There was issue login in with your passkey');
      }

      await handleSubmit();
    } catch (error) {
      feedbackAxiosError(error, 'There was issue login in with your passkey');
      setError(true);
    }
    setLoading(false);
  };

  const tryAgain = async () => {
    setError(false);
    await handleLogin(email);
  };

  useEffect(() => {
    if (email) {
      handleLogin(email);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-center text-sm text-foreground">
        Please follow the instruction shown on screen to login
      </div>
      {loading && (
        <div>
          <ThreeDots
            visible={true}
            height="40"
            width="80"
            color="#4fa94d"
            radius="9"
            ariaLabel="three-dots-loading"
          />
        </div>
      )}
      {error && (
        <div>
          <Button onClick={tryAgain}>
            Try again
          </Button>
        </div>
      )}
    </div>
  );
};

export default PasskeyAuthentication;
