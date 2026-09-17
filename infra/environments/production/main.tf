module "ssm" {
  source = "../../modules/ssm"

  environment        = "production"
  path_prefix        = "/${var.project_name}/production/"
  email_from_address = var.email_from_address
}

module "dynamodb" {
  source = "../../modules/dynamodb"

  environment = "production"
}

module "sns" {
  source = "../../modules/sns"

  topic_name  = "${var.project_name}-notifications"
  environment = "production"
}

module "lambda" {
  source = "../../modules/lambda"

  function_name = "${var.project_name}-backend"
  environment   = "production"
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
    DEPLOYMENT_ENVIRONMENT = "production"
    SSM_PARAMETER_PREFIX   = module.ssm.path_prefix
    AWS_REGION             = var.aws_region
    CORS_ORIGINS           = join(",", var.cors_origins)
    FRONTEND_URL           = var.frontend_url
  }
}

module "api_gateway" {
  source = "../../modules/api_gateway"

  api_name    = "${var.project_name}-api"
  environment = "production"
  stage_name  = "production"

  lambda_function_name       = module.lambda.function_name
  lambda_function_invoke_arn = module.lambda.function_invoke_arn

  cors_origins = var.cors_origins
}

module "website" {
  source = "../../modules/website"

  bucket_name         = var.frontend_bucket_name
  environment         = "production"
  distribution_name   = var.project_name
  api_gateway_domain  = module.api_gateway.api_endpoint
  aliases             = var.domain_aliases
  acm_certificate_arn = var.acm_certificate_arn
}
