terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.9"
    }
    tls = {
      source  = "hashicorp/tls"
      version = "~> 4.0"
    }
  }

  backend "local" {
    path = "/tmp/terraform/oidc-auth-local.tfstate"
  }
}

provider "aws" {
  region = var.aws_region

  endpoints {
    lambda       = var.aws_endpoint
    apigatewayv2 = var.aws_endpoint
    dynamodb     = var.aws_endpoint
    sns          = var.aws_endpoint
    ses          = var.aws_endpoint
    ssm          = var.aws_endpoint
    cloudwatch   = var.aws_endpoint
    logs         = var.aws_endpoint
    iam          = var.aws_endpoint
  }

  skip_credentials_validation = true
  skip_metadata_api_check     = true
  skip_requesting_account_id  = true

  default_tags {
    tags = {
      Environment = "local"
      Project     = var.project_name
      Author      = var.author
      ManagedBy   = "Terraform"
    }
  }
}