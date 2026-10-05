import { z } from 'zod';

const MIN_MINUTES = 5;
const MAX_MINUTES = 30 * 24 * 60;

const ttlMinutes = (label: string) =>
  z
    .number({ error: () => `${label} is required` })
    .int(`${label} must be a whole number of minutes`)
    .min(MIN_MINUTES, `${label} must be at least ${MIN_MINUTES} minutes`)
    .max(MAX_MINUTES, `${label} must be at most 30 days`);

const passkeySecondsInt = (label: string, min: number, max: number) =>
  z
    .number({ error: () => `${label} is required` })
    .int(`${label} must be a whole number of seconds`)
    .min(min, `${label} must be at least ${min} seconds`)
    .max(max, `${label} must be at most ${max} seconds`);

const schema = z.object({
  accessTokenTtl: ttlMinutes('Access token lifetime'),
  idTokenTtl: ttlMinutes('ID token lifetime'),
  refreshTokenTtl: ttlMinutes('Refresh token lifetime'),
  sessionTtl: ttlMinutes('Session lifetime'),
  grantTtl: ttlMinutes('Grant lifetime'),
  registrationEnabled: z.boolean(),
  rotateRefreshTokenOnUse: z.boolean(),
  passkeyAttestationType: z.enum(['none', 'direct']),
  passkeyAuthenticatorAttachment: z.enum(['platform', 'cross-platform', 'all']),
  passkeyChallengeTimeout: passkeySecondsInt('Challenge timeout', 30, 3600),
  passkeyMaxPerUser: z
    .number()
    .int('Max per user must be a whole number')
    .min(0, 'Max per user must be 0 or greater (0 = unlimited)'),
  passkeyCrossDeviceSessionTimeout: passkeySecondsInt(
    'Cross-device session timeout',
    60,
    3600,
  ),
});

export default schema;
