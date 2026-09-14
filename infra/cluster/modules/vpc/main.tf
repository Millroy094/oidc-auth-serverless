resource "aws_vpc" "oauth_server_vpc" {

  cidr_block           = var.vpc_cidr_block
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name                                            = "OAuth Server VPC"
    "kubernetes.io/cluster/${var.eks_cluster_name}" = "owned"
  }
}

# Create the private subnet
resource "aws_subnet" "oauth_server_private_subnet" {
  count             = length(var.availability_zones)
  vpc_id            = aws_vpc.oauth_server_vpc.id
  cidr_block        = element(var.private_subnet_cidr_blocks, count.index)
  availability_zone = element(var.availability_zones, count.index)

  tags = {
    Name                                            = "OAuth Server Private Subnet"
    "kubernetes.io/cluster/${var.eks_cluster_name}" = "owned"
    "kubernetes.io/role/internal-elb"               = 1
  }
}

# Create the public subnet
resource "aws_subnet" "oauth_server_public_subnet" {
  count             = length(var.availability_zones)
  vpc_id            = aws_vpc.oauth_server_vpc.id
  cidr_block        = element(var.public_subnet_cidr_blocks, count.index)
  availability_zone = element(var.availability_zones, count.index)

  tags = {
    Name                                            = "OAuth Server Private Subnet"
    "kubernetes.io/cluster/${var.eks_cluster_name}" = "owned"
    "kubernetes.io/role/elb"                        = 1
  }

  map_public_ip_on_launch = true
}

resource "aws_internet_gateway" "oauth_server_igw" {
  vpc_id = aws_vpc.oauth_server_vpc.id

  tags = {
    Name = "OAuth Server Internet Gateway"
  }
}

resource "aws_route_table" "oauth_server_public_routing_table" {
  vpc_id = aws_vpc.oauth_server_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.oauth_server_igw.id
  }

  tags = {
    Name = "OAuth Server Public Routing Table"
  }
}

resource "aws_eip" "oauth_server_eip" {
  domain = "vpc"
}

resource "aws_nat_gateway" "oauth_server_nat_gateway" {
  allocation_id = aws_eip.oauth_server_eip.id
  subnet_id     = aws_subnet.oauth_server_public_subnet[0].id

  tags = {
    Name = "NAT Gateway for OAuth Server Kubernetes Cluster"
  }
}

resource "aws_route_table" "oauth_server_private_routing_table" {
  vpc_id = aws_vpc.oauth_server_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_nat_gateway.oauth_server_nat_gateway.id
  }

  tags = {
    Name = "OAuth Server Private Routing Table"
  }
}


resource "aws_route_table_association" "oauth_server_public_subnet_internet_access" {
  count          = length(var.availability_zones)
  subnet_id      = aws_subnet.oauth_server_public_subnet[count.index].id
  route_table_id = aws_route_table.oauth_server_public_routing_table.id
}

resource "aws_route_table_association" "oauth_server_private_subnet_internet_access" {
  count          = length(var.availability_zones)
  subnet_id      = aws_subnet.oauth_server_private_subnet[count.index].id
  route_table_id = aws_route_table.oauth_server_private_routing_table.id
}

resource "aws_route" "oauth_server_route" {
  route_table_id         = aws_vpc.oauth_server_vpc.default_route_table_id
  destination_cidr_block = "0.0.0.0/0"
  nat_gateway_id         = aws_nat_gateway.oauth_server_nat_gateway.id
}
