// oidc-provider errors (e.g. SessionNotFound) carry the OAuth error code as
// `message` and the actionable detail in `error_description`.
interface OidcProviderError extends Error {
  error: string;
  error_description?: string;
}

export const isOidcProviderError = (err: unknown): err is OidcProviderError =>
  err instanceof Error && typeof (err as OidcProviderError).error === 'string';

export const getOidcErrorMessage = (err: OidcProviderError): string =>
  err.error_description ? `${err.error}: ${err.error_description}` : err.error;
