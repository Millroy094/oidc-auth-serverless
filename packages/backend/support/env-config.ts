import convict from 'convict';
import { loadSsmParameters } from './ssm-config.ts';

// Fetch secrets from SSM before building the config schema - must complete
// before any module (e.g. utils/encryption.ts) reads config at import time.
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
    jwksPrivateKey: {
      doc: 'PEM-encoded RSA private key used to sign OIDC tokens, generated once by Terraform (tls_private_key) and stored in SSM Parameter Store - never regenerated on deploy.',
      default: '',
      nullable: false,
      format: String,
      env: 'JWKS_PRIVATE_KEY',
    },
    issuerUrl: {
      doc: 'Public-facing URL (scheme + host + /api/oidc mount path) the OIDC issuer/endpoints are advertised under, e.g. "https://auth.example.com/api/oidc". Must match the domain the browser sees (not the API Gateway/Lambda hostname) and the oidc-provider mount path in app.ts, so the issuer matches both the discovery document location and tokens\' `iss` claim. Leave empty to derive it from the request (used locally).',
      default: '',
      nullable: false,
      format: String,
      env: 'ISSUER_URL',
    },
  },
  captcha: {
    turnstileSiteKey: {
      doc: "Public Cloudflare Turnstile site key, served to the frontend via /api/user/public-config. Defaults to Cloudflare's always-passes test key for local development.",
      default: '1x00000000000000000000AA',
      format: String,
      env: 'TURNSTILE_SITE_KEY',
    },
    turnstileSecretKey: {
      doc: "Cloudflare Turnstile secret key used to verify captcha tokens server-side. Defaults to Cloudflare's always-passes test key for local development.",
      default: '1x0000000000000000000000000000000AA',
      nullable: false,
      format: String,
      env: 'TURNSTILE_SECRET_KEY',
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
  security: {
    originVerifySecret: {
      doc: 'Secret CloudFront attaches as an X-Origin-Verify header to every request it forwards to the API Gateway origin. The backend rejects requests missing/mismatching it, so the API can only be reached through CloudFront. Not enforced when deploymentEnvironment is "local".',
      default: '',
      format: String,
      env: 'ORIGIN_VERIFY_SECRET',
    },
  },
});

config.validate({ allowed: 'strict' });

export default config;
