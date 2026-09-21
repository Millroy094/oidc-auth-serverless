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

## Revocation & introspection (RFC 7009 / RFC 7662)
- These are protocol endpoints for **OAuth clients and resource servers**, not admin console features — the admin console's own "revoke sessions" action already deletes the underlying grant directly, without going through either endpoint.
- **`POST /api/oidc/token/revocation`** — a relying party authenticates with its `client_id`/`client_secret` and submits a `token` (access or refresh) to revoke the grant. Useful for a client's own logout flow so a cached refresh token can't be replayed afterwards.
- **`POST /api/oidc/token/introspection`** — lets a resource server check, in real time, whether a token it was just handed is still valid (not expired, not revoked), instead of only trusting local JWT signature/`exp` validation. This is what makes an admin's "revoke sessions" action take effect on already-issued **access tokens** immediately, rather than only preventing future refreshes — but only for resource servers that actually call it. A resource server that only checks the JWT signature/`exp` locally will keep accepting a revoked access token until it naturally expires.
- Both endpoints require the caller to authenticate as a registered client (see "Registering a new OIDC client" above) — a resource server that wants to introspect tokens must be registered as a client itself (typically with the `client_credentials` grant) so it can authenticate to `/token/introspection`.

## Managing users
- **Account → Users** lists all registered users; admins can suspend/unsuspend, edit roles, edit profile fields, force-reset a user's MFA (`resetMFA`), or force-revoke sessions.
- **Add User** creates an account without setting a password: `UserService.createUser` generates a random unusable password, and `sendAccountCreatedNotification` emails the new user instructions to use "Forgot Password" (with their email) to set their own password and complete registration — deliberately avoiding sending a real OTP (see the "one active OTP per channel" note in [authentication.md](./authentication.md)).

## Token & session lifetimes
- **Account → Settings** lets admins configure how long access tokens, ID tokens, refresh tokens, sessions, and grants remain valid (entered in minutes, stored in seconds).
- Backed by a single-item `Settings` DynamoDB table (`SettingsService`); `get-configuration.ts` reads these values through the same 30-second in-memory cache used for clients, so changes take effect on running Lambda instances within 30s (cold starts always read fresh).
- Values are bounded server-side to between 5 minutes and 30 days; if no settings have been saved yet, defaults are used (1 hour for access/ID tokens, 2 hours for refresh tokens/sessions/grants).

## Allowing or blocking new user registration
- The same **Account → Settings** page has an "Allow new user registration" toggle, stored on the same `Settings` item (`registrationEnabled`, defaults to `true`).
- When disabled, `POST /api/user/register` rejects new sign-ups with a `403`, and the frontend registration page (`/registration`) shows a "registration is closed" message instead of the form; the "Not registered? Create an account" link on the login page is also hidden. Existing users can still log in as normal.
- The registration form and login page read this flag from the existing public `GET /api/user/public-config` endpoint (no caching — always reads the current value), so it always reflects the latest setting without waiting on the 30-second TTL cache.
