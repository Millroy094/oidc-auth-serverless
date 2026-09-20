import { z } from 'zod';

const MIN_MINUTES = 5;
const MAX_MINUTES = 30 * 24 * 60;

const ttlMinutes = (label: string) =>
  z
    .number({ error: () => `${label} is required` })
    .int(`${label} must be a whole number of minutes`)
    .min(MIN_MINUTES, `${label} must be at least ${MIN_MINUTES} minutes`)
    .max(MAX_MINUTES, `${label} must be at most 30 days`);

const schema = z.object({
  accessTokenTtl: ttlMinutes('Access token lifetime'),
  idTokenTtl: ttlMinutes('ID token lifetime'),
  refreshTokenTtl: ttlMinutes('Refresh token lifetime'),
  sessionTtl: ttlMinutes('Session lifetime'),
  grantTtl: ttlMinutes('Grant lifetime'),
});

export default schema;
