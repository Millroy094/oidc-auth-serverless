terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Local state for development
  backend "local" {
    path = "/tmp/terraform/oidc-auth-local.tfstate"
  }
}

provider "aws" {
  region = var.aws_region

  endpoints {
    lambda     = var.aws_endpoint
    apigateway = var.aws_endpoint
    dynamodb   = var.aws_endpoint
    sns        = var.aws_endpoint
    cloudwatch = var.aws_endpoint
    logs       = var.aws_endpoint
    iam        = var.aws_endpoint
  }

  skip_credentials_validation = true
  skip_metadata_api_check      = true
  skip_requesting_account_id   = true

  default_tags {
    tags = {
      Environment = "local"
      Project     = "oidc-auth-serverless"
      ManagedBy   = "Terraform"
    }
  }
}

# Lambda function for OIDC backend
module "lambda" {
  source = "../modules/lambda"

  function_name = "${var.project_name}-backend-local"
  environment   = "local"
  runtime       = "nodejs24.x"
  timeout       = 30
  memory_size   = 512

  dynamodb_table_name = module.dynamodb.table_name
  sns_topic_arn       = module.sns.topic_arn

  environment_variables = {
    ENVIRONMENT         = "local"
    DYNAMODB_TABLE_NAME = module.dynamodb.table_name
    SNS_TOPIC_ARN       = module.sns.topic_arn
  }

  layers = [
    module.lambda_layer.layer_arn
  ]
}

# API Gateway for Lambda
module "api_gateway" {
  source = "../modules/api_gateway"

  api_name    = "${var.project_name}-api-local"
  environment = "local"
  stage_name  = "local"

  lambda_function_name       = module.lambda.function_name
  lambda_function_invoke_arn = module.lambda.function_invoke_arn

  cors_origins = var.cors_origins
}

# DynamoDB table
module "dynamodb" {
  source = "../modules/dynamodb"

  table_name   = "${var.project_name}-local"
  environment  = "local"
  billing_mode = "PAY_PER_REQUEST"
}

# SNS topic for notifications
module "sns" {
  source = "../modules/sns"

  topic_name  = "${var.project_name}-notifications-local"
  environment = "local"
}

# Lambda layers for dependencies
module "lambda_layer" {
  source = "../modules/lambda_layer"

  layer_name  = "${var.project_name}-dependencies-local"
  environment = "local"
}

# Outputs
output "api_gateway_url" {
  value       = module.api_gateway.invoke_url
  description = "API Gateway endpoint (backend only)"
}

output "lambda_function_name" {
  value       = module.lambda.function_name
  description = "Lambda function name"
}

output "dynamodb_table_name" {
  value       = module.dynamodb.table_name
  description = "DynamoDB table name"
}

output "instructions" {
  value = <<-EOT
    Local Development Setup Complete!

    Backend (Lambda + API Gateway):
      - API URL: ${module.api_gateway.invoke_url}
      - Health check: ${module.api_gateway.invoke_url}/api/health-check

    Frontend (Run separately):
      1. cd packages/frontend
      2. npm install
      3. npm run dev
      4. Open http://localhost:5173

    Database:
      - DynamoDB table: ${module.dynamodb.table_name}
      - Endpoint: http://localhost:5000
  EOT
  description = "Quick start instructions"
}

