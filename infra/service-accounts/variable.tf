variable "aws_access_key" {
  type        = string
  description = "The AWS development account access key"
  nullable    = false
}

variable "aws_secret_key" {
  type        = string
  description = "The AWS development account secret key"
  nullable    = false
}

variable "aws_region" {
  type        = string
  description = "The AWS development account region"
  default     = "eu-west-2"
}

variable "cluster_name" {
  type        = string
  description = "Name of the EKS Cluster"
  default     = "oauth-server-cluster"
}

variable "oauth_server_service_account_name" {
  type        = string
  description = "Oauth Server Policy Service Account Name"
  default     = "oauth-server-service-account"
}

variable "cluster_namespace" {
  type        = string
  description = "Cluster namespace"
  default     = "default"
}
