output "user_table_name" {
  value = aws_dynamodb_table.user.name
}

output "client_table_name" {
  value = aws_dynamodb_table.client.name
}

output "oidc_store_table_name" {
  value = aws_dynamodb_table.oidc_store.name
}

output "otp_table_name" {
  value = aws_dynamodb_table.otp.name
}

output "challenge_table_name" {
  value = aws_dynamodb_table.challenge.name
}

output "settings_table_name" {
  value = aws_dynamodb_table.settings.name
}

output "table_arns" {
  description = "ARNs for all tables (used for Lambda IAM policy)"
  value = [
    aws_dynamodb_table.user.arn,
    aws_dynamodb_table.client.arn,
    aws_dynamodb_table.resource.arn,
    aws_dynamodb_table.oidc_store.arn,
    aws_dynamodb_table.otp.arn,
    aws_dynamodb_table.challenge.arn,
    aws_dynamodb_table.settings.arn,
  ]
}
