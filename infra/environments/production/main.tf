module "ssm" {
  source = "../../modules/ssm"

  environment   = "production"
  path_prefix   = "/${var.resource_prefix}/production/"
  support_email = var.support_email
}

module "dynamodb" {
  source = "../../modules/dynamodb"

  environment = "production"
}

module "sns" {
  source = "../../modules/sns"

  topic_name  = "${var.resource_prefix}-notifications"
  environment = "production"
}

module "lambda" {
  source = "../../modules/lambda"

  function_name = "${var.resource_prefix}-backend"
  environment   = "production"
  runtime       = "nodejs22.x"
  timeout       = 30
  memory_size   = 512

  artifacts_bucket_name = "oidc-auth-artifacts"
  artifact_sha          = var.artifact_sha

  dynamodb_table_arns  = module.dynamodb.table_arns
  sns_topic_arn        = module.sns.topic_arn
  ssm_parameter_prefix = module.ssm.path_prefix

  environment_variables = {
    NODE_ENV               = "production"
    DEPLOYMENT_ENVIRONMENT = "production"
    SSM_PARAMETER_PREFIX   = module.ssm.path_prefix
    AWS_REGION             = var.aws_region
  }
}

module "api_gateway" {
  source = "../../modules/api_gateway"

  api_name    = "${var.resource_prefix}-api"
  environment = "production"
  stage_name  = "production"

  lambda_function_name       = module.lambda.function_name
  lambda_function_invoke_arn = module.lambda.function_invoke_arn
}

module "website" {
  source = "../../modules/website"

  bucket_name         = "oidc-auth-website"
  environment         = "production"
  distribution_name   = var.resource_prefix
  api_gateway_domain  = module.api_gateway.api_endpoint
  aliases             = [var.domain_name]
  acm_certificate_arn = aws_acm_certificate_validation.website.certificate_arn
}
