output "api_gateway_url" {
  value       = module.api_gateway.invoke_url
  description = "API Gateway endpoint (backend only). Cosmetic AWS-style URL; not directly reachable against Ministack (see api_gateway_invoke_host)."
}

# Ministack routes API Gateway requests by Host header rather than by real
# DNS, so the invoke_url above can't be curled/proxied directly against it.
# This is the Host header + stage that must be used when calling
# http://localhost:4566 to reach this API through Ministack locally.
output "api_gateway_invoke_host" {
  value       = "${module.api_gateway.api_id}.execute-api.${replace(var.aws_endpoint, "http://", "")}"
  description = "Host header value for invoking the API Gateway through Ministack locally"
}

output "api_gateway_stage" {
  value       = "local"
  description = "API Gateway stage name"
}

output "aws_endpoint" {
  value       = var.aws_endpoint
  description = "Ministack endpoint reachable from the host machine"
}

output "lambda_function_name" {
  value       = module.lambda.function_name
  description = "Lambda function name"
}

output "dynamodb_table_names" {
  value = {
    user       = module.dynamodb.user_table_name
    client     = module.dynamodb.client_table_name
    oidc_store = module.dynamodb.oidc_store_table_name
    otp        = module.dynamodb.otp_table_name
    challenge  = module.dynamodb.challenge_table_name
  }
  description = "DynamoDB table names"
}
