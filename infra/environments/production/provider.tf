terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }

  cloud {
    organization = "millroyfernandes"
    workspaces {
      name = var.TFC_WORKSPACE_NAME
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Environment = "production"
      Project     = var.project_name
      Author      = var.author
      ManagedBy   = "Terraform"
    }
  }
}