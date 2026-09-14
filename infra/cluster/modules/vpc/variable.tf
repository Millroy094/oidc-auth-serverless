variable "eks_cluster_name" {
  type        = string
  description = "Name of the EKS Cluster"
}
variable "vpc_cidr_block" {
  type        = string
  default     = "10.0.0.0/16"
  description = "CIDR block range for vpc"
}

variable "private_subnet_cidr_blocks" {
  type        = list(string)
  default     = ["10.0.0.0/24", "10.0.1.0/24"]
  description = "CIDR block range for the private subnet"
}

variable "public_subnet_cidr_blocks" {
  type        = list(string)
  default     = ["10.0.2.0/24", "10.0.3.0/24"]
  description = "CIDR block range for the public subnet"
}
variable "availability_zones" {
  type        = list(string)
  description = "The AWS availability zones for regions"
  default     = ["eu-west-2a", "eu-west-2b"]
}
