#!/bin/bash
set -e

# Watch backend for changes and automatically rebuild + redeploy Lambda
# Usage: ./scripts/watch-backend.sh

BACKEND_DIR="packages/backend"
BUILD_DIR="$BACKEND_DIR/build"
HANDLER_FILE="$BUILD_DIR/handler.js"
LAMBDA_FUNCTION_NAME="oidc-auth-lambda"
AWS_REGION="${AWS_REGION:-us-east-1}"
ENVIRONMENT="${ENVIRONMENT:-local}"

# For local/Ministack, use endpoint URL
if [ "$ENVIRONMENT" = "local" ]; then
  AWS_ENDPOINT="--endpoint-url http://ministack:4566"
fi

echo "👀 Watching backend for changes..."
echo "   Directory: $BACKEND_DIR"
echo "   Lambda: $LAMBDA_FUNCTION_NAME"
echo "   Region: $AWS_REGION"
echo ""

build_and_deploy() {
  echo "🔨 Rebuilding Lambda..."
  cd "$BACKEND_DIR"
  pnpm run build
  cd - > /dev/null

  if [ ! -f "$HANDLER_FILE" ]; then
    echo "❌ Build failed: $HANDLER_FILE not found"
    return 1
  fi

  # Create zip file
  ZIP_FILE="$BUILD_DIR/handler.zip"
  cd "$BUILD_DIR"
  zip -q handler.zip handler.js
  cd - > /dev/null

  echo "📦 Deploying to Lambda..."
  aws lambda update-function-code \
    $AWS_ENDPOINT \
    --function-name "$LAMBDA_FUNCTION_NAME" \
    --zip-file "fileb://$ZIP_FILE" \
    --region "$AWS_REGION" > /dev/null

  echo "✅ Lambda updated at $(date '+%H:%M:%S')"
}

# Initial build
build_and_deploy

# Watch for changes
echo ""
echo "🚀 Watching for changes... (Press Ctrl+C to exit)"
echo ""

while true; do
  # Use find to check if any backend file changed in the last 2 seconds
  CHANGED=$(find "$BACKEND_DIR/src" -type f \( -name "*.ts" -o -name "*.js" \) -newermt "2 seconds ago" 2>/dev/null || echo "")
  
  if [ -n "$CHANGED" ]; then
    echo ""
    echo "📝 Changes detected:"
    echo "$CHANGED" | sed 's/^/   /'
    echo ""
    
    # Small delay to catch multiple file changes
    sleep 1
    
    build_and_deploy
    echo ""
  fi
  
  sleep 1
done
