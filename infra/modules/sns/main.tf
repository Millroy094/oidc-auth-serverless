resource "aws_sns_topic" "notifications" {
  name = var.topic_name

  tags = {
    Environment = var.environment
  }
}

resource "aws_sns_topic_policy" "lambda_publish" {
  arn = aws_sns_topic.notifications.arn

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
        Action   = "SNS:Publish"
        Resource = aws_sns_topic.notifications.arn
      }
    ]
  })
}
