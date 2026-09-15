import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Configuration, JWKS } from 'oidc-provider';
import DynamoDBAdapter from '../adapter/DynamoDbAdapter.ts';
import User from '../models/User.ts';
import ClientService from '../services/client.ts';
import config from './env-config.ts';

const keysPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  'keys.json',
);

const jwks = JSON.parse(fs.readFileSync(keysPath, 'utf-8')) as JWKS;
const cookieSecrets = config.get('oidc.cookieSecrets');

const getConfiguration = async (): Promise<Configuration> => {
  const clients = await ClientService.getClients();

  return {
    adapter: DynamoDBAdapter,
    jwks,
    cookies: {
      keys: cookieSecrets,
      long: { httpOnly: true, sameSite: 'strict' },
      short: { httpOnly: true, sameSite: 'strict' },
    },
    features: {
      devInteractions: { enabled: false },
      clientCredentials: { enabled: true },
      deviceFlow: { enabled: true },
      revocation: { enabled: true },
    },
    findAccount: async (_, id) => {
      const account = await User.get(id);
      return (
        account && {
          accountId: id,
          claims: (_, scope) => {
            return {
              sub: id,
              ...(scope.includes('email') && {
                email: account.email,
                emailVerified: account.emailVerified,
              }),
              ...(scope.includes('phone') && {
                mobile: account.mobile,
              }),
              ...(scope.includes('profile') && {
                firstName: account.firstName,
                lastName: account.lastName,
              }),
            };
          },
        }
      );
    },
    clients: clients.map((client) => ({
      client_id: client.clientId,
      client_secret: client.secret,
      redirect_uris: client.redirectUris,
      grant_types: client.grants,
      scope: client.scopes.join(' '),
    })),
    pkce: { required: () => true },
    claims: {
      openid: ['sub'],
      email: ['email', 'emailVerified'],
      phone: ['mobile'],
      profile: ['firstName', 'lastName'],
    },
    interactions: {
      // In production, CloudFront serves the frontend and proxies /api/* to
      // the backend under the same origin, so a relative URL resolves
      // correctly. Locally, the frontend (Vite) and backend (Ministack API
      // Gateway) run on different origins, so FRONTEND_URL must be set to
      // redirect back to the Vite dev server.
      url: (_ctx, interaction) =>
        `${process.env.FRONTEND_URL ?? ''}/?interactionId=${interaction.jti}`,
    },
  };
};

export default getConfiguration;
