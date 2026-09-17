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

variable "artifact_sha" {
  type        = string
  description = "Identifier (git SHA) for the uploaded Lambda deployment zip; used to build the S3 key lambda/<artifact_sha>/handler.zip. Updated by CI on each deploy."
}

variable "domain_name" {
  type        = string
  description = "Custom domain name for the CloudFront distribution"
}
