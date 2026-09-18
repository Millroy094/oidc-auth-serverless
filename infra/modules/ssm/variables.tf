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

variable "turnstile_site_key" {
  type        = string
  default     = "1x00000000000000000000AA"
  description = "Cloudflare Turnstile public site key. Defaults to Cloudflare's always-passes test key for local development."
}

variable "turnstile_secret_key" {
  type        = string
  default     = "1x0000000000000000000000000000000AA"
  description = "Cloudflare Turnstile secret key used to verify captcha tokens. Defaults to Cloudflare's always-passes test key for local development."
  sensitive   = true
}
