# VPC for Aurora Serverless v2
# Lambdas use RDS Data API (HTTP) so they do NOT need to be in the VPC.
# Only Aurora itself lives here for network isolation.

resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name = "${local.resource_prefix}-vpc"
  }
}

# Private subnets across two AZs (required for Aurora subnet group)
resource "aws_subnet" "private" {
  for_each = {
    a = "${var.aws_region}a"
    b = "${var.aws_region}b"
  }

  vpc_id            = aws_vpc.main.id
  cidr_block        = each.key == "a" ? "10.0.1.0/24" : "10.0.2.0/24"
  availability_zone = each.value

  tags = {
    Name = "${local.resource_prefix}-private-${each.key}"
  }
}

# DB subnet group — spans both private subnets
resource "aws_db_subnet_group" "aurora" {
  name       = "${local.resource_prefix}-aurora"
  subnet_ids = [for s in aws_subnet.private : s.id]

  tags = {
    Name = "${local.resource_prefix}-aurora-subnet-group"
  }
}

# Security group for Aurora — allows inbound on 5432 from within VPC only
resource "aws_security_group" "aurora" {
  name        = "${local.resource_prefix}-aurora-sg"
  description = "Allow PostgreSQL access within VPC only"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "PostgreSQL from within VPC"
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = [aws_vpc.main.cidr_block]
  }

  egress {
    description = "All outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${local.resource_prefix}-aurora-sg"
  }
}
