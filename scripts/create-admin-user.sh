#!/bin/bash

# Exit on any error except the conditional check
set -e

# Check if PASSWORD environment variable is set
if [ -z "$PASSWORD" ]; then
  echo "PASSWORD environment variable is not set. Exiting."
  exit 1
fi

# Check if AWS credentials are set
if [ -z "$AWS_ACCESS_KEY_ID" ] || [ -z "$AWS_SECRET_ACCESS_KEY" ] || [ -z "$AWS_REGION" ]; then
  echo "AWS credentials or region are not set. Exiting."
  exit 1
fi

# Function to set up Node.js and install bcrypt
setup_node() {
  # Install Node Version Manager (nvm) if not already installed
  if [ ! -d "$HOME/.nvm" ]; then
    echo "Installing nvm..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
  fi

  # Load nvm and install the desired Node.js version
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm

  # Install Node.js if it's not already installed
  nvm install 22.11.0
  nvm use 22.11.0

  # Install bcrypt
  npm install bcrypt
}

# Set up Node.js and install bcrypt
setup_node

# Function to hash the password using Node.js and bcrypt
hash_password() {
  node -e "
    const bcrypt = require('bcrypt');
    const password = process.env.PASSWORD;
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) throw err;
      console.log(hash);
    });
  "
}

# Get the hashed password
hashed_password=$(hash_password)

# Step 1: Check if the email already exists using the email-index
existing_item=$(aws dynamodb query \
  --table-name User \
  --index-name email-index \
  --key-condition-expression "email = :email_val" \
  --expression-attribute-values '{":email_val": {"S": "admin@admin.com"}}' \
  --output json)

# Step 2: Insert if email does not already exist
if [ -z "$(echo $existing_item | jq -r '.Items[]?')" ]; then
  echo "No existing user found with email admin@admin.com. Creating user..."
  if ! put_result=$(aws dynamodb put-item \
      --table-name User \
      --item "{
        \"userId\": {\"S\": \"$(uuidgen)\"},
        \"email\": {\"S\": \"admin@admin.com\"},
        \"emailVerified\": {\"BOOL\": true},
        \"firstName\": {\"S\": \"Admin\"},
        \"lastName\": {\"S\": \"Admin\"},
        \"mobile\": {\"S\": \"\"},
        \"password\": {\"S\": \"$hashed_password\"},
        \"roles\": {\"L\": [{\"S\": \"admin\"}]},
        \"lastLoggedIn\": {\"N\": \"0\"},
        \"failedLogins\": {\"N\": \"0\"},
        \"suspended\": {\"BOOL\": false},
        \"mfa\": {
          \"M\": {
            \"preference\": {\"S\": \"\"},
            \"recoveryCodes\": {\"L\": []},
            \"app\": {
              \"M\": {
                \"secret\": {\"S\": \"\"},
                \"subscriber\": {\"S\": \"\"},
                \"verified\": {\"BOOL\": false}
              }
            },
            \"sms\": {
              \"M\": {
                \"subscriber\": {\"S\": \"\"},
                \"verified\": {\"BOOL\": false}
              }
            },
            \"email\": {
              \"M\": {
                \"subscriber\": {\"S\": \"\"},
                \"verified\": {\"BOOL\": false}
              }
            },
            \"passkey\": {
              \"M\": {
                \"crendentails\": {\"L\": []},
                \"verified\": {\"BOOL\": false}
              }
            }
          }
        }
      }" 2>&1); then
    echo "An error occurred while trying to insert the user: $put_result"
    exit 1
  fi
  echo "User created successfully."
else
  echo "User with email admin@admin.com already exists, skipping insert."
fi
