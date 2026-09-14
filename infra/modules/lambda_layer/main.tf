data "archive_file" "lambda_layer" {
  type        = "zip"
  source_dir  = "${path.module}/layer"
  output_path = "${path.module}/layer.zip"
}

resource "aws_lambda_layer_version" "dependencies" {
  filename            = data.archive_file.lambda_layer.output_path
  layer_name          = var.layer_name
  compatible_runtimes = ["nodejs20.x"]
  source_code_hash    = data.archive_file.lambda_layer.output_base64sha256

  depends_on = [data.archive_file.lambda_layer]
}

output "layer_arn" {
  value       = aws_lambda_layer_version.dependencies.arn
  description = "Lambda layer ARN"
}
