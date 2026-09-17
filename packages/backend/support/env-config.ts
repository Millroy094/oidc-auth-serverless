import convict from 'convict';
import { loadSsmParameters } from './ssm-config.ts';

// Fetch secrets from SSM Parameter Store before building the config schema.
// This must complete before any module (e.g. utils/encryption.ts) reads
// config values at import time.
if (process.env.SSM_PARAMETER_PREFIX) {
  await loadSsmParameters(process.env.SSM_PARAMETER_PREFIX);
}

const config = convict({
  env: {
    doc: 'The application environment.',
    format: ['production', 'development', 'test'],
    default: 'development',
    env: 'NODE_ENV',
  },
  deploymentEnvironment: {
    doc: 'The deployment target (e.g. local Ministack vs a real AWS environment). Distinct from `env`/NODE_ENV, which is always "production" in Lambda for Express performance best-practices regardless of deployment target.',
    format: ['local', 'development', 'staging', 'production'],
    default: 'production',
    env: 'DEPLOYMENT_ENVIRONMENT',
  },
  oidc: {
    cookieSecrets: {
      doc: 'Cookie secrets for OIDC configuration.',
      format: Array,
      default: [],
      env: 'COOKIE_SECRETS',
    },
  },
  authentication: {
    accessTokenSecret: {
      doc: 'Access Token Secret for Login',
      default: '',
      nullable: false,
      format: String,
      env: 'ACCESS_JWT_SECRET',
    },
    accessTokenExpiry: {
      doc: 'Access Token Expiry Time for Login',
      format: String,
      default: '2h',
      env: 'ACCESS_JWT_EXPIRY',
    },

    refreshTokenSecret: {
      doc: 'Refresh Token Secret for Login',
      default: '',
      nullable: false,
      format: String,
      env: 'REFRESH_JWT_SECRET',
    },
    refreshTokenExpiry: {
      doc: 'Refresh Token Expiry Time for Login',
      format: String,
      default: '1d',
      env: 'REFRESH_JWT_EXPIRY',
    },
    issuer: {
      doc: 'ISSUER For APP MFA',
      default: '',
      nullable: false,
      format: String,
      env: 'ISSUER_NAME',
    },
    rpId: {
      doc: 'WebAuthn Relying Party ID - must match the domain the browser sees (e.g. "auth.example.com" or "localhost"), NOT the API Gateway/Lambda hostname. Passkeys are bound to this value; it must stay stable across deploys.',
      default: 'localhost',
      nullable: false,
      format: String,
      env: 'RP_ID',
    },
  },
  encryption: {
    secret: {
      doc: 'Secret for encryption',
      default: '',
      nullable: false,
      format: String,
      env: 'ENCRYPTION_SECRET_KEY',
    },
    secretiv: {
      doc: 'Secret iv for encryption',
      default: '',
      nullable: false,
      format: String,
      env: 'ENCRYPTION_SECRET_IV',
    },
    method: {
      doc: 'Secret iv for encryption',
      nullable: false,
      format: String,
      default: 'aes-256-cbc',
      env: 'ENCRYPTION_METHOD',
    },
  },
  email: {
    supportEmail: {
      doc: 'SES verified support/sender email address',
      default: '',
      nullable: false,
      format: String,
      env: 'SUPPORT_EMAIL',
    },
  },
});

config.validate({ allowed: 'strict' });

export default config;
