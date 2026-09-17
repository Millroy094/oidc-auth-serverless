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
  artifact_sha          = var.artifact_sha

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
