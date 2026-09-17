# OIDC Auth Serverless

A self-hosted OpenID Connect (OIDC) identity provider and authentication server, built to be fully serverless on AWS. It provides login, registration, MFA (TOTP/SMS/Email OTP), WebAuthn/passkeys, session management, and an admin console for managing users, OIDC clients, and protected resources — all backed by a single Lambda function, DynamoDB, and a static React frontend served through CloudFront.

## Table of contents

- [Architecture](#architecture)
- [Logical parts](#logical-parts)
- [Documentation](#documentation)
- [Local development](#local-development)
- [CI/CD](#cicd)

## Architecture

```
                         ┌─────────────────────────────┐
                         │        CloudFront            │
   Browser  ───────────► │  (single distribution, one   │
                         │   custom domain)              │
                         └───────────┬──────────────────┘
                                     │
                 ┌───────────────────┼───────────────────┐
                 │ default behavior  │  /api/* behavior    │
                 ▼                   ▼
        ┌─────────────────┐  ┌──────────────────────┐
        │   S3 (private)   │  │  API Gateway (HTTP)   │
        │  React SPA build │  │  $default stage        │
        └─────────────────┘  └──────────┬────────────┘
                                         │ AWS_PROXY
                                         ▼
                              ┌────────────────────┐
                              │   Lambda (Express)   │
                              │  oidc-provider +     │
                              │  custom auth/MFA/    │
                              │  passkey/admin APIs   │
                              └─────────┬───────────┘
                                        │
              ┌─────────────────────────┼───────────────────────┐
              ▼                         ▼                       ▼
       ┌─────────────┐          ┌──────────────┐        ┌──────────────┐
       │  DynamoDB     │          │  SES / SNS    │        │  SSM Parameter│
       │  (Users,      │          │  (email/SMS   │        │  Store        │
       │  Clients,     │          │  OTP delivery)│        │  (secrets/     │
       │  Resources,   │          └──────────────┘        │  config)       │
       │  OTP, OIDC     │                                  └──────────────┘
       │  sessions,     │
       │  WebAuthn      │
       │  challenges)   │
       └─────────────┘
```

**Why this shape:**
- **One Lambda, one Express app.** `oidc-provider` and all custom routes (auth, MFA, passkeys, admin) run in a single `serverless-http`-wrapped Express app behind API Gateway (HTTP API, v2). No per-route Lambdas — cold starts and IAM stay simple.
- **CloudFront in front of both origins.** The SPA (S3) and the API (API Gateway) sit behind the *same* CloudFront distribution and the *same* custom domain, so the browser never deals with CORS for first-party calls — `/api/*` is just routed to a different origin at the edge.
- **DynamoDB via `dynamoose`**, one table per entity (`User`, `Client`, `Resource`, `OTP`, `Challenge`, `OIDCStore`). Tables are Terraform-managed; the Lambda's IAM role is deliberately read/write-only on items (no `CreateTable`), so table lifecycle is entirely infrastructure-owned.
- **Secrets/config via SSM Parameter Store**, loaded into `process.env` at cold start (`support/ssm-config.ts`) before the rest of the app's config schema is built.
- **Terraform Cloud** manages all infrastructure, with two independent environments (`local` targeting Ministack, `production` targeting real AWS) sharing the same reusable modules under `infra/modules`.

## Logical parts

- **[Backend](./docs/backend.md)** (`packages/backend`) — the Express app (auth, MFA, passkeys, OIDC, admin APIs) compiled to a single Lambda bundle.
- **[Frontend](./docs/frontend.md)** (`packages/frontend`) — the React SPA (login, registration, account/security, admin console).
- **[Infrastructure](./docs/infrastructure.md)** (`infra/`) — Terraform modules and per-environment configuration (`local` vs `production`).

## Documentation

- **[Authentication, MFA & passkey flows](./docs/authentication.md)** — how login, MFA (TOTP/SMS/Email), passkeys/WebAuthn, and sessions work end to end.
- **[Managing OIDC clients & resources (admin console)](./docs/admin-console.md)** — how to register relying-party clients, protected resources, and manage users as an admin.

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
This single command (`scripts/setup-local-dev.sh`):
1. Starts **Ministack** (local AWS emulator: S3, Lambda, API Gateway v2, IAM, SQS, SNS, SES, DynamoDB, SSM, Secrets Manager) and **Stackport** (a UI for inspecting Ministack's emulated resources at `http://localhost:8080`) via `docker-compose`.
2. Installs root/backend/frontend dependencies.
3. Builds the backend Lambda bundle and frontend, and uploads the Lambda artifact to a Ministack S3 bucket (`scripts/build-artifacts.sh`).
4. Runs `terraform apply` against `infra/environments/local`, provisioning everything (DynamoDB tables, Lambda, API Gateway, SSM parameters, SNS topic) inside Ministack.
5. Writes `packages/frontend/.env.local` so Vite's dev-server proxy talks to Ministack directly (Ministack routes API Gateway HTTP APIs by `Host` header rather than real DNS, and expects the stage name as a path prefix — see `vite.config.ts`).
6. Creates a default admin user (`admin@example.com` / `testpass123`).

### Running
In two separate terminals:
```bash
./scripts/watch-backend.sh     # rebuilds + redeploys the Lambda to Ministack on every backend file change
cd packages/frontend && pnpm dev
```
Then open `http://localhost:5173`.

> Local SES emails are **not delivered anywhere** by default — Ministack captures them in memory. Inspect what was "sent" via:
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

Deploys are automated via **GitHub Actions** (`.github/workflows/deploy.yml`) on every push to `main`, against **Terraform Cloud** (which has auto-apply enabled — a single "create run" both plans and applies).

Pipeline steps:
1. Checkout, install dependencies (`pnpm install --frozen-lockfile`).
2. Assume an AWS IAM role via OIDC (`aws-actions/configure-aws-credentials`, no long-lived AWS keys stored in GitHub).
3. Build backend + frontend artifacts and upload the Lambda zip to S3 (`scripts/build-artifacts.sh`), keyed by the current commit SHA.
4. Update the `artifact_sha` Terraform Cloud workspace variable via the TFC API, so the next Terraform run deploys *this* commit's Lambda code.
5. Upload the `infra/` configuration to the TFC workspace and trigger a run (`create-run`) — this plans **and** applies (auto-apply is on).
6. Fetch the workspace's Terraform outputs (frontend S3 bucket name, CloudFront distribution ID).
7. Sync the built frontend to S3 and invalidate the CloudFront cache so changes go live immediately.

### Required GitHub configuration
**Repository variables:**
- `TF_ORG`, `TF_WORKSPACE` — Terraform Cloud organization/workspace.
- `AWS_ROLE_ARN`, `AWS_REGION` — IAM role (OIDC-federated) and region for deployment.

**Repository secrets:**
- `TF_API_TOKEN` — Terraform Cloud API token.

**Terraform Cloud workspace variables** (set once, outside CI):
- `support_email`, `domain_name` — required, environment-specific values (see `infra/environments/production/variables.tf`).
- `artifact_sha` — managed by CI (see step 4 above); harmless placeholder needed on first setup.

### Notes
- Terraform state, secrets generation (JWT/encryption keys, cookie secrets), and all AWS resource provisioning live entirely in Terraform Cloud — nothing sensitive is stored in the repository or GitHub Actions secrets beyond the TFC token and AWS role ARN.
- The Lambda's IAM role only grants item-level DynamoDB permissions (`GetItem`/`PutItem`/`UpdateItem`/`DeleteItem`/`Query`/`Scan`/`DescribeTable`) — table creation is exclusively Terraform's responsibility, so `dynamoose`'s automatic table creation/wait-for-active behavior is disabled outside local dev (see `support/dynamoose-table-options.ts`).
