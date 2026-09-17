locals {
  # Ministack's HTTP API emulation rejects access_log_settings with
  # "Invalid ARN specified" regardless of ARN format, so access logging is
  # only enabled for real AWS environments.
  enable_access_logs = var.environment != "local"
}
