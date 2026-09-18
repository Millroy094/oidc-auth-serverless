#!/bin/bash
set -e

# Build and deploy the backend Lambda directly (bypassing S3/Terraform) via
# `aws lambda update-function-code`, either once (--once) or in a watch loop
# that redeploys whenever a backend .ts file changes.
# Usage: ./scripts/watch-backend.sh [--once]

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

deploy_backend() {
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

  cd "$BUILD_DIR"
  rm -f handler.zip
  zip -q handler.zip handler.mjs
  cd - > /dev/null

  echo "📦 Deploying to Lambda ($LAMBDA_FUNCTION_NAME)..."
  aws lambda update-function-code \
    $AWS_ENDPOINT \
    --function-name "$LAMBDA_FUNCTION_NAME" \
    --zip-file "fileb://$ZIP_FILE" \
    --region "$AWS_REGION" > /dev/null

  echo "✅ Lambda deployed at $(date '+%H:%M:%S')"
}

deploy_backend

if [ "$1" = "--once" ]; then
  exit 0
fi

echo ""
echo "👀 Watching $BACKEND_DIR for changes..."
echo "🚀 Press Ctrl+C to exit"
echo ""

while true; do
  # Use find to check if any backend file changed in the last 2 seconds
  # (excludes node_modules and the build output directory)
  CHANGED=$(find "$BACKEND_DIR" -type f -name "*.ts" \
    -not -path "*/node_modules/*" \
    -not -path "*/build/*" \
    -newermt "2 seconds ago" 2>/dev/null || echo "")

  if [ -n "$CHANGED" ]; then
    echo ""
    echo "📝 Changes detected:"
    echo "$CHANGED" | sed 's/^/   /'
    echo ""

    # Small delay to catch multiple file changes
    sleep 1

    deploy_backend
    echo ""
  fi

  sleep 1
done
