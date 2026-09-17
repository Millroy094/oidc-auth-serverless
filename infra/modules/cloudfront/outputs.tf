output "domain_name" {
  value       = aws_cloudfront_distribution.main.domain_name
  description = "CloudFront distribution domain name"
}

output "distribution_id" {
  value       = aws_cloudfront_distribution.main.id
  description = "CloudFront distribution ID"
}

output "oai_id" {
  value       = aws_cloudfront_origin_access_identity.s3_oai.id
  description = "CloudFront OAI ID"
}
