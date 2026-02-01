# Lambda function configurations
locals {
  # Secrets Manager secret names with environment prefix for non-prod environments
  secrets = {
    oauth_client_id = {
      name        = var.environment != "prod" ? "${var.environment}-${var.oauth_client_id_secret_name}" : var.oauth_client_id_secret_name
      description = "OAuth client ID for Actions Dashboard"
    }
    oauth_client_secret = {
      name        = var.environment != "prod" ? "${var.environment}-${var.oauth_client_secret_secret_name}" : var.oauth_client_secret_secret_name
      description = "OAuth client secret for Actions Dashboard"
    }
  }

  # Lambda function runtime settings and environment variables
  lambda_functions = {
    oauth_start = {
      timeout     = 10
      memory_size = 128
      environment = merge({
        ACTIONS_DASHBOARD_OAUTH_CLIENT_ID_SECRET_NAME = aws_secretsmanager_secret.secrets["oauth_client_id"].name,
        ACTIONS_DASHBOARD_OAUTH_REDIRECT_URI          = "${local.base_url}/api/oauth/callback",
        AWS_REGION_NAME                               = var.aws_region,
        ENVIRONMENT                                   = var.environment
      }, {})
    }
    oauth_callback = {
      timeout     = 10
      memory_size = 128
      environment = merge({
        ACTIONS_DASHBOARD_OAUTH_CLIENT_ID_SECRET_NAME     = aws_secretsmanager_secret.secrets["oauth_client_id"].name,
        ACTIONS_DASHBOARD_OAUTH_CLIENT_SECRET_SECRET_NAME = aws_secretsmanager_secret.secrets["oauth_client_secret"].name,
        ACTIONS_DASHBOARD_OAUTH_REDIRECT_URI              = "${local.base_url}/api/oauth/callback",
        AWS_REGION_NAME                                   = var.aws_region,
        ENVIRONMENT                                       = var.environment
      }, {})
    }
  }

  # Extract just the S3 key from the full s3:// URI in the manifest
  manifest = jsondecode(data.aws_s3_object.manifest.body)

  lambda_s3_keys = {
    for name, config in local.manifest.lambdas :
    name => regex("s3://[^/]+/(.+)", config.package)[0]
  }
}

resource "aws_secretsmanager_secret" "secrets" {
  for_each = local.secrets

  name        = each.value.name
  description = each.value.description
}

# Secrets Manager secret values
resource "aws_secretsmanager_secret_version" "secrets" {
  for_each = local.secrets

  secret_id = aws_secretsmanager_secret.secrets[each.key].id
  secret_string = lookup({
    oauth_client_id     = var.oauth_client_id
    oauth_client_secret = var.oauth_client_secret
  }, each.key)
}

# IAM Role for Lambda functions
resource "aws_iam_role" "lambda_execution" {
  name = "${local.resource_prefix}-lambda-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

# Attach basic Lambda execution policy
resource "aws_iam_role_policy_attachment" "lambda_basic" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
  role       = aws_iam_role.lambda_execution.name
}

# IAM Policy for Secrets Manager access
data "aws_caller_identity" "current" {}

resource "aws_iam_role_policy" "lambda_secrets_access" {
  name = "${local.resource_prefix}-lambda-secrets-access"
  role = aws_iam_role.lambda_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret"
        ]
        Effect   = "Allow"
        Resource = [for secret in aws_secretsmanager_secret.secrets : secret.arn]
      }
    ]
  })
}

resource "aws_cloudwatch_log_group" "lambda" {
  for_each = local.lambda_functions

  name              = "/aws/lambda/${local.resource_prefix}-${replace(each.key, "_", "-")}"
  retention_in_days = 7

  lifecycle {
    prevent_destroy = false
  }
}

data "aws_s3_bucket" "lambda_artifacts" {
  bucket = var.lambda_artifacts_bucket
}

data "aws_s3_object" "manifest" {
  bucket = data.aws_s3_bucket.lambda_artifacts.id
  key    = var.lambda_manifest_key
}

# Lambda Functions
resource "aws_lambda_function" "lambda" {
  for_each = local.lambda_functions

  s3_bucket        = data.aws_s3_bucket.lambda_artifacts.id
  s3_key           = local.lambda_s3_keys[replace(each.key, "_", "-")]
  source_code_hash = local.manifest.commit_sha
  function_name    = "${local.resource_prefix}-${replace(each.key, "_", "-")}"
  role             = aws_iam_role.lambda_execution.arn
  handler          = "index.handler"
  runtime          = "nodejs20.x"
  timeout          = each.value.timeout
  memory_size      = each.value.memory_size

  environment {
    variables = each.value.environment
  }

  depends_on = [
    aws_cloudwatch_log_group.lambda
  ]
}
