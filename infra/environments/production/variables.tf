variable "aws_region" {
  type        = string
  default     = "eu-west-2"
  description = "AWS region"
}

variable "project_name" {
  type        = string
  default     = "oidc-auth"
  description = "Project name"
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

variable "domain_aliases" {
  type        = list(string)
  default     = []
  description = "Custom domain names (CNAMEs) for the CloudFront distribution, e.g. [\"app.example.com\"]. Requires acm_certificate_arn to also be set."
}

variable "acm_certificate_arn" {
  type        = string
  default     = ""
  description = "ACM certificate ARN (must be in us-east-1) covering domain_aliases. Leave empty to use the default CloudFront certificate."
}
