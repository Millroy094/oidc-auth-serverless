variable "bucket_name" {
  type        = string
  description = "S3 bucket name for the static frontend"
}

variable "environment" {
  type        = string
  description = "Environment name"
}

variable "enable_versioning" {
  type        = bool
  default     = true
  description = "Enable S3 versioning"
}

variable "enable_encryption" {
  type        = bool
  default     = true
  description = "Enable S3 server-side encryption"
}

variable "distribution_name" {
  type        = string
  description = "CloudFront distribution name"
}

variable "api_gateway_domain" {
  type        = string
  description = "API Gateway domain"
}

variable "api_path_pattern" {
  type        = string
  default     = "/api/*"
  description = "API path pattern for routing"
}

variable "aliases" {
  type        = list(string)
  default     = []
  description = "Custom domain names (CNAMEs) for the distribution, e.g. [\"app.example.com\"]. Requires acm_certificate_arn to also be set."
}

variable "acm_certificate_arn" {
  type        = string
  default     = ""
  description = "ACM certificate ARN (must be in us-east-1) covering aliases. Leave empty to use the default CloudFront certificate."
}
