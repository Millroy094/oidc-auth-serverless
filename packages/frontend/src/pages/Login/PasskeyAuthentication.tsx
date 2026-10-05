import { startAuthentication } from '@simplewebauthn/browser';
import { FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThreeDots } from 'react-loader-spinner';
import loginWithPasskey from '@/api/user/login-with-passkey';
import verifyPasskeyLogin from '@/api/user/verify-passkey-login';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthProvider';
import useFeedback from '@/hooks/useFeedback';

interface PasskeyAuthenticationProps {
  email: string;
  handleSubmit: () => Promise<void>;
}

const PasskeyAuthentication: FC<PasskeyAuthenticationProps> = (props) => {
  const { email } = props;
  const navigate = useNavigate();
  const auth = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const { feedbackAxiosError } = useFeedback();

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

      const response = verificationResponse.data;
      if (
        'challengeName' in response &&
        response.challengeName === 'LOGIN_SUCCESS'
      ) {
        await auth?.refreshUser();
        setTimeout(() => {
          void navigate('/account');
        }, 500);
      } else if ('redirect' in response && response.redirect) {
        setTimeout(() => {
          window.location.href = response.redirect as string;
        }, 500);
      } else {
        throw new Error('There was issue login in with your passkey');
      }
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
      void handleLogin(email);
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
            color="hsl(var(--primary))"
            radius="9"
            ariaLabel="three-dots-loading"
          />
        </div>
      )}
      {error && (
        <div>
          <Button onClick={tryAgain}>Try again</Button>
        </div>
      )}
    </div>
  );
};

export default PasskeyAuthentication;
