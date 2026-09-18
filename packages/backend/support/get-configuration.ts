import jose from 'node-jose';
import { Configuration, JWKS, errors } from 'oidc-provider';
import DynamoDBAdapter from '../adapter/DynamoDbAdapter.ts';
import { ClientItem } from '../models/Client.ts';
import Resource, { ResourceScope } from '../models/Resource.ts';
import User from '../models/User.ts';
import ClientService from '../services/client.ts';
import config from './env-config.ts';

const cookieSecrets = config.get('oidc.cookieSecrets');

let jwksCache: JWKS | null = null;

// Generated once by Terraform and stored as a PEM in SSM - must never be
// regenerated here, or every previously issued token would be invalidated.
const getJwks = async (): Promise<JWKS> => {
  if (jwksCache) {
    return jwksCache;
  }

  const key = await jose.JWK.asKey(config.get('oidc.jwksPrivateKey'), 'pem', {
    alg: 'RS256',
    use: 'sig',
  });
  const keyStore = jose.JWK.createKeyStore();
  await keyStore.add(key);

  jwksCache = keyStore.toJSON(true) as JWKS;
  return jwksCache;
};

const CLIENTS_CACHE_TTL_MS = 30_000;
let clientsCache: { data: ClientItem[]; expiresAt: number } | null = null;

const getCachedClients = async (): Promise<ClientItem[]> => {
  if (clientsCache && Date.now() < clientsCache.expiresAt) {
    return clientsCache.data;
  }

  const clients = await ClientService.getClients();
  clientsCache = {
    data: clients,
    expiresAt: Date.now() + CLIENTS_CACHE_TTL_MS,
  };

  return clients;
};

const getConfiguration = async (): Promise<Configuration> => {
  const clients = await getCachedClients();
  const jwks = await getJwks();

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
      resourceIndicators: {
        enabled: true,
        getResourceServerInfo: async (_ctx, resourceIndicator, client) => {
          const resource = await Resource.get(resourceIndicator);

          if (!resource) {
            throw new errors.InvalidTarget(
              'resource indicator is not recognised',
            );
          }

          const grant = (client.resources as ResourceScope[] | undefined)?.find(
            (entry) => entry.id === resourceIndicator,
          );

          const allowedScopes = grant
            ? resource.scopes.filter((scope) => grant.scopes.includes(scope))
            : [];

          if (!allowedScopes.length) {
            throw new errors.InvalidTarget(
              'client is not authorized to access this resource',
            );
          }

          return {
            scope: allowedScopes.join(' '),
            audience: resource.id,
          };
        },
      },
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
                email_verified: account.emailVerified,
              }),
              ...(scope.includes('phone') && {
                phone_number: account.mobile,
              }),
              ...(scope.includes('profile') && {
                given_name: account.firstName,
                family_name: account.lastName,
                name: [account.firstName, account.lastName]
                  .filter(Boolean)
                  .join(' '),
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
      resources: client.resources,
      require_pkce: client.requirePkce,
    })),
    extraClientMetadata: {
      properties: ['resources', 'require_pkce'],
    },
    pkce: {
      required: (_ctx, client) => client.require_pkce as boolean,
    },
    claims: {
      openid: ['sub'],
      email: ['email', 'email_verified'],
      phone: ['phone_number'],
      profile: ['given_name', 'family_name', 'name'],
    },
    interactions: {
      // Absolute URL so the redirect always lands on the intended domain,
      // even if a request reaches the backend directly (bypassing
      // CloudFront). FRONTEND_URL covers local dev where the frontend and
      // backend run on different origins.
      url: (_ctx, interaction) =>
        `${process.env.FRONTEND_URL ?? config.get('oidc.issuerUrl') ?? ''}/?interactionId=${interaction.jti}`,
    },
  };
};

export default getConfiguration;
