variable "table_name" {
  type        = string
  description = "DynamoDB table name"
}

variable "environment" {
  type        = string
  description = "Environment name"
}

variable "billing_mode" {
  type        = string
  default     = "PAY_PER_REQUEST"
  description = "DynamoDB billing mode"
}
