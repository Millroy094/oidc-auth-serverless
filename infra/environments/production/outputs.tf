output "cloudfront_domain_name" {
  value       = module.website.domain_name
  description = "CloudFront distribution domain (use as frontend_url/cors_origins before a custom domain is linked)"
}

output "acm_certificate_validation_records" {
  value = [
    for dvo in aws_acm_certificate.website.domain_validation_options : {
      name  = dvo.resource_record_name
      type  = dvo.resource_record_type
      value = dvo.resource_record_value
    }
  ]
  description = "DNS validation record(s) to add in IONOS for the var.domain_name ACM certificate"
}

output "custom_domain_cname_target" {
  value       = module.website.domain_name
  description = "Point var.domain_name (CNAME) in IONOS to this CloudFront domain"
}

output "cloudfront_distribution_id" {
  value = module.website.distribution_id
}

output "api_gateway_url" {
  value = module.api_gateway.invoke_url
}

output "lambda_function_name" {
  value = module.lambda.function_name
}

output "frontend_bucket_name" {
  value = module.website.bucket_id
}

output "dynamodb_table_names" {
  value = {
    user       = module.dynamodb.user_table_name
    client     = module.dynamodb.client_table_name
    oidc_store = module.dynamodb.oidc_store_table_name
    otp        = module.dynamodb.otp_table_name
    challenge  = module.dynamodb.challenge_table_name
  }
}
