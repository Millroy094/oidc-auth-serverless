variable "bucket_name" {
  type        = string
  description = "S3 bucket name"
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

variable "oai_id" {
  type        = string
  description = "CloudFront Origin Access Identity ID"
}
