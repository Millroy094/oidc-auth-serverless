import { z } from 'zod';
import { loadSsmParameters } from './ssm-config.ts';

const configSchema = z.object({
  env: z.enum(['production', 'development', 'test']).default('development'),
  deploymentEnvironment: z
    .enum(['local', 'development', 'staging', 'production'])
    .default('production'),
  oidc: z.object({
    cookieSecrets: z.array(z.string()).default([]),
    jwksPrivateKey: z.string().default(''),
    issuerUrl: z.string().default(''),
  }),
  captcha: z.object({
    turnstileSiteKey: z.string().default('1x00000000000000000000AA'),
    turnstileSecretKey: z
      .string()
      .default('1x0000000000000000000000000000000AA'),
  }),
  authentication: z.object({
    accessTokenSecret: z.string().default(''),
    accessTokenExpiry: z.string().default('2h'),
    refreshTokenSecret: z.string().default(''),
    refreshTokenExpiry: z.string().default('8h'),
    issuer: z.string().default(''),
    rpId: z.string().default('localhost'),
  }),
  encryption: z.object({
    secret: z.string().default(''),
    secretiv: z.string().default(''),
    method: z.string().default('aes-256-cbc'),
  }),
  email: z.object({
    supportEmail: z.string().default(''),
  }),
  security: z.object({
    originVerifySecret: z.string().default(''),
  }),
});

export const parseEnvironment = (environment: NodeJS.ProcessEnv) =>
  configSchema.parse({
    env: environment.NODE_ENV,
    deploymentEnvironment: environment.DEPLOYMENT_ENVIRONMENT,
    oidc: {
      cookieSecrets: environment.COOKIE_SECRETS?.split(','),
      jwksPrivateKey: environment.JWKS_PRIVATE_KEY,
      issuerUrl: environment.ISSUER_URL,
    },
    captcha: {
      turnstileSiteKey: environment.TURNSTILE_SITE_KEY,
      turnstileSecretKey: environment.TURNSTILE_SECRET_KEY,
    },
    authentication: {
      accessTokenSecret: environment.ACCESS_JWT_SECRET,
      accessTokenExpiry: environment.ACCESS_JWT_EXPIRY,
      refreshTokenSecret: environment.REFRESH_JWT_SECRET,
      refreshTokenExpiry: environment.REFRESH_JWT_EXPIRY,
      issuer: environment.ISSUER_NAME,
      rpId: environment.RP_ID,
    },
    encryption: {
      secret: environment.ENCRYPTION_SECRET_KEY,
      secretiv: environment.ENCRYPTION_SECRET_IV,
      method: environment.ENCRYPTION_METHOD,
    },
    email: {
      supportEmail: environment.SUPPORT_EMAIL,
    },
    security: {
      originVerifySecret: environment.ORIGIN_VERIFY_SECRET,
    },
  });

// SSM must load before config is parsed: encryption reads it at import time.
if (process.env.SSM_PARAMETER_PREFIX) {
  await loadSsmParameters(process.env.SSM_PARAMETER_PREFIX);
}

const config = parseEnvironment(process.env);

export default config;
