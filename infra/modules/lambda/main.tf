resource "aws_lambda_function" "backend" {
  s3_bucket     = var.artifacts_bucket_name
  s3_key        = var.artifact_s3_key
  function_name = var.function_name
  role          = aws_iam_role.lambda_role.arn
  handler       = "handler.handler"
  runtime       = var.runtime
  timeout       = var.timeout
  memory_size   = var.memory_size

  environment {
    variables = var.environment_variables
  }

  depends_on = [
    aws_iam_role_policy_attachment.lambda_basic_execution,
    aws_iam_role_policy.lambda_dynamodb,
    aws_iam_role_policy.lambda_sns,
    aws_iam_role_policy.lambda_ses,
    aws_iam_role_policy.lambda_ssm
  ]
}
