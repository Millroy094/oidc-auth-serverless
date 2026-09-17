output "invoke_url" {
  value       = aws_apigatewayv2_stage.main.invoke_url
  description = "API Gateway invoke URL"
}

output "api_endpoint" {
  value       = aws_apigatewayv2_api.main.api_endpoint
  description = "API endpoint"
}

output "api_id" {
  value       = aws_apigatewayv2_api.main.id
  description = "API Gateway ID"
}
