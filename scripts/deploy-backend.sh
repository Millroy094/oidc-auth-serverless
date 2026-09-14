#!/bin/bash
set -e

# Build the backend Lambda and deploy it to the running Lambda function.
# Used both for the one-off deploy in setup-local-dev.sh and repeatedly by
# watch-backend.sh.
# Usage: ./scripts/deploy-backend.sh

BACKEND_DIR="packages/backend"
BUILD_DIR="$BACKEND_DIR/build"
HANDLER_FILE="$BUILD_DIR/handler.mjs"
ZIP_FILE="$BUILD_DIR/handler.zip"
AWS_REGION="${AWS_REGION:-us-east-1}"
ENVIRONMENT="${ENVIRONMENT:-local}"

# For local/Ministack, use the host-mapped endpoint (this script runs on the
# host machine, not inside the Docker network, so use localhost not the
# "ministack" service hostname).
if [ "$ENVIRONMENT" = "local" ]; then
  AWS_ENDPOINT="--endpoint-url http://localhost:4566"
fi

# Resolve the actual deployed Lambda function name from Terraform, matching
# infra/environments/local/main.tf's `${var.project_name}-backend-local` naming.
LAMBDA_FUNCTION_NAME=$(cd infra/environments/local && terraform output -raw lambda_function_name 2>/dev/null || echo "")
if [ -z "$LAMBDA_FUNCTION_NAME" ]; then
  echo "❌ Could not read lambda_function_name from Terraform output."
  echo "   Run 'terraform apply' in infra/environments/local first."
  exit 1
fi

echo "🔨 Building backend Lambda..."
cd "$BACKEND_DIR"
pnpm run build
cd - > /dev/null

if [ ! -f "$HANDLER_FILE" ]; then
  echo "❌ Build failed: $HANDLER_FILE not found"
  exit 1
fi

# JWKS keys are read from disk at runtime (see support/get-configuration.ts),
# so they must sit alongside handler.mjs in the deployed zip.
cp "$BACKEND_DIR/keys.json" "$BUILD_DIR/keys.json"

cd "$BUILD_DIR"
rm -f handler.zip
zip -q handler.zip handler.mjs keys.json
cd - > /dev/null

echo "📦 Deploying to Lambda ($LAMBDA_FUNCTION_NAME)..."
aws lambda update-function-code \
  $AWS_ENDPOINT \
  --function-name "$LAMBDA_FUNCTION_NAME" \
  --zip-file "fileb://$ZIP_FILE" \
  --region "$AWS_REGION" > /dev/null

echo "✅ Lambda deployed at $(date '+%H:%M:%S')"
