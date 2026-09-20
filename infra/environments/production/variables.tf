variable "aws_region" {
  type        = string
  default     = "eu-west-2"
  description = "AWS region"
}

variable "project_name" {
  type        = string
  default     = "oidc-auth-serverless"
  description = "Project name, used for tagging (spaces allowed)"
}

variable "environment" {
  description = "Deployment environment, used for resource tagging"
  type        = string
  default     = "production"
}

variable "managed_by" {
  description = "Tool managing the infrastructure, used for resource tagging"
  type        = string
  default     = "Terraform"
}

variable "resource_prefix" {
  type        = string
  default     = "oidc-auth"
  description = "Prefix used to build AWS resource names (no spaces)"

  validation {
    condition     = can(regex("^[a-z0-9-]+$", var.resource_prefix))
    error_message = "resource_prefix must contain only lowercase letters, numbers, and hyphens (no spaces)."
  }
}

variable "author" {
  type        = string
  default     = "Millroy Fernandes"
  description = "Resource owner, applied as the Author tag"
}

variable "support_email" {
  type        = string
  description = "Verified SES sender address used for outbound email"
}

variable "turnstile_site_key" {
  type        = string
  description = "Cloudflare Turnstile public site key used to render the captcha widget on the register form"
}

variable "turnstile_secret_key" {
  type        = string
  description = "Cloudflare Turnstile secret key used to verify captcha tokens server-side"
  sensitive   = true
}

variable "artifact_sha" {
  type        = string
  description = "SHA-256 content hash of the uploaded Lambda deployment zip; used to build the S3 key lambda/<artifact_sha>/handler.zip. Updated by CI only when the backend build actually changes."
}

variable "domain_name" {
  type        = string
  description = "Custom domain name for the CloudFront distribution"
}
