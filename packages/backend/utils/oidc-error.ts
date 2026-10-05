/**
 * oidc-provider throws errors (e.g. `SessionNotFound` when an interaction has
 * expired, been consumed, or never existed) whose `message` is just the OAuth
 * error code (e.g. `invalid_request`) - the actionable detail lives in
 * `error_description`. Plain `Error`s thrown by our own code (credential
 * validation, etc.) don't have this shape, so they're left untouched.
 */
interface OidcProviderError extends Error {
  error: string;
  error_description?: string;
}

export const isOidcProviderError = (err: unknown): err is OidcProviderError =>
  err instanceof Error && typeof (err as OidcProviderError).error === 'string';

export const getOidcErrorMessage = (err: OidcProviderError): string =>
  err.error_description ? `${err.error}: ${err.error_description}` : err.error;
