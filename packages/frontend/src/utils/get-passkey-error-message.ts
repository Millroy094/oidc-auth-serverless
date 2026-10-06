import { AxiosError } from 'axios';

interface ErrorResponseData {
  error?: string;
}

/**
 * Resolves a user-facing message for a passkey registration/authentication
 * error. Axios errors carry the backend's specific `error` message in the
 * response body (e.g. "session expired"), which `error.message` does not
 * include (it's just "Request failed with status code 4xx"), so it must be
 * read from `error.response.data` explicitly. WebAuthn's `InvalidStateError`
 * (thrown by the browser when the authenticator already holds a credential
 * for the user) is special-cased with a friendlier message.
 */
const getPasskeyErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error && error.name === 'InvalidStateError') {
    return 'This device already has a passkey for this account.';
  }

  if (error instanceof AxiosError) {
    const responseData = error.response?.data as ErrorResponseData | undefined;
    if (responseData?.error) {
      return responseData.error;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};

export default getPasskeyErrorMessage;
