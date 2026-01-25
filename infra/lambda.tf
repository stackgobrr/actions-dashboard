# S3 bucket for Lambda deployment artifacts
resource "aws_s3_bucket" "lambda_artifacts" {
  bucket = "${var.project_name}-lambda-artifacts"
}

resource "aws_s3_bucket_versioning" "lambda_artifacts" {
  bucket = aws_s3_bucket.lambda_artifacts.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "lambda_artifacts" {
  bucket = aws_s3_bucket.lambda_artifacts.id

  rule {
    id     = "delete-old-versions"
    status = "Enabled"

    noncurrent_version_expiration {
      noncurrent_days = 30
    }
  }
}

# Secrets Manager secrets
locals {
  secrets = {
    app_private_key = {
      name        = var.private_key_secret_name
      description = "GitHub App private key for Actions Dashboard"
    }
    webhook_secret = {
      name        = var.webhook_secret_name
      description = "Webhook secret for Actions Dashboard GitHub App"
    }
    oauth_client_id = {
      name        = var.oauth_client_id_secret_name
      description = "OAuth client ID for Actions Dashboard"
    }
    oauth_client_secret = {
      name        = var.oauth_client_secret_secret_name
      description = "OAuth client secret for Actions Dashboard"
    }
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
    app_private_key     = var.app_private_key
    webhook_secret      = var.webhook_secret
    oauth_client_id     = var.oauth_client_id
    oauth_client_secret = var.oauth_client_secret
  }, each.key)
}

# IAM Role for Lambda functions
resource "aws_iam_role" "lambda_execution" {
  name = "${var.project_name}-lambda-execution-role"

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
  name = "${var.project_name}-lambda-secrets-access"
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

# CloudWatch Log Groups
locals {
  lambda_functions = {
    webhook_receiver = {
      timeout     = 30
      memory_size = 256
      environment = {
        ACTIONS_DASHBOARD_APP_ID                       = var.actions_dashboard_app_id
        ACTIONS_DASHBOARD_PRIVATE_KEY_SECRET_NAME      = aws_secretsmanager_secret.secrets["app_private_key"].name
        ACTIONS_DASHBOARD_WEBHOOK_SECRET_NAME          = aws_secretsmanager_secret.secrets["webhook_secret"].name
        AWS_REGION_NAME                                = var.aws_region
        NODE_ENV                                       = var.environment
      }
    }
    sse_handler = {
      timeout     = 900
      memory_size = 256
      environment = {
        NODE_ENV = var.environment
      }
    }
    oauth_start = {
      timeout     = 10
      memory_size = 128
      environment = {
        ACTIONS_DASHBOARD_OAUTH_CLIENT_ID_SECRET_NAME = aws_secretsmanager_secret.secrets["oauth_client_id"].name
        ACTIONS_DASHBOARD_OAUTH_REDIRECT_URI          = "https://${var.domain_name}/api/oauth/callback"
        AWS_REGION_NAME                               = var.aws_region
      }
    }
    oauth_callback = {
      timeout     = 10
      memory_size = 128
      environment = {
        ACTIONS_DASHBOARD_OAUTH_CLIENT_ID_SECRET_NAME  = aws_secretsmanager_secret.secrets["oauth_client_id"].name
        ACTIONS_DASHBOARD_OAUTH_CLIENT_SECRET_SECRET_NAME = aws_secretsmanager_secret.secrets["oauth_client_secret"].name
        AWS_REGION_NAME                                = var.aws_region
        # Redirect URI is self-referencing - no need to set
      }
    }
    github_token = {
      timeout     = 10
      memory_size = 128
      environment = {
        ACTIONS_DASHBOARD_APP_ID                  = var.actions_dashboard_app_id
        ACTIONS_DASHBOARD_PRIVATE_KEY_SECRET_NAME = aws_secretsmanager_secret.secrets["app_private_key"].name
        AWS_REGION_NAME                           = var.aws_region
      }
    }
  }
}

resource "aws_cloudwatch_log_group" "lambda" {
  for_each = local.lambda_functions
  
  name              = "/aws/lambda/${var.project_name}-${replace(each.key, "_", "-")}"
  retention_in_days = 7
}

# Lambda Functions
resource "aws_lambda_function" "lambda" {
  for_each = local.lambda_functions
  
  s3_bucket        = aws_s3_bucket.lambda_artifacts.id
  s3_key           = "${replace(each.key, "_", "-")}.zip"
  function_name    = "${var.project_name}-${replace(each.key, "_", "-")}"
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

# Lambda Function URLs
locals {
  function_url_configs = {
    webhook_receiver = {
      invoke_mode = "BUFFERED"
      cors = {
        allow_credentials = false
        allow_origins     = ["*"]
        allow_methods     = ["POST"]
        allow_headers     = ["content-type", "x-github-event", "x-hub-signature-256"]
        expose_headers    = []
        max_age           = 86400
      }
    }
    sse_handler = {
      invoke_mode = "RESPONSE_STREAM"
      cors = {
        allow_credentials = false
        allow_origins     = ["*"]
        allow_methods     = ["GET"]
        allow_headers     = ["content-type"]
        expose_headers    = ["content-type"]
        max_age           = 86400
      }
    }
    oauth_start = {
      invoke_mode = "BUFFERED"
      cors = {
        allow_credentials = true
        allow_origins     = ["https://${var.domain_name}"]
        allow_methods     = ["GET"]
        allow_headers     = ["content-type"]
        expose_headers    = []
        max_age           = 86400
      }
    }
    oauth_callback = {
      invoke_mode = "BUFFERED"
      cors = {
        allow_credentials = true
        allow_origins     = ["https://${var.domain_name}"]
        allow_methods     = ["GET"]
        allow_headers     = ["content-type"]
        expose_headers    = []
        max_age           = 86400
      }
    }
    github_token = {
      invoke_mode = "BUFFERED"
      cors = {
        allow_credentials = true
        allow_origins     = ["https://${var.domain_name}"]
        allow_methods     = ["POST"]
        allow_headers     = ["content-type"]
        expose_headers    = []
        max_age           = 86400
      }
    }
  }
}

resource "aws_lambda_function_url" "lambda" {
  for_each = local.function_url_configs
  
  function_name      = aws_lambda_function.lambda[each.key].function_name
  authorization_type = "NONE"
  
  invoke_mode = each.value.invoke_mode

  cors {
    allow_credentials = each.value.cors.allow_credentials
    allow_origins     = each.value.cors.allow_origins
    allow_methods     = each.value.cors.allow_methods
    allow_headers     = each.value.cors.allow_headers
    expose_headers    = each.value.cors.expose_headers
    max_age           = each.value.cors.max_age
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
