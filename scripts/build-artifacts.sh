#!/bin/bash
set -e

# Builds the backend Lambda zip and the frontend static site into a root
# artifacts/ folder, then uploads the Lambda zip to S3. Keyed by a SHA-256
# content hash of the zip so an unchanged backend reuses the same S3 key,
# letting callers skip redundant uploads/deploys.
#
# Usage: ./scripts/build-artifacts.sh

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ARTIFACTS_DIR="$ROOT_DIR/artifacts"
LAMBDA_ARTIFACT_DIR="$ARTIFACTS_DIR/lambda"
WEBSITE_ARTIFACT_DIR="$ARTIFACTS_DIR/website"

AWS_REGION="${AWS_REGION:-us-east-1}"
ENVIRONMENT="${ENVIRONMENT:-local}"
ARTIFACTS_BUCKET_NAME="${ARTIFACTS_BUCKET_NAME:-oidc-auth-lambda-artifacts-local}"

if [ "$ENVIRONMENT" = "local" ]; then
  AWS_ENDPOINT="--endpoint-url http://localhost:4566"
fi

mkdir -p "$LAMBDA_ARTIFACT_DIR" "$WEBSITE_ARTIFACT_DIR"

echo "🔨 Building backend Lambda..."
cd "$ROOT_DIR/packages/backend"
pnpm run build
cd "$ROOT_DIR"

cp packages/backend/build/handler.mjs "$LAMBDA_ARTIFACT_DIR/handler.mjs"
# JWKS keys are read from disk at runtime (see support/get-configuration.ts),
# so they must sit alongside handler.mjs in the deployed zip.
cp packages/backend/keys.json "$LAMBDA_ARTIFACT_DIR/keys.json"

cd "$LAMBDA_ARTIFACT_DIR"
rm -f handler.zip
zip -q handler.zip handler.mjs keys.json
cd "$ROOT_DIR"

echo "🔨 Building frontend..."
cd "$ROOT_DIR/packages/frontend"
pnpm run build
cd "$ROOT_DIR"

rm -rf "$WEBSITE_ARTIFACT_DIR"
cp -r packages/frontend/dist "$WEBSITE_ARTIFACT_DIR"
echo "✅ Website built to $WEBSITE_ARTIFACT_DIR (not yet deployed - CloudFront/S3 hosting is a future step)"

echo "☁️  Ensuring artifacts bucket exists ($ARTIFACTS_BUCKET_NAME)..."
if ! aws $AWS_ENDPOINT s3api head-bucket --bucket "$ARTIFACTS_BUCKET_NAME" --region "$AWS_REGION" > /dev/null 2>&1; then
  if [ "$AWS_REGION" = "us-east-1" ]; then
    aws $AWS_ENDPOINT s3api create-bucket --bucket "$ARTIFACTS_BUCKET_NAME" --region "$AWS_REGION" > /dev/null
  else
    aws $AWS_ENDPOINT s3api create-bucket --bucket "$ARTIFACTS_BUCKET_NAME" --region "$AWS_REGION" \
      --create-bucket-configuration LocationConstraint="$AWS_REGION" > /dev/null
  fi
  echo "✓ Created bucket $ARTIFACTS_BUCKET_NAME"
else
  echo "✓ Bucket $ARTIFACTS_BUCKET_NAME already exists"
fi

ARTIFACT_SHA=$(sha256sum "$LAMBDA_ARTIFACT_DIR/handler.zip" | awk '{print $1}')
echo "🔑 Lambda artifact content hash: $ARTIFACT_SHA"

LAMBDA_S3_KEY="lambda/$ARTIFACT_SHA/handler.zip"
if aws $AWS_ENDPOINT s3api head-object --bucket "$ARTIFACTS_BUCKET_NAME" --key "$LAMBDA_S3_KEY" --region "$AWS_REGION" > /dev/null 2>&1; then
  echo "✓ Identical Lambda artifact already uploaded at s3://$ARTIFACTS_BUCKET_NAME/$LAMBDA_S3_KEY - skipping upload"
else
  echo "📦 Uploading Lambda artifact to s3://$ARTIFACTS_BUCKET_NAME/$LAMBDA_S3_KEY..."
  aws $AWS_ENDPOINT s3 cp "$LAMBDA_ARTIFACT_DIR/handler.zip" "s3://$ARTIFACTS_BUCKET_NAME/$LAMBDA_S3_KEY" --region "$AWS_REGION" --checksum-algorithm SHA256 > /dev/null
fi

if [ "$ENVIRONMENT" = "local" ]; then
  TFVARS_FILE="$ROOT_DIR/infra/environments/local/artifacts.auto.tfvars"
  cat > "$TFVARS_FILE" << EOF
artifacts_bucket_name = "$ARTIFACTS_BUCKET_NAME"
artifact_sha          = "$ARTIFACT_SHA"
EOF
  echo "✓ Wrote $TFVARS_FILE"
fi

if [ -n "${GITHUB_OUTPUT:-}" ]; then
  echo "artifact_sha=$ARTIFACT_SHA" >> "$GITHUB_OUTPUT"
fi

echo "✅ Artifacts built (Lambda key: $LAMBDA_S3_KEY)"