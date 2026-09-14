variable "api_name" {
  type        = string
  description = "API Gateway name"
}

variable "environment" {
  type        = string
  description = "Environment name"
}

variable "stage_name" {
  type        = string
  description = "API Gateway stage name"
}

variable "lambda_function_name" {
  type        = string
  description = "Lambda function name"
}

variable "lambda_function_invoke_arn" {
  type        = string
  description = "Lambda function invoke ARN"
}

variable "cors_origins" {
  type        = list(string)
  default     = ["*"]
  description = "CORS allowed origins"
}
