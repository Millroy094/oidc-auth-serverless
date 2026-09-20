# Managing OIDC clients & resources (admin console)

Users with the `admin` role get an extra `Account` section (`pages/Account/Clients`, `pages/Account/Resources`, `pages/Account/Users`, `pages/Account/Settings`) backed by `/api/admin/*` (all routes gated by `authenticate` + `authorize(['admin'])`).

## Registering a new OIDC client (relying party)
1. In **Account → Clients → Add Client**, provide: `clientId`, `clientName`, `scopes` (e.g. `openid profile email`), `grants` (e.g. `authorization_code`, `refresh_token`, `client_credentials`), and `redirectUris` (must be `https://`, except `localhost`/`127.0.0.1` which may be plain `http://`).
2. This calls `POST /api/admin/clients/new` → `ClientService`, which persists a new `Client` DynamoDB item. A client `secret` is auto-generated (random, encrypted at rest, decrypted on read) — copy it from the client detail view immediately, as it's the OAuth client secret your relying party will need.
3. Clients are read by `oidc-provider` through a **30-second in-memory cache** (`get-configuration.ts#getCachedClients`) — a brand-new/edited client can take up to 30s to be picked up by a running Lambda instance (cold starts always read fresh).
4. Standard OIDC endpoints (`/api/oidc/.well-known/openid-configuration`, `/authorization`, `/token`, `/userinfo`, etc.) are all handled by `oidc-provider` itself via the catch-all `router.use('/', ...)` in `routes/oidc.ts`.

## Registering a protected resource (API you want to protect with access tokens)
1. In **Account → Resources → Add Resource**, define a resource `id` (used as the OAuth `resource`/audience parameter — typically the resource server's own identifier/URL) and its available `scopes`.
2. Grant a client access to some or all of a resource's scopes by editing the client and adding a `resources: [{ id, scopes }]` entry (`UpdateClientBody.resources`).
3. When a client requests an access token with `resource=<resource-id>`, `getConfiguration`'s `resourceIndicators.getResourceServerInfo` validates the client is actually authorized for that resource and intersects the requested scopes with the client's granted scopes — unauthorized resource/scope combinations are rejected with `InvalidTarget`.
4. The resulting access token's `aud` (audience) claim is the resource's `id`; the protected API is expected to validate the token's signature (against this server's JWKS, exposed at the OIDC discovery endpoint) and `aud` claim itself — this project only issues the tokens, it doesn't proxy calls to resource servers.

## Managing users
- **Account → Users** lists all registered users; admins can suspend/unsuspend, edit roles, edit profile fields, force-reset a user's MFA (`resetMFA`), or force-revoke sessions.
- **Add User** creates an account without setting a password: `UserService.createUser` generates a random unusable password, and `sendAccountCreatedNotification` emails the new user instructions to use "Forgot Password" (with their email) to set their own password and complete registration — deliberately avoiding sending a real OTP (see the "one active OTP per channel" note in [authentication.md](./authentication.md)).

## Token & session lifetimes
- **Account → Settings** lets admins configure how long access tokens, ID tokens, refresh tokens, sessions, and grants remain valid (entered in minutes, stored in seconds).
- Backed by a single-item `Settings` DynamoDB table (`SettingsService`); `get-configuration.ts` reads these values through the same 30-second in-memory cache used for clients, so changes take effect on running Lambda instances within 30s (cold starts always read fresh).
- Values are bounded server-side to between 5 minutes and 30 days; if no settings have been saved yet, defaults are used (1 hour for access/ID tokens, 2 hours for refresh tokens/sessions/grants).
