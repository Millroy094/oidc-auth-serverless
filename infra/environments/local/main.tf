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

  # Local state for development
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
      ManagedBy   = "Terraform"
    }
  }
}

# SSM Parameter Store (JWT secrets, encryption keys, cookie secrets, etc.)
module "ssm" {
  source = "../../modules/ssm"

  environment = "local"
  path_prefix = "/${var.project_name}/local/"
}

# DynamoDB tables
module "dynamodb" {
  source = "../../modules/dynamodb"

  environment = "local"
}

# SNS topic for notifications
module "sns" {
  source = "../../modules/sns"

  topic_name  = "${var.project_name}-notifications-local"
  environment = "local"
}

# Lambda function for OIDC backend
module "lambda" {
  source = "../../modules/lambda"

  function_name = "${var.project_name}-backend-local"
  environment   = "local"
  runtime       = "nodejs22.x"
  timeout       = 30
  memory_size   = 512

  dynamodb_table_arns  = module.dynamodb.table_arns
  sns_topic_arn        = module.sns.topic_arn
  ssm_parameter_prefix = module.ssm.path_prefix

  environment_variables = {
    NODE_ENV               = "production"
    DEPLOYMENT_ENVIRONMENT = "local"
    AWS_ENDPOINT_URL       = var.lambda_aws_endpoint
    SSM_PARAMETER_PREFIX   = module.ssm.path_prefix
    AWS_REGION             = var.aws_region
    AWS_ACCESS_KEY_ID      = "test"
    AWS_SECRET_ACCESS_KEY  = "test"
    CORS_ORIGINS           = join(",", var.cors_origins)
    FRONTEND_URL           = var.frontend_url
  }
}

# API Gateway for Lambda
module "api_gateway" {
  source = "../../modules/api_gateway"

  api_name    = "${var.project_name}-api-local"
  environment = "local"
  stage_name  = "local"

  lambda_function_name       = module.lambda.function_name
  lambda_function_invoke_arn = module.lambda.function_invoke_arn

  cors_origins = var.cors_origins
}

# Outputs
output "api_gateway_url" {
  value       = module.api_gateway.invoke_url
  description = "API Gateway endpoint (backend only). Cosmetic AWS-style URL; not directly reachable against Ministack (see api_gateway_invoke_host)."
}

# Ministack routes API Gateway requests by Host header rather than by real
# DNS, so the invoke_url above can't be curled/proxied directly against it.
# This is the Host header + stage that must be used when calling
# http://localhost:4566 to reach this API through Ministack locally.
output "api_gateway_invoke_host" {
  value       = "${module.api_gateway.api_id}.execute-api.${replace(var.aws_endpoint, "http://", "")}"
  description = "Host header value for invoking the API Gateway through Ministack locally"
}

output "api_gateway_stage" {
  value       = "local"
  description = "API Gateway stage name"
}

output "aws_endpoint" {
  value       = var.aws_endpoint
  description = "Ministack endpoint reachable from the host machine"
}

output "lambda_function_name" {
  value       = module.lambda.function_name
  description = "Lambda function name"
}

output "dynamodb_table_names" {
  value = {
    user       = module.dynamodb.user_table_name
    client     = module.dynamodb.client_table_name
    oidc_store = module.dynamodb.oidc_store_table_name
    otp        = module.dynamodb.otp_table_name
    challenge  = module.dynamodb.challenge_table_name
  }
  description = "DynamoDB table names"
}
