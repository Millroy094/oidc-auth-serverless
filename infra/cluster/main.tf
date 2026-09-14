provider "aws" {
  region     = var.aws_region
  access_key = var.aws_access_key
  secret_key = var.aws_secret_key
}

module "vpc" {
  source           = "./modules/vpc"
  eks_cluster_name = "${var.app_name}-cluster"
}

module "eks" {
  source             = "./modules/eks"
  aws_account_id     = var.aws_account_id
  eks_cluster_name   = "${var.app_name}-cluster"
  public_subnet_ids  = module.vpc.public_subnet_ids
  private_subnet_ids = module.vpc.public_subnet_ids
}
