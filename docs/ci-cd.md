# CI/CD Documentation

This project uses **GitHub Actions** to automate deployment workflows. All workflows are defined in `.github/workflows/`.

## Workflow Architecture

```
.github/
└── workflows/
    └── deploy.yml                  # Runs lint, builds, and deploys on push to main
```

## Main Workflows

### `deploy.yml` - Build & Deploy

**Trigger**: Push to `main` branch or manual `workflow_dispatch`

**What it does**:
1. Runs ESLint on the entire codebase (fails fast if issues found)
2. Builds backend Lambda artifact and frontend bundle
3. Uploads artifacts to AWS S3
4. Triggers Terraform Cloud run to provision/update infrastructure
5. Syncs frontend to S3 and invalidates CloudFront cache
6. Creates a GitHub release with changelog

**Flow**:
```
Push to main
  → deploy.yml triggers
    → lint job (ESLint check - must pass)
      → If lint fails, deployment stops
      → If lint passes:
        → Build artifacts
        → Upload to S3
        → Trigger Terraform
        → Sync frontend
        → Create release
```

## Lint Check

- **Tool**: ESLint
- **Scope**: Entire workspace (`**/*.{js,jsx,ts,tsx}`)
- **When**: Every push to `main` (before deployment)
- **Fail Condition**: Any ESLint errors or max-warnings exceeded
- **Fix**: `pnpm lint` locally to check, `pnpm format` to auto-fix many issues

## Secrets and Variables

All sensitive values (AWS keys, tokens, etc.) are managed as GitHub secrets or Terraform Cloud variables. Nothing sensitive lives in the repository.

### GitHub Repository Variables (set in Settings → Variables)
- `TF_ORG` - Terraform Cloud organization name
- `TF_WORKSPACE` - Terraform Cloud workspace name
- `AWS_ROLE_ARN` - IAM role ARN for deployment
- `AWS_REGION` - AWS region for deployment

### GitHub Repository Secrets (set in Settings → Secrets)
- `TF_API_TOKEN` - Terraform Cloud API token

### Terraform Cloud Variables (set in workspace settings)
- `support_email` - Support email address
- `domain_name` - Domain for deployment
- `turnstile_site_key` - Cloudflare Turnstile public key
- `turnstile_secret_key` - Cloudflare Turnstile secret key
- `artifact_sha` - Updated by CI (don't set manually)

## Deployment Checklist

Before pushing to `main`:

```bash
# 1. Verify no TypeScript errors
pnpm build

# 2. Run linter
pnpm lint

# 3. Push to main (or open PR to develop for review)
git push origin main
```

GitHub Actions will:
1. Build and deploy
2. Create a release with changelog

## Troubleshooting

### Workflow Not Triggering
- Check branch name matches trigger condition (main)
- Ensure `.github/workflows/*.yml` files are in the repo
- Check for syntax errors in workflow YAML

### Deployment Stuck or Not Starting
- Verify AWS credentials/role ARN are correct
- Check Terraform Cloud token is valid
- Review CloudWatch logs in AWS console

## Security

- All AWS credentials use OIDC federation (no long-lived keys in secrets)
- Terraform Cloud token stored as secret (minimal permissions)
- Deployment role has least-privilege IAM permissions
- Environment-specific secrets managed per-environment

See [CI/CD IAM roles](./ci-cd-iam-roles.md) for detailed permission requirements.

## References

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)












