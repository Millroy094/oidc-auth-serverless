# Contributing

Thanks for your interest in improving this project! This guide covers how to get set up, the conventions the codebase follows, and how to submit changes.

## Getting started

Follow the [Local development](./README.md#local-development) section of the README to set up Ministack, install dependencies, and run the backend/frontend locally. In short:

```bash
pnpm run setup:local
```

Then, in two terminals:

```bash
./scripts/watch-backend.sh
cd packages/frontend && pnpm dev
```

## Making a change

1. **Create a branch** off `main` (e.g. `fix/session-cookie-expiry`, `feat/admin-settings-page`).
2. **Keep changes focused.** Prefer small, single-purpose pull requests over large multi-topic ones — they're easier to review and to roll back if something goes wrong.
3. **Update relevant docs.** If you change behavior described in `README.md` or `docs/*.md`, update those files in the same PR.
4. **Update Terraform where relevant.** Infrastructure changes (`infra/`) should be accompanied by `terraform fmt` and `terraform validate` passing for every affected environment (`infra/environments/local`, `infra/environments/production`).

## Commit messages

Commits on `main` drive automatic semantic versioning and GitHub releases (`.github/workflows/deploy.yml`), so please follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(optional scope): <description>

[optional body]

[optional footer(s)]
```

Common types: `feat` (minor version bump), `fix` (patch version bump), `docs`, `chore`, `refactor`, `test`. A `BREAKING CHANGE:` footer (or `!` after the type/scope) triggers a major version bump.

Examples:
```
fix(auth): correct refresh token secret used when rotating tokens
feat(admin): add configurable token/session TTL settings
docs: document revocation and introspection endpoints
```

## Code style & pre-commit checks

- Formatting/linting is enforced automatically on commit via Husky + `lint-staged` (ESLint + Prettier for JS/TS, `terraform fmt` for `.tf` files, Prettier for YAML).
- You can run the same checks manually before committing:
  ```bash
  pnpm run lint
  pnpm run format
  ```
- For backend/frontend TypeScript changes, also run a type check in the relevant package:
  ```bash
  cd packages/backend && npx tsc --noEmit
  cd packages/frontend && npx tsc --noEmit
  ```

## Pull requests

- Make sure `pnpm run lint`, `tsc --noEmit` (backend and/or frontend, as relevant), and `terraform validate` (if you touched `infra/`) all pass.
- Describe **what** changed and **why** in the PR description — link any related issue.
- Screenshots/recordings are appreciated for UI changes.
- A maintainer will review and may ask for changes before merging. Once approved and merged to `main`, CI handles deployment and versioning automatically — no manual release steps needed.

## Reporting bugs & requesting features

Use the [issue templates](./.github/ISSUE_TEMPLATE) (bug report / feature request) when opening an issue.

## Reporting security vulnerabilities

Please **do not** open a public issue for security vulnerabilities — see [SECURITY.md](./.github/SECURITY.md) for how to report them privately.
