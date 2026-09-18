# Architecture

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

## Why this shape

- **One Lambda, one Express app.** `oidc-provider` and all custom routes (auth, MFA, passkeys, admin) run in a single `serverless-http`-wrapped Express app behind API Gateway (HTTP API, v2). No per-route Lambdas — cold starts and IAM stay simple.
- **CloudFront in front of both origins.** The SPA (S3) and the API (API Gateway) sit behind the *same* CloudFront distribution and the *same* custom domain, so the browser never deals with CORS for first-party calls — `/api/*` is just routed to a different origin at the edge.
- **DynamoDB via `dynamoose`**, one table per entity (`User`, `Client`, `Resource`, `OTP`, `Challenge`, `OIDCStore`). Tables are Terraform-managed; the Lambda's IAM role is deliberately read/write-only on items (no `CreateTable`), so table lifecycle is entirely infrastructure-owned.
- **Secrets/config via SSM Parameter Store**, loaded into `process.env` at cold start (`support/ssm-config.ts`) before the rest of the app's config schema is built.
- **Terraform Cloud** manages all infrastructure, with two independent environments (`local` targeting Ministack, `production` targeting real AWS) sharing the same reusable modules under `infra/modules`.

## Logical parts

- **[Backend](./backend.md)** (`packages/backend`) — the Express app (auth, MFA, passkeys, OIDC, admin APIs) compiled to a single Lambda bundle.
- **[Frontend](./frontend.md)** (`packages/frontend`) — the React SPA (login, registration, account/security, admin console).
- **[Infrastructure](./infrastructure.md)** (`infra/`) — Terraform modules and per-environment configuration (`local` vs `production`).
