output "bucket_id" {
  value       = aws_s3_bucket.frontend.id
  description = "S3 bucket name"
}

output "bucket_arn" {
  value       = aws_s3_bucket.frontend.arn
  description = "S3 bucket ARN"
}

output "domain_name" {
  value       = aws_cloudfront_distribution.main.domain_name
  description = "CloudFront distribution domain name"
}

output "distribution_id" {
  value       = aws_cloudfront_distribution.main.id
  description = "CloudFront distribution ID"
}
