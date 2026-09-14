#!/bin/bash
set -e

# Watch backend for changes and automatically rebuild + redeploy Lambda
# Usage: ./scripts/watch-backend.sh

BACKEND_DIR="packages/backend"

echo "👀 Watching $BACKEND_DIR for changes..."
echo ""

# Initial build + deploy
./scripts/deploy-backend.sh

echo ""
echo "🚀 Watching for changes... (Press Ctrl+C to exit)"
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

    ./scripts/deploy-backend.sh
    echo ""
  fi

  sleep 1
done
