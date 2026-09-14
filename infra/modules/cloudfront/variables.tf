variable "distribution_name" {
  type        = string
  description = "CloudFront distribution name"
}

variable "environment" {
  type        = string
  description = "Environment name"
}

variable "s3_bucket_domain_name" {
  type        = string
  description = "S3 bucket domain name"
}

variable "s3_bucket_id" {
  type        = string
  description = "S3 bucket ID"
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

variable "cors_origins" {
  type        = list(string)
  default     = ["*"]
  description = "CORS allowed origins"
}
