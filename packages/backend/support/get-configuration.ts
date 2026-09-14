import { Configuration } from 'oidc-provider';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import DynamoDBAdapter from '../adapter/DynamoDbAdapter.ts';
import User from '../models/User.ts';
import ClientService from '../services/client.ts';
import config from './env-config.ts';

// Resolve relative to this module's own location (not process.cwd(), which
// is unreliable across `pnpm build`, direct-node debugging, and Lambda).
// deploy-backend.sh places keys.json alongside handler.mjs at the root of
// the deployed zip, so it always lives next to this running module.
const keysPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  'keys.json',
);

// Read once per cold start (getConfiguration runs on every request), not
// once per request - the file's content is immutable for the container's
// lifetime.
const jwks = JSON.parse(fs.readFileSync(keysPath, 'utf-8'));

const getConfiguration = async (): Promise<Configuration> => {
  const clients = await ClientService.getClients();

  return {
    adapter: DynamoDBAdapter,
    jwks,
    cookies: {
      keys: [...config.get('oidc.cookieSecrets')],
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
          claims: async (_, scope) => {
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
    pkce: { required: () => true, methods: ['S256'] },
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
      url: (ctx, interaction) => `${process.env.FRONTEND_URL ?? ''}/?interactionId=${interaction.jti}`,
    },
  };
};

export default getConfiguration;
