import { AxiosError } from 'axios';

interface ErrorResponseData {
  error?: string;
}

// Resolves a user-facing message for a passkey error: special-cases
// WebAuthn's InvalidStateError with a friendlier message, else prefers the
// backend's `error` field (axios `error.message` is just "Request failed
// with status code 4xx"), else falls back to Error.message, else `fallback`.
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
