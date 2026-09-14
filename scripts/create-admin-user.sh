#!/bin/bash
set -e

# Create initial admin user in DynamoDB
# Usage: PASSWORD=mypassword AWS_REGION=us-east-1 ./create-admin-user.sh

if [ -z "$PASSWORD" ]; then
  echo "❌ PASSWORD environment variable is required"
  echo "Usage: PASSWORD=yourpassword ./scripts/create-admin-user.sh"
  exit 1
fi

if [ -z "$AWS_REGION" ]; then
  echo "⚠️  AWS_REGION not set, defaulting to us-east-1"
  AWS_REGION="us-east-1"
fi

# Determine environment from ENVIRONMENT variable or default to dev
ENVIRONMENT="${ENVIRONMENT:-dev}"
TABLE_NAME="oidc-auth-${ENVIRONMENT}"
EMAIL="admin@example.com"
FIRST_NAME="Admin"
LAST_NAME="User"

echo "🔧 Creating admin user in DynamoDB table: $TABLE_NAME"
echo "   Email: $EMAIL"
echo "   Region: $AWS_REGION"

# Check if user already exists
echo "📋 Checking if user already exists..."
EXISTING=$(aws dynamodb query \
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
HASHED_PASSWORD=$(node -e "
const bcrypt = require('bcryptjs');
const password = process.env.PASSWORD;
const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync(password, salt);
console.log(hash);
" 2>/dev/null || echo "")

if [ -z "$HASHED_PASSWORD" ]; then
  echo "❌ Failed to hash password. Ensure bcryptjs is installed."
  echo "   Try: npm install -g bcryptjs"
  exit 1
fi

# Generate UUID
USER_ID=$(node -e "console.log(require('crypto').randomUUID())")

echo "📝 Creating user with ID: $USER_ID"

# Create user in DynamoDB
aws dynamodb put-item \
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
echo "  Password: (the one you provided via PASSWORD env var)"
echo ""
echo "Next step: Login to the application and change the password"
