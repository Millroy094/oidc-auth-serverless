variable "environment" {
  type        = string
  description = "Environment name"
}

variable "path_prefix" {
  type        = string
  description = "SSM Parameter Store path prefix (must end with a trailing slash), e.g. /oidc-auth/local/"

  validation {
    condition     = endswith(var.path_prefix, "/")
    error_message = "path_prefix must end with a trailing slash."
  }
}

variable "support_email" {
  type        = string
  default     = "noreply@oidc-auth.local"
  description = "Verified SES sender address used for outbound email"
}
