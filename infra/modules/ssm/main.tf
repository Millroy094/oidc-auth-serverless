# Generates local secrets and stores them in SSM Parameter Store so the
# Lambda fetches them at cold start instead of embedding them as plain
# Lambda environment variables.

resource "random_password" "access_jwt_secret" {
  length  = 64
  special = false
}

resource "random_password" "refresh_jwt_secret" {
  length  = 64
  special = false
}

resource "random_password" "encryption_secret_key" {
  length  = 32
  special = false
}

resource "random_password" "encryption_secret_iv" {
  length  = 16
  special = false
}

resource "random_password" "cookie_secret" {
  length  = 32
  special = false
}

locals {
  parameters = {
    "ACCESS_JWT_SECRET"     = { value = random_password.access_jwt_secret.result, secure = true }
    "ACCESS_JWT_EXPIRY"     = { value = "2h", secure = false }
    "REFRESH_JWT_SECRET"    = { value = random_password.refresh_jwt_secret.result, secure = true }
    "REFRESH_JWT_EXPIRY"    = { value = "1d", secure = false }
    "ISSUER_NAME"           = { value = "oidc-auth-${var.environment}", secure = false }
    "ENCRYPTION_SECRET_KEY" = { value = random_password.encryption_secret_key.result, secure = true }
    "ENCRYPTION_SECRET_IV"  = { value = random_password.encryption_secret_iv.result, secure = true }
    "ENCRYPTION_METHOD"     = { value = "aes-256-cbc", secure = false }
    "COOKIE_SECRETS"        = { value = random_password.cookie_secret.result, secure = true }
    "EMAIL_FROM_ADDRESS"    = { value = "noreply@oidc-auth.local", secure = false }
  }
}

resource "aws_ssm_parameter" "params" {
  for_each = local.parameters

  name  = "${var.path_prefix}${each.key}"
  type  = each.value.secure ? "SecureString" : "String"
  value = each.value.value

  tags = {
    Environment = var.environment
  }
}

output "path_prefix" {
  value       = var.path_prefix
  description = "SSM Parameter Store path prefix used by the backend at cold start"
}
