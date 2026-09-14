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

variable "cors_origins" {
  type        = list(string)
  default     = ["http://localhost:5173", "http://localhost:3000"]
  description = "CORS allowed origins for frontend dev server"
}

variable "aws_endpoint" {
  type        = string
  default     = "http://ministack:4566"
  description = "AWS emulation endpoint (Ministack via Docker network)"
}
