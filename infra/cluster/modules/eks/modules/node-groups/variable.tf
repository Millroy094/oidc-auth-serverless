variable "eks_cluster_name" {
  type        = string
  description = "Name of the EKS Cluster"
}

variable "private_subnet_ids" {
  type        = list(string)
  description = "List of private subnet IDs."
}
