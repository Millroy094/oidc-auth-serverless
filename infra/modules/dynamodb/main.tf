resource "aws_dynamodb_table" "main" {
  name             = var.table_name
  billing_mode     = var.billing_mode
  hash_key         = "pk"
  range_key        = "sk"
  stream_specification {
    stream_view_type = "NEW_AND_OLD_IMAGES"
  }

  attribute {
    name = "pk"
    type = "S"
  }

  attribute {
    name = "sk"
    type = "S"
  }

  attribute {
    name = "gsi1pk"
    type = "S"
  }

  attribute {
    name = "gsi1sk"
    type = "S"
  }

  global_secondary_index {
    name            = "gsi1"
    hash_key        = "gsi1pk"
    range_key       = "gsi1sk"
    projection_type = "ALL"

    dynamic "provisioned_throughput" {
      for_each = var.billing_mode == "PROVISIONED" ? [1] : []
      content {
        read_capacity_units  = 5
        write_capacity_units = 5
      }
    }
  }

  ttl {
    attribute_name = "ttl"
    enabled        = true
  }

  point_in_time_recovery {
    enabled = true
  }

  tags = {
    Environment = var.environment
  }
}

output "table_name" {
  value       = aws_dynamodb_table.main.name
  description = "DynamoDB table name"
}

output "table_arn" {
  value       = aws_dynamodb_table.main.arn
  description = "DynamoDB table ARN"
}
