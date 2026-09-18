output "path_prefix" {
  value       = var.path_prefix
  description = "SSM Parameter Store path prefix used by the backend at cold start"
}

output "origin_verify_secret" {
  value       = random_password.origin_verify_secret.result
  description = "Secret CloudFront attaches as a custom header so the backend can reject requests that bypass it"
  sensitive   = true
}
