# DynamoDB tables matching the backend's dynamoose models exactly.
# Table names must remain literal ("User", "Client", "OIDCStore", "OTP",
# "Challenge") since the backend does not configure a table name prefix/suffix.
# All tables use on-demand (PAY_PER_REQUEST) billing.

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

resource "aws_dynamodb_table" "oidc_store" {
  name         = "OIDCStore"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
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

  ttl {
    attribute_name = "expiresAt"
    enabled        = true
  }

  tags = {
    Environment = var.environment
  }
}

output "user_table_name" {
  value = aws_dynamodb_table.user.name
}

output "client_table_name" {
  value = aws_dynamodb_table.client.name
}

output "oidc_store_table_name" {
  value = aws_dynamodb_table.oidc_store.name
}

output "otp_table_name" {
  value = aws_dynamodb_table.otp.name
}

output "challenge_table_name" {
  value = aws_dynamodb_table.challenge.name
}

output "table_arns" {
  description = "ARNs for all tables (used for Lambda IAM policy)"
  value = [
    aws_dynamodb_table.user.arn,
    aws_dynamodb_table.client.arn,
    aws_dynamodb_table.oidc_store.arn,
    aws_dynamodb_table.otp.arn,
    aws_dynamodb_table.challenge.arn,
  ]
}
