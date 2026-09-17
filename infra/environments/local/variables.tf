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
  default     = ["http://localhost:5173", "http://localhost:3000"]
  description = "CORS allowed origins for frontend dev server"
}

variable "aws_endpoint" {
  type        = string
  default     = "http://localhost:4566"
  description = "AWS emulation endpoint used by the Terraform AWS provider itself, which runs on the host machine (not inside Docker), so it must use the host-mapped port."
}

variable "lambda_aws_endpoint" {
  type        = string
  default     = "http://ministack:4566"
  description = "AWS emulation endpoint used by the deployed Lambda's AWS_ENDPOINT_URL env var. The Lambda itself runs as a container inside Ministack's Docker network, so it must reach other emulated services via the \"ministack\" service hostname rather than localhost."
}

variable "frontend_url" {
  type        = string
  default     = "http://localhost:5173"
  description = "Frontend origin, used to build absolute OIDC interaction redirect URLs since the frontend (Vite dev server) and backend (API Gateway) run on different origins locally"
}

variable "artifacts_bucket_name" {
  type        = string
  description = "S3 bucket holding the Lambda deployment package, created and populated by scripts/build-artifacts.sh before Terraform runs"
}

variable "artifact_sha" {
  type        = string
  default     = "local"
  description = "Identifier for the uploaded Lambda deployment zip; used to build the S3 key lambda/<artifact_sha>/handler.zip"
}
