#!/bin/bash
set -e

# Create initial admin user in the "User" DynamoDB table
# Usage: PASSWORD=testpass123 ./scripts/create-admin-user.sh

if [ -z "$PASSWORD" ]; then
  echo "❌ PASSWORD environment variable is required"
  echo "Usage: PASSWORD=testpass123 ./scripts/create-admin-user.sh"
  exit 1
fi

AWS_REGION="${AWS_REGION:-us-east-1}"
ENVIRONMENT="${ENVIRONMENT:-local}"
TABLE_NAME="User"
EMAIL="admin@example.com"
FIRST_NAME="Admin"
LAST_NAME="User"

# For local/Ministack, use endpoint URL
if [ "$ENVIRONMENT" = "local" ]; then
  AWS_ENDPOINT="--endpoint-url http://localhost:4566"
fi

echo "🔧 Creating admin user in DynamoDB table: $TABLE_NAME"
echo "   Email: $EMAIL"
echo "   Environment: $ENVIRONMENT"
echo "   Region: $AWS_REGION"

# Check if user already exists (scan by email, matching how the backend looks up users)
echo "📋 Checking if user already exists..."
EXISTING=$(aws dynamodb scan \
  $AWS_ENDPOINT \
  --table-name "$TABLE_NAME" \
  --filter-expression "email = :email" \
  --expression-attribute-values "{\":email\": {\"S\": \"$EMAIL\"}}" \
  --region "$AWS_REGION" \
  --output json 2>/dev/null || echo '{"Items":[]}')

if [ "$(echo "$EXISTING" | grep -c "\"$EMAIL\"")" -gt 0 ]; then
  echo "✅ Admin user already exists with email: $EMAIL"
  exit 0
fi

# Hash password using Node.js (bcryptjs, matching the backend's User model).
# Run from packages/backend since pnpm workspaces don't hoist deps to the
# root node_modules - bcryptjs is only resolvable from there.
echo "🔐 Hashing password..."
HASHED_PASSWORD=$(cd packages/backend && pnpm exec node -e "
const bcrypt = require('bcryptjs');
const password = process.env.PASSWORD;
const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync(password, salt);
console.log(hash);
" 2>/dev/null || echo "")

if [ -z "$HASHED_PASSWORD" ]; then
  echo "❌ Failed to hash password. Ensure bcryptjs is installed."
  exit 1
fi

# Generate UUID for userId (hash key on the User table)
USER_ID=$(pnpm exec node -e "console.log(require('crypto').randomUUID())")

echo "📝 Creating user with ID: $USER_ID"

# Create user in DynamoDB, matching packages/backend/models/User.ts schema
aws dynamodb put-item \
  $AWS_ENDPOINT \
  --table-name "$TABLE_NAME" \
  --item "{
    \"userId\": {\"S\": \"$USER_ID\"},
    \"email\": {\"S\": \"$EMAIL\"},
    \"emailVerified\": {\"BOOL\": true},
    \"roles\": {\"L\": [{\"S\": \"admin\"}]},
    \"firstName\": {\"S\": \"$FIRST_NAME\"},
    \"lastName\": {\"S\": \"$LAST_NAME\"},
    \"password\": {\"S\": \"$HASHED_PASSWORD\"},
    \"mfa\": {
      \"M\": {
        \"preference\": {\"S\": \"\"},
        \"recoveryCodes\": {\"L\": []},
        \"app\": {\"M\": {\"secret\": {\"S\": \"\"}, \"subscriber\": {\"S\": \"\"}, \"verified\": {\"BOOL\": false}}},
        \"sms\": {\"M\": {\"subscriber\": {\"S\": \"\"}, \"verified\": {\"BOOL\": false}}},
        \"email\": {\"M\": {\"subscriber\": {\"S\": \"\"}, \"verified\": {\"BOOL\": false}}},
        \"passkey\": {\"M\": {\"credentials\": {\"L\": []}, \"verified\": {\"BOOL\": false}}}
      }
    },
    \"lastLoggedIn\": {\"N\": \"0\"},
    \"failedLogins\": {\"N\": \"0\"},
    \"suspended\": {\"BOOL\": false},
    \"credentials\": {\"L\": []},
    \"createdAt\": {\"N\": \"$(date +%s)000\"},
    \"updatedAt\": {\"N\": \"$(date +%s)000\"}
  }" \
  --region "$AWS_REGION"

echo "✅ Admin user created successfully!"
echo ""
echo "Credentials:"
echo "  Email:    $EMAIL"
echo "  Password: $PASSWORD"
