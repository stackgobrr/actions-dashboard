# Aurora Serverless v2 (PostgreSQL) — user profiles, groups, shared configs
# Lambdas connect via RDS Data API (HTTP) — no VPC attachment needed for Lambdas.

# ── Secrets ──────────────────────────────────────────────────────────────────

resource "aws_secretsmanager_secret" "db_credentials" {
  name        = "${local.resource_prefix}/db-credentials"
  description = "Aurora credentials for Actions Dashboard"
}

resource "aws_secretsmanager_secret_version" "db_credentials" {
  secret_id = aws_secretsmanager_secret.db_credentials.id
  secret_string = jsonencode({
    username = "actions_dashboard"
    password = var.db_password
    engine   = "postgres"
    host     = aws_rds_cluster.aurora.endpoint
    port     = 5432
    dbname   = local.aurora_database_name
  })
}

resource "aws_secretsmanager_secret" "jwt_secret" {
  name        = "${local.resource_prefix}/jwt-secret"
  description = "JWT signing secret for session cookies"
}

resource "aws_secretsmanager_secret_version" "jwt_secret" {
  secret_id     = aws_secretsmanager_secret.jwt_secret.id
  secret_string = var.jwt_secret
}

# ── Aurora cluster ────────────────────────────────────────────────────────────

resource "aws_rds_cluster" "aurora" {
  cluster_identifier      = "${local.resource_prefix}-aurora"
  engine                  = "aurora-postgresql"
  engine_mode             = "provisioned"
  engine_version          = "16.6"
  database_name           = local.aurora_database_name
  master_username         = "actions_dashboard"
  master_password         = var.db_password
  db_subnet_group_name    = aws_db_subnet_group.aurora.name
  vpc_security_group_ids  = [aws_security_group.aurora.id]

  # Enable RDS Data API so Lambdas can query without VPC attachment
  enable_http_endpoint = true

  serverlessv2_scaling_configuration {
    min_capacity = 0.5
    max_capacity = 4
  }

  skip_final_snapshot = var.environment != "prod"
  deletion_protection = var.environment == "prod"

  tags = {
    Name = "${local.resource_prefix}-aurora"
  }
}

resource "aws_rds_cluster_instance" "aurora" {
  cluster_identifier = aws_rds_cluster.aurora.id
  instance_class     = "db.serverless"
  engine             = aws_rds_cluster.aurora.engine
  engine_version     = aws_rds_cluster.aurora.engine_version

  db_subnet_group_name = aws_db_subnet_group.aurora.name

  tags = {
    Name = "${local.resource_prefix}-aurora-instance"
  }
}
