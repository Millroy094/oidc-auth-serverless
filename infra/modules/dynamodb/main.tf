resource "aws_dynamodb_table" "user" {
  name         = "User"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "userId"

  attribute {
    name = "userId"
    type = "S"
  }

  attribute {
    name = "email"
    type = "S"
  }

  global_secondary_index {
    name            = "email-index"
    hash_key        = "email"
    projection_type = "ALL"
  }

  tags = {
    Environment = var.environment
  }
}

resource "aws_dynamodb_table" "client" {
  name         = "Client"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }

  tags = {
    Environment = var.environment
  }
}

resource "aws_dynamodb_table" "resource" {
  name         = "Resource"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }

  tags = {
    Environment = var.environment
  }
}

resource "aws_dynamodb_table" "oidc_store" {
  name         = "OIDCStore"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "uid"
    type = "S"
  }

  attribute {
    name = "grantId"
    type = "S"
  }

  attribute {
    name = "userCode"
    type = "S"
  }

  attribute {
    name = "accountId"
    type = "S"
  }

  attribute {
    name = "sessionUid"
    type = "S"
  }

  global_secondary_index {
    name            = "uid-index"
    hash_key        = "uid"
    projection_type = "ALL"
  }

  global_secondary_index {
    name            = "grantId-index"
    hash_key        = "grantId"
    projection_type = "ALL"
  }

  global_secondary_index {
    name            = "userCode-index"
    hash_key        = "userCode"
    projection_type = "ALL"
  }

  global_secondary_index {
    name            = "accountId-index"
    hash_key        = "accountId"
    projection_type = "ALL"
  }

  global_secondary_index {
    name            = "sessionUid-index"
    hash_key        = "sessionUid"
    projection_type = "ALL"
  }

  ttl {
    attribute_name = "expiresAt"
    enabled        = true
  }

  tags = {
    Environment = var.environment
  }
}

resource "aws_dynamodb_table" "otp" {
  name         = "OTP"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "userId"
    type = "S"
  }

  global_secondary_index {
    name            = "userId-index"
    hash_key        = "userId"
    projection_type = "ALL"
  }

  ttl {
    attribute_name = "expiresAt"
    enabled        = true
  }

  tags = {
    Environment = var.environment
  }
}

resource "aws_dynamodb_table" "challenge" {
  name         = "Challenge"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "userId"
    type = "S"
  }

  global_secondary_index {
    name            = "userId-index"
    hash_key        = "userId"
    projection_type = "ALL"
  }

  ttl {
    attribute_name = "expiresAt"
    enabled        = true
  }

  tags = {
    Environment = var.environment
  }
}
