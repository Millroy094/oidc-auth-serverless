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

# Generated once and persisted in Terraform state - never regenerated on
# subsequent applies/deploys, so previously issued OIDC tokens keep
# validating against the same signing key.
resource "tls_private_key" "jwks_signing_key" {
  algorithm = "RSA"
  rsa_bits  = 2048
}

resource "aws_ssm_parameter" "params" {
  for_each = local.parameters

  name  = "${var.path_prefix}${each.key}"
  type  = each.value.secure ? "SecureString" : "String"
  value = each.value.value
}
