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
