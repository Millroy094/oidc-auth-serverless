variable "function_name" {
  type        = string
  description = "Lambda function name"
}

variable "environment" {
  type        = string
  description = "Environment name"
}

variable "runtime" {
  type        = string
  default     = "nodejs20.x"
  description = "Lambda runtime"
}

variable "timeout" {
  type        = number
  default     = 30
  description = "Lambda timeout in seconds"
}

variable "memory_size" {
  type        = number
  default     = 512
  description = "Lambda memory in MB"
}

variable "dynamodb_table_arns" {
  type        = list(string)
  description = "DynamoDB table ARNs the Lambda needs access to"
}

variable "sns_topic_arn" {
  type        = string
  description = "SNS topic ARN for notifications"
}

variable "ssm_parameter_prefix" {
  type        = string
  description = "SSM Parameter Store path prefix the Lambda can read (e.g. /oidc-auth/local/)"
}

variable "environment_variables" {
  type        = map(string)
  default     = {}
  description = "Environment variables for Lambda"
}

variable "artifacts_bucket_name" {
  type        = string
  description = "S3 bucket (created and populated outside Terraform by scripts/build-artifacts.sh) holding the Lambda deployment package"
}

variable "artifact_sha" {
  type        = string
  description = "SHA-256 content hash (or \"local\") of the uploaded Lambda deployment zip; used to build the S3 key lambda/<artifact_sha>/handler.zip"
}

variable "log_retention_in_days" {
  type        = number
  default     = 30
  description = "CloudWatch log group retention period for the Lambda function's logs"
}
