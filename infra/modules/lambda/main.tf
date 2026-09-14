resource "aws_iam_role" "lambda_role" {
  name = "${var.function_name}-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

# Basic Lambda execution role
resource "aws_iam_role_policy_attachment" "lambda_basic_execution" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# DynamoDB access
resource "aws_iam_role_policy" "lambda_dynamodb" {
  name = "${var.function_name}-dynamodb-policy"
  role = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Query",
          "dynamodb:Scan"
        ]
        Effect = "Allow"
        Resource = concat(
          var.dynamodb_table_arns,
          [for arn in var.dynamodb_table_arns : "${arn}/index/*"]
        )
      }
    ]
  })
}

# SNS access
resource "aws_iam_role_policy" "lambda_sns" {
  name = "${var.function_name}-sns-policy"
  role = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "sns:Publish"
        ]
        Effect   = "Allow"
        Resource = var.sns_topic_arn
      }
    ]
  })
}

# SES access
resource "aws_iam_role_policy" "lambda_ses" {
  name = "${var.function_name}-ses-policy"
  role = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "ses:SendEmail",
          "ses:SendRawEmail"
        ]
        Effect   = "Allow"
        Resource = "*"
      }
    ]
  })
}

# SSM Parameter Store access (secrets: JWT, encryption keys, cookie secrets, etc.)
resource "aws_iam_role_policy" "lambda_ssm" {
  name = "${var.function_name}-ssm-policy"
  role = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "ssm:GetParameter",
          "ssm:GetParameters",
          "ssm:GetParametersByPath"
        ]
        Effect   = "Allow"
        Resource = "arn:aws:ssm:*:*:parameter${var.ssm_parameter_prefix}*"
      }
    ]
  })
}

# Placeholder deployment package so `terraform apply` can create the Lambda
# function before real code exists. The real bundle is deployed afterwards
# via `aws lambda update-function-code` (see scripts/watch-backend.sh), so
# changes to this placeholder are intentionally ignored post-creation.
data "archive_file" "placeholder" {
  type        = "zip"
  output_path = "${path.module}/lambda_placeholder.zip"

  source {
    content  = "exports.handler = async () => ({ statusCode: 200, body: 'placeholder' });"
    filename = "handler.js"
  }
}

# Lambda function
resource "aws_lambda_function" "backend" {
  filename         = data.archive_file.placeholder.output_path
  source_code_hash = data.archive_file.placeholder.output_base64sha256
  function_name    = var.function_name
  role             = aws_iam_role.lambda_role.arn
  handler          = "handler.handler"
  runtime          = var.runtime
  timeout          = var.timeout
  memory_size      = var.memory_size

  environment {
    variables = var.environment_variables
  }

  depends_on = [
    aws_iam_role_policy_attachment.lambda_basic_execution,
    aws_iam_role_policy.lambda_dynamodb,
    aws_iam_role_policy.lambda_sns,
    aws_iam_role_policy.lambda_ses,
    aws_iam_role_policy.lambda_ssm,
    data.archive_file.placeholder
  ]

  lifecycle {
    ignore_changes = [filename, source_code_hash]
  }
}

output "function_name" {
  value = aws_lambda_function.backend.function_name
}

output "function_arn" {
  value = aws_lambda_function.backend.arn
}

output "function_invoke_arn" {
  value = aws_lambda_function.backend.invoke_arn
}
