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
    "SUPPORT_EMAIL"         = { value = var.support_email, secure = false }
    "JWKS_PRIVATE_KEY"      = { value = tls_private_key.jwks_signing_key.private_key_pem, secure = true }
    "TURNSTILE_SITE_KEY"    = { value = var.turnstile_site_key, secure = false }
    "TURNSTILE_SECRET_KEY"  = { value = var.turnstile_secret_key, secure = true }
  }
}
