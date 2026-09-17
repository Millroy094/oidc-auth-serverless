output "topic_arn" {
  value       = aws_sns_topic.notifications.arn
  description = "SNS topic ARN"
}

output "topic_name" {
  value       = aws_sns_topic.notifications.name
  description = "SNS topic name"
}
