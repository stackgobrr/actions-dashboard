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
    app_private_key = {
      name        = var.environment != "prod" ? "${var.environment}-${var.app_private_key_secret_name}" : var.app_private_key_secret_name
      description = "GitHub App private key (PEM) for Actions Dashboard"
    }
    webhook_secret = {
      name        = var.environment != "prod" ? "${var.environment}-${var.webhook_secret_secret_name}" : var.webhook_secret_secret_name
      description = "GitHub webhook HMAC secret for Actions Dashboard"
    }
  }

  # Common environment variables shared across all data-plane Lambdas
  common_env = {
    AURORA_CLUSTER_ARN   = aws_rds_cluster.aurora.arn
    AURORA_SECRET_ARN    = aws_secretsmanager_secret.db_credentials.arn
    AURORA_DATABASE_NAME = local.aurora_database_name
    DYNAMODB_EVENTS_TABLE = aws_dynamodb_table.webhook_events.name
    JWT_SECRET_ARN       = aws_secretsmanager_secret.jwt_secret.arn
    ALLOWED_ORIGIN       = local.base_url
    AWS_REGION_NAME      = var.aws_region
    ENVIRONMENT          = var.environment
  }

  # Lambda function runtime settings and environment variables
  lambda_functions = {
    oauth_start = {
      timeout     = 10
      memory_size = 128
      environment = {
        ACTIONS_DASHBOARD_OAUTH_CLIENT_ID_SECRET_NAME = aws_secretsmanager_secret.secrets["oauth_client_id"].name
        ACTIONS_DASHBOARD_OAUTH_REDIRECT_URI          = "${local.base_url}/api/oauth/callback"
        AWS_REGION_NAME                               = var.aws_region
        ENVIRONMENT                                   = var.environment
      }
    }
    oauth_callback = {
      timeout     = 15
      memory_size = 256
      environment = merge(local.common_env, {
        ACTIONS_DASHBOARD_OAUTH_CLIENT_ID_SECRET_NAME     = aws_secretsmanager_secret.secrets["oauth_client_id"].name
        ACTIONS_DASHBOARD_OAUTH_CLIENT_SECRET_SECRET_NAME = aws_secretsmanager_secret.secrets["oauth_client_secret"].name
        ACTIONS_DASHBOARD_OAUTH_REDIRECT_URI              = "${local.base_url}/api/oauth/callback"
      })
    }
    profile = {
      timeout     = 10
      memory_size = 256
      environment = local.common_env
    }
    groups = {
      timeout     = 10
      memory_size = 256
      environment = local.common_env
    }
    webhook_receiver = {
      timeout     = 10
      memory_size = 256
      environment = merge(local.common_env, {
        GITHUB_WEBHOOK_SECRET_ARN = aws_secretsmanager_secret.secrets["webhook_secret"].arn
      })
    }
    token_proxy = {
      timeout     = 15
      memory_size = 256
      environment = merge(local.common_env, {
        GITHUB_APP_ID             = var.actions_dashboard_app_id
        GITHUB_APP_PRIVATE_KEY_ARN = aws_secretsmanager_secret.secrets["app_private_key"].arn
      })
    }
    event_stream = {
      timeout     = 60
      memory_size = 256
      environment = local.common_env
    }
  }

  # Lambda Function URL configurations
  function_url_configs = {
    oauth_start = {
      invoke_mode = "BUFFERED"
    }
    oauth_callback = {
      invoke_mode = "BUFFERED"
    }
    profile = {
      invoke_mode = "BUFFERED"
    }
    groups = {
      invoke_mode = "BUFFERED"
    }
    webhook_receiver = {
      invoke_mode = "BUFFERED"
    }
    token_proxy = {
      invoke_mode = "BUFFERED"
    }
    event_stream = {
      invoke_mode = "RESPONSE_STREAM"
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
    app_private_key     = var.app_private_key
    webhook_secret      = var.webhook_secret
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

# IAM Policy for Secrets Manager access (all secrets)
data "aws_caller_identity" "current" {}

resource "aws_iam_role_policy" "lambda_secrets_access" {
  name = "${local.resource_prefix}-lambda-secrets-access"
  role = aws_iam_role.lambda_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "SecretsManagerAccess"
        Action = ["secretsmanager:GetSecretValue", "secretsmanager:DescribeSecret"]
        Effect = "Allow"
        Resource = concat(
          [for secret in aws_secretsmanager_secret.secrets : secret.arn],
          [aws_secretsmanager_secret.db_credentials.arn, aws_secretsmanager_secret.jwt_secret.arn]
        )
      }
    ]
  })
}

# IAM Policy for RDS Data API access (Aurora Serverless v2)
resource "aws_iam_role_policy" "lambda_rds_data_access" {
  name = "${local.resource_prefix}-lambda-rds-data-access"
  role = aws_iam_role.lambda_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "RDSDataAPIAccess"
        Action = ["rds-data:ExecuteStatement", "rds-data:BatchExecuteStatement", "rds-data:BeginTransaction", "rds-data:CommitTransaction", "rds-data:RollbackTransaction"]
        Effect = "Allow"
        Resource = [aws_rds_cluster.aurora.arn]
      }
    ]
  })
}

# IAM Policy for DynamoDB access (webhook events table)
resource "aws_iam_role_policy" "lambda_dynamodb_access" {
  name = "${local.resource_prefix}-lambda-dynamodb-access"
  role = aws_iam_role.lambda_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "DynamoDBEventTableAccess"
        Action = [
          "dynamodb:PutItem",
          "dynamodb:GetItem",
          "dynamodb:Query",
          "dynamodb:ConditionCheckItem",
          "dynamodb:DescribeTable",
          "dynamodb:DescribeStream",
          "dynamodb:GetRecords",
          "dynamodb:GetShardIterator",
          "dynamodb:ListStreams"
        ]
        Effect   = "Allow"
        Resource = [
          aws_dynamodb_table.webhook_events.arn,
          "${aws_dynamodb_table.webhook_events.arn}/index/*",
          "${aws_dynamodb_table.webhook_events.arn}/stream/*"
        ]
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

resource "aws_lambda_function_url" "lambda" {
  for_each = local.function_url_configs

  function_name      = aws_lambda_function.lambda[each.key].function_name
  authorization_type = "NONE"

  invoke_mode = each.value.invoke_mode

  # CORS is optional - only add if configured
  dynamic "cors" {
    for_each = lookup(each.value, "cors", null) != null ? [each.value.cors] : []
    content {
      allow_credentials = cors.value.allow_credentials
      allow_origins     = cors.value.allow_origins
      allow_methods     = cors.value.allow_methods
      allow_headers     = cors.value.allow_headers
      expose_headers    = cors.value.expose_headers
      max_age           = cors.value.max_age
    }
  }
}

# Allow Function URL to invoke Lambda functions
resource "aws_lambda_permission" "function_url" {
  for_each = local.function_url_configs

  statement_id           = "AllowExecutionFromFunctionURL"
  action                 = "lambda:InvokeFunctionUrl"
  function_name          = aws_lambda_function.lambda[each.key].function_name
  principal              = "*"
  function_url_auth_type = "NONE"
}
