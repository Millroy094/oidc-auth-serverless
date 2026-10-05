# OIDC Auth Serverless

A self-hosted OpenID Connect (OIDC) identity provider and authentication server, fully serverless on AWS (Lambda + API Gateway + DynamoDB, with a React SPA served through CloudFront/S3).

## Features

- **User accounts** — registration, login, password reset, profile management.
- **Multi-factor authentication** — authenticator app (TOTP), SMS OTP, email OTP, and passkeys (WebAuthn), with a user-selectable preferred method and recovery codes.
- **Passkeys / WebAuthn** — register and use device passkeys (fingerprint/face/PIN) as an MFA factor; configure attestation type, authenticator types, and per-user limits from the admin console.
- **Sessions** — view and revoke active sessions from your account.
- **OIDC provider** — standards-compliant authorization code flow, discovery, JWKS, token/userinfo endpoints, for use as a login provider by other applications.
- **Admin console** — manage users (roles, suspension, MFA reset, sessions), register OIDC clients (relying parties), register protected resources (APIs) with scopes, configure token/session lifetimes, and open/close new user registration.
- **Account tab persistence** — the app remembers which Account tab you were last on and resets it on logout.

For a deeper dive into how each of these works, see [Documentation](#documentation) below.

## Documentation

- **[Architecture](./docs/architecture.md)** — system diagram, logical parts, and design rationale.
- **[Backend](./docs/backend.md)** — Express app structure, routes, services, models.
- **[Frontend](./docs/frontend.md)** — React SPA structure.
- **[Infrastructure](./docs/infrastructure.md)** — Terraform modules and environments.
- **[CI/CD](./docs/ci-cd.md)** — GitHub Actions workflows and deployment pipeline.
- **[CI/CD IAM roles](./docs/ci-cd-iam-roles.md)** — permissions required by the GitHub Actions deployment role and Terraform Cloud role.
- **[Authentication, MFA & passkey flows](./docs/authentication.md)** — how login, MFA, passkeys, and sessions work end to end.
- **[Admin console](./docs/admin-console.md)** — managing users, OIDC clients, resources, and token/session lifetime settings.

### Passkey Configuration & Development

- **[Passkey Configuration](./docs/passkey-configuration.md)** — configure passkey security settings, attestation types, authenticator types, and deployment scenarios.
- **[Cross-Device Passkey Registration](./docs/cross-device-passkey.md)** — register passkeys across devices using QR codes.

## Local development

### Prerequisites
- Docker
- Terraform
- pnpm (`packageManager` pinned in root `package.json`)
- Node.js (version pinned in `.node-version`)

### Setup
```bash
pnpm run setup:local
```
This single command spins up **Ministack** (a local AWS emulator) and **Stackport** (a UI for it, at `http://localhost:8080`), installs dependencies, builds and deploys the backend/frontend into Ministack via Terraform, and creates a default admin user (`admin@example.com` / `testpass123`).

### Running
In two separate terminals:
```bash
./scripts/watch-backend.sh     # rebuilds + redeploys the Lambda to Ministack on every backend file change
cd packages/frontend && pnpm dev
```
Then open `http://localhost:5173`.

> Local emails aren't delivered anywhere — Ministack captures them in memory. Inspect what was "sent" via:
> ```
> curl http://localhost:4566/_ministack/ses/messages
> ```

### Useful root scripts
| Script | Purpose |
|---|---|
| `pnpm run setup:local` | Full local environment bootstrap (see above). |
| `pnpm run dev` | Start the frontend dev server only. |
| `pnpm run backend:watch` | Watch + auto-redeploy the backend Lambda to Ministack. |
| `pnpm run backend:deploy` | One-off backend rebuild + redeploy (no watch loop). |
| `pnpm run admin:create` | Create an admin user (`scripts/create-admin-user.sh`). |
| `pnpm run lint` / `pnpm run format` | Lint/format the whole workspace. |

### Tearing down
```bash
docker-compose down
cd infra/environments/local && terraform destroy
```

## CI/CD

Deploys are automated via **GitHub Actions** on every push to `main`.

See **[CI/CD Documentation](./docs/ci-cd.md)** for:
- Workflow architecture
- Secrets and variables setup
- Deployment checklist
- Troubleshooting guide

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for setup, coding conventions, and how to submit a pull request. Security issues should be reported privately per [SECURITY.md](./.github/SECURITY.md).
