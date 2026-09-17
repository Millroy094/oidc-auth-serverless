# Backend (`packages/backend`)

Express app compiled to a single ESM bundle (`esbuild`) and deployed as the Lambda's code.

- **`app.ts`** — Express app setup: middleware (cookies, JSON body parsing, no-cache headers, OIDC provider injection) and route mounting under `/api/oidc`, `/api/user`, `/api/admin`, `/api/health-check`.
- **`handler.ts`** — Lambda entrypoint; wraps the Express app with `serverless-http`, initializing the app once per cold start.
- **`routes/`** — Express routers (`user.ts`, `admin.ts`, `oidc.ts`, `health-check.ts`).
- **`controllers/`** — Request/response handling per route group (`user`, `admin`, `oidc`, `passkey`, `health-check`).
- **`services/`** — Business logic: `user.ts` (registration, login, password reset, sessions), `mfa/` (OTP setup/verify/send, split by purpose — login vs setup), `otp.ts`, `passkey.ts` (WebAuthn via `@simplewebauthn/server`), `client.ts` / `resource.ts` (OIDC client & resource-server management).
- **`models/`** — `dynamoose` schemas/models, one per DynamoDB table (`User`, `Client`, `Resource`, `OTP`, `Challenge`, `OIDCStore`).
- **`adapter/DynamoDbAdapter.ts`** — custom `oidc-provider` storage adapter backed by the `OIDCStore` DynamoDB table (grants, sessions, interactions, etc., with TTL-based expiry).
- **`middleware/`** — `authenticate.ts` (JWT access-token verification, always returns 401 on failure), `add-oidc-provider.ts`, `error-handler.ts`.
- **`support/`** — `env-config.ts` (`convict`-based schema, the single source of truth for config), `ssm-config.ts` (pulls SSM parameters into `process.env` before config is built), `get-configuration.ts` (builds the `oidc-provider` `Configuration` object, including cached client lookups and resource-indicator validation), `dynamoose-table-options.ts` (disables auto table creation/waiting outside local dev).
- **`utils/`** — encryption helpers, SES/SNS notification senders, logging (`winston`).
