import dotenv from 'dotenv';
import convict from 'convict';

dotenv.config();

const config = convict({
  env: {
    doc: 'The application environment.',
    format: ['production', 'development', 'test'],
    default: 'development',
    env: 'NODE_ENV',
  },
  oidc: {
    cookieSecrets: {
      doc: 'Cookie secrets for OIDC configuration.',
      format: Array,
      default: [],
      env: 'COOKIE_SECRETS',
    },
  },
  db: {
    doc: 'DynamoDB Database endpoint',
    format: String,
    default: 'http://localhost:8000',
    env: 'DYNAMO_DB_ENDPOINT',
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
    service: {
      doc: 'Email Service name',
      default: '',
      nullable: false,
      format: String,
      env: 'EMAIL_SERVICE',
    },
    address: {
      doc: 'Email Address to send emails from',
      default: '',
      nullable: false,
      format: String,
      env: 'EMAIL_ADDRESS',
    },
    password: {
      doc: 'Email Password to send emails',
      default: '',
      nullable: false,
      format: String,
      env: 'EMAIL_PASSWORD',
    },
  },
  aws: {
    accessKey: {
      doc: 'AWS access key',
      default: '',
      nullable: false,
      format: String,
      env: 'AWS_ACCESS_KEY',
    },
    secretKey: {
      doc: 'AWS secret key',
      default: '',
      nullable: false,
      format: String,
      env: 'AWS_SECRET_KEY',
    },
    region: {
      doc: 'AWS region',
      default: '',
      nullable: false,
      format: String,
      env: 'AWS_REGION',
    },
  },
});

config.validate({ allowed: 'strict' });

export default config;
