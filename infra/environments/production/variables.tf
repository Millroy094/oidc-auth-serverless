variable "aws_region" {
  type        = string
  default     = "us-east-1"
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

variable "cors_origins" {
  type        = list(string)
  description = "CORS allowed origins for the frontend (e.g. the CloudFront domain, or the custom domain once linked)"
}

variable "frontend_url" {
  type        = string
  description = "Frontend origin used to build absolute OIDC interaction redirect URLs (e.g. the CloudFront domain, or the custom domain once linked)"
}

variable "email_from_address" {
  type        = string
  description = "Verified SES sender address used for outbound email"
}

variable "artifacts_bucket_name" {
  type        = string
  description = "Pre-existing S3 bucket (created outside Terraform) holding the Lambda deployment package"
}

variable "lambda_artifact_key" {
  type        = string
  description = "S3 key of the Lambda deployment zip within the artifacts bucket"
}

variable "frontend_bucket_name" {
  type        = string
  description = "S3 bucket name for the CloudFront-fronted static frontend (must be globally unique)"
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
