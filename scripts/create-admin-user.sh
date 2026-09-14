#!/bin/bash
set -e

# Create initial admin user in DynamoDB
# Usage: PASSWORD=testpass123 ./scripts/create-admin-user.sh

if [ -z "$PASSWORD" ]; then
  echo "❌ PASSWORD environment variable is required"
  echo "Usage: PASSWORD=testpass123 ./scripts/create-admin-user.sh"
  exit 1
fi

if [ -z "$AWS_REGION" ]; then
  AWS_REGION="us-east-1"
fi

# Determine environment from ENVIRONMENT variable or default to local
ENVIRONMENT="${ENVIRONMENT:-local}"
TABLE_NAME="oidc-auth-${ENVIRONMENT}"
EMAIL="admin@example.com"
FIRST_NAME="Admin"
LAST_NAME="User"

# For local/Ministack, use endpoint URL
if [ "$ENVIRONMENT" = "local" ]; then
  AWS_ENDPOINT="--endpoint-url http://ministack:4566"
fi

echo "🔧 Creating admin user in DynamoDB table: $TABLE_NAME"
echo "   Email: $EMAIL"
echo "   Environment: $ENVIRONMENT"
echo "   Region: $AWS_REGION"

# Check if user already exists
echo "📋 Checking if user already exists..."
EXISTING=$(aws dynamodb query \
  $AWS_ENDPOINT \
  --table-name "$TABLE_NAME" \
  --index-name gsi1 \
  --key-condition-expression "gsi1pk = :email" \
  --expression-attribute-values "{\":email\": {\"S\": \"email#$EMAIL\"}}" \
  --region "$AWS_REGION" \
  --output json 2>/dev/null || echo '{"Items":[]}')

if [ "$(echo "$EXISTING" | grep -c "\"email#$EMAIL\"")" -gt 0 ]; then
  echo "✅ Admin user already exists with email: $EMAIL"
  exit 0
fi

# Hash password using Node.js
echo "🔐 Hashing password..."
HASHED_PASSWORD=$(pnpm exec node -e "
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

# Generate UUID
USER_ID=$(pnpm exec node -e "console.log(require('crypto').randomUUID())")

echo "📝 Creating user with ID: $USER_ID"

# Create user in DynamoDB
aws dynamodb put-item \
  $AWS_ENDPOINT \
  --table-name "$TABLE_NAME" \
  --item "{
    \"pk\": {\"S\": \"user#$USER_ID\"},
    \"sk\": {\"S\": \"metadata\"},
    \"gsi1pk\": {\"S\": \"email#$EMAIL\"},
    \"gsi1sk\": {\"S\": \"metadata\"},
    \"email\": {\"S\": \"$EMAIL\"},
    \"firstName\": {\"S\": \"$FIRST_NAME\"},
    \"lastName\": {\"S\": \"$LAST_NAME\"},
    \"password\": {\"S\": \"$HASHED_PASSWORD\"},
    \"emailVerified\": {\"BOOL\": true},
    \"roles\": {\"L\": [{\"S\": \"admin\"}]},
    \"mfa\": {
      \"M\": {
        \"preference\": {\"S\": \"\"},
        \"app\": {\"M\": {\"verified\": {\"BOOL\": false}}},
        \"sms\": {\"M\": {\"verified\": {\"BOOL\": false}}},
        \"email\": {\"M\": {\"verified\": {\"BOOL\": false}}},
        \"passkey\": {\"M\": {\"verified\": {\"BOOL\": false}}}
      }
    },
    \"createdAt\": {\"N\": \"$(date +%s)\"},
    \"updatedAt\": {\"N\": \"$(date +%s)\"}
  }" \
  --region "$AWS_REGION"

echo "✅ Admin user created successfully!"
echo ""
echo "Credentials:"
echo "  Email:    $EMAIL"
echo "  Password: $PASSWORD"
