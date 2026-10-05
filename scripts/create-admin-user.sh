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

if [ "$ENVIRONMENT" = "local" ]; then
  AWS_ENDPOINT="--endpoint-url http://localhost:4566"
fi

echo "🔧 Creating admin user in DynamoDB table: $TABLE_NAME"
echo "   Email: $EMAIL"
echo "   Environment: $ENVIRONMENT"
echo "   Region: $AWS_REGION"

echo "📋 Checking if user already exists..."
EXISTING=$(aws dynamodb query \
  $AWS_ENDPOINT \
  --table-name "$TABLE_NAME" \
  --index-name "email-index" \
  --key-condition-expression "email = :email" \
  --expression-attribute-values "{\":email\": {\"S\": \"$EMAIL\"}}" \
  --region "$AWS_REGION" \
  --output json 2>/dev/null || echo '{"Items":[]}')

USER_EXISTS=0
EXISTING_USER_ID=""

if command -v jq &> /dev/null; then
  EXISTING_USER_ID=$(echo "$EXISTING" | jq -r '.Items[0].userId.S // empty')
else
  EXISTING_USER_ID=$(echo "$EXISTING" | grep -o '"userId": *{"S": *"[^"]*"' | head -1 | sed 's/.*"\([^"]*\)".*/\1/')
fi

if [ -n "$EXISTING_USER_ID" ] && [ "$EXISTING_USER_ID" != "null" ]; then
  echo "⚠️  Admin user already exists with email: $EMAIL"
  echo "   Existing userId: $EXISTING_USER_ID"
  USER_EXISTS=1
fi

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

if [ "$USER_EXISTS" -eq 1 ]; then
  if [ -z "$EXISTING_USER_ID" ] || [ "$EXISTING_USER_ID" = "null" ]; then
    echo "❌ ERROR: Could not extract userId from existing user"
    echo "   This may be a database issue. Please check manually:"
    echo "   aws dynamodb scan --endpoint-url http://localhost:4566 --table-name User --region us-east-1"
    exit 1
  fi

  echo "🗑️  Deleting existing user (userId: $EXISTING_USER_ID)..."
  DELETE_RESULT=$(aws dynamodb delete-item \
    $AWS_ENDPOINT \
    --table-name "$TABLE_NAME" \
    --key "{\"userId\": {\"S\": \"$EXISTING_USER_ID\"}}" \
    --region "$AWS_REGION" 2>&1)

  if [ $? -eq 0 ]; then
    echo "✅ Old user deleted successfully"
  else
    echo "❌ Failed to delete old user:"
    echo "$DELETE_RESULT"
    exit 1
  fi
fi

USER_ID=$(pnpm exec node -e "console.log(require('crypto').randomUUID())")

echo "📝 Creating user with ID: $USER_ID"

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
