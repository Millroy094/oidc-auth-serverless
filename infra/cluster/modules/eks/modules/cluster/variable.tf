variable "aws_account_id" {
  type        = string
  description = "The AWS development account id"
  nullable    = false
}
variable "eks_cluster_name" {
  description = "The name of the EKS cluster"
  type        = string
}

variable "private_subnet_ids" {
  type        = list(string)
  description = "List of private subnet IDs."
}

variable "public_subnet_ids" {
  type        = list(string)
  description = "List of public subnet IDs."
}
