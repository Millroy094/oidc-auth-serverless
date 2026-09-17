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

resource "aws_ssm_parameter" "params" {
  for_each = local.parameters

  name  = "${var.path_prefix}${each.key}"
  type  = each.value.secure ? "SecureString" : "String"
  value = each.value.value
}
