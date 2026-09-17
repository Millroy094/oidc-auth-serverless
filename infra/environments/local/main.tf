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

module "ssm" {
  source = "../../modules/ssm"

  environment = "local"
  path_prefix = "/${var.project_name}/local/"
}

module "dynamodb" {
  source = "../../modules/dynamodb"

  environment = "local"
}

module "sns" {
  source = "../../modules/sns"

  topic_name  = "${var.project_name}-notifications-local"
  environment = "local"
}

module "lambda" {
  source = "../../modules/lambda"

  function_name = "${var.project_name}-backend-local"
  environment   = "local"
  runtime       = "nodejs22.x"
  timeout       = 30
  memory_size   = 512

  artifacts_bucket_name = var.artifacts_bucket_name
  artifact_s3_key       = var.lambda_artifact_key

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

module "api_gateway" {
  source = "../../modules/api_gateway"

  api_name    = "${var.project_name}-api-local"
  environment = "local"
  stage_name  = "local"

  lambda_function_name       = module.lambda.function_name
  lambda_function_invoke_arn = module.lambda.function_invoke_arn

  cors_origins = var.cors_origins
}
