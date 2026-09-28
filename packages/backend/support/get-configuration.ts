import jose from 'node-jose';
import { Configuration, JWKS, errors } from 'oidc-provider';
import DynamoDBAdapter from '../adapter/DynamoDbAdapter.ts';
import Resource, { ResourceScope } from '../models/Resource.ts';
import User from '../models/User.ts';
import SettingsService, { TtlSettings } from '../services/settings.ts';
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

const TTL_SETTINGS_CACHE_TTL_MS = 30_000;
let ttlSettingsCache: { data: TtlSettings; expiresAt: number } | null = null;

const getCachedTtlSettings = async (): Promise<TtlSettings> => {
  if (ttlSettingsCache && Date.now() < ttlSettingsCache.expiresAt) {
    return ttlSettingsCache.data;
  }

  const ttlSettings = await SettingsService.getTtlSettings();
  ttlSettingsCache = {
    data: ttlSettings,
    expiresAt: Date.now() + TTL_SETTINGS_CACHE_TTL_MS,
  };

  return ttlSettings;
};

const ROTATE_REFRESH_TOKEN_CACHE_TTL_MS = 30_000;
let rotateRefreshTokenCache: { data: boolean; expiresAt: number } | null = null;

const getCachedRotateRefreshTokenOnUse = async (): Promise<boolean> => {
  if (
    rotateRefreshTokenCache &&
    Date.now() < rotateRefreshTokenCache.expiresAt
  ) {
    return rotateRefreshTokenCache.data;
  }

  const rotateRefreshTokenOnUse =
    await SettingsService.getRotateRefreshTokenOnUse();
  rotateRefreshTokenCache = {
    data: rotateRefreshTokenOnUse,
    expiresAt: Date.now() + ROTATE_REFRESH_TOKEN_CACHE_TTL_MS,
  };

  return rotateRefreshTokenOnUse;
};

const getConfiguration = async (): Promise<Configuration> => {
  const jwks = await getJwks();
  const ttlSettings = await getCachedTtlSettings();
  const rotateRefreshTokenOnUse = await getCachedRotateRefreshTokenOnUse();

  return {
    adapter: DynamoDBAdapter,
    jwks,
    ttl: {
      AccessToken: ttlSettings.accessTokenTtl,
      IdToken: ttlSettings.idTokenTtl,
      RefreshToken: ttlSettings.refreshTokenTtl,
      Session: ttlSettings.sessionTtl,
      Grant: ttlSettings.grantTtl,
    },
    // Only override the library's adaptive rotation policy when the admin
    // has opted into strict always-rotate; omitting the key entirely (rather
    // than passing `false`) when they haven't restores oidc-provider's
    // default adaptive behaviour instead of disabling rotation outright.
    ...(rotateRefreshTokenOnUse ? { rotateRefreshToken: true } : {}),
    cookies: {
      keys: cookieSecrets,
      long: { httpOnly: true, sameSite: 'lax' },
      short: { httpOnly: true, sameSite: 'lax' },
    },
    features: {
      devInteractions: { enabled: false },
      clientCredentials: { enabled: true },
      deviceFlow: { enabled: true },
      revocation: { enabled: true },
      introspection: { enabled: true },
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

      // Blocks not just new logins but also existing refresh token/userinfo
      // use for an account suspended after it was already issued tokens -
      // findAccount is re-invoked on every such request, not just at login.
      if (!account || account.suspended) {
        return undefined;
      }

      return {
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
      };
    },
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
      // FRONTEND_URL covers local dev; otherwise fall back to issuerUrl's
      // origin, since the frontend is served from the same domain root
      // while issuerUrl includes the /api/oidc mount path.
      url: (_ctx, interaction) => {
        const issuerUrl = config.get('oidc.issuerUrl');
        const frontendOrigin =
          process.env.FRONTEND_URL ??
          (issuerUrl && new URL(issuerUrl).origin) ??
          '';

        if (!frontendOrigin) {
          throw new Error(
            'Frontend origin could not be determined. ' +
              'Set FRONTEND_URL environment variable or ensure oidc.issuerUrl is configured.',
          );
        }

        return `${frontendOrigin}/?interactionId=${interaction.jti}`;
      },
    },
  };
};

export default getConfiguration;
