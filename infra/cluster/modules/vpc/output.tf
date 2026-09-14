output "vpc_id" {
  value = aws_vpc.oauth_server_vpc.id
}

output "public_subnet_ids" {
  value = aws_subnet.oauth_server_public_subnet[*].id
}

output "private_subnet_ids" {
  value = aws_subnet.oauth_server_private_subnet[*].id
}
