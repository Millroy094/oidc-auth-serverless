resource "aws_cloudwatch_log_group" "lambda_logs" {
  name              = "/aws/lambda/${var.function_name}"
  retention_in_days = var.log_retention_in_days
}

resource "aws_lambda_function" "backend" {
  s3_bucket     = var.artifacts_bucket_name
  s3_key        = "lambda/${var.artifact_sha}/handler.zip"
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
    aws_iam_role_policy.lambda_ssm,
    aws_cloudwatch_log_group.lambda_logs
  ]
}
