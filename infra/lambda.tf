# Package Lambda functions
data "archive_file" "webhook_receiver" {
  type        = "zip"
  source_dir  = "${path.module}/lambda/webhook-receiver"
  output_path = "${path.module}/.terraform/lambda-webhook-receiver.zip"
}

data "archive_file" "sse_handler" {
  type        = "zip"
  source_dir  = "${path.module}/lambda/sse-handler"
  output_path = "${path.module}/.terraform/lambda-sse-handler.zip"
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

# CloudWatch Log Groups
resource "aws_cloudwatch_log_group" "webhook_receiver" {
  name              = "/aws/lambda/${var.project_name}-webhook-receiver"
  retention_in_days = 7
}

resource "aws_cloudwatch_log_group" "sse_handler" {
  name              = "/aws/lambda/${var.project_name}-sse-handler"
  retention_in_days = 7
}

# Lambda Function: Webhook Receiver
resource "aws_lambda_function" "webhook_receiver" {
  filename         = data.archive_file.webhook_receiver.output_path
  function_name    = "${var.project_name}-webhook-receiver"
  role             = aws_iam_role.lambda_execution.arn
  handler          = "index.handler"
  source_code_hash = data.archive_file.webhook_receiver.output_base64sha256
  runtime          = "nodejs20.x"
  timeout          = 30
  memory_size      = 256

  environment {
    variables = {
      GITHUB_WEBHOOK_SECRET = var.github_webhook_secret
      NODE_ENV              = var.environment
    }
  }

  depends_on = [
    aws_cloudwatch_log_group.webhook_receiver
  ]
}

# Lambda Function: SSE Handler (with Response Streaming)
resource "aws_lambda_function" "sse_handler" {
  filename         = data.archive_file.sse_handler.output_path
  function_name    = "${var.project_name}-sse-handler"
  role             = aws_iam_role.lambda_execution.arn
  handler          = "index.handler"
  source_code_hash = data.archive_file.sse_handler.output_base64sha256
  runtime          = "nodejs20.x"
  timeout          = 900 # 15 minutes (max for Lambda Function URLs)
  memory_size      = 256

  environment {
    variables = {
      NODE_ENV = var.environment
    }
  }

  depends_on = [
    aws_cloudwatch_log_group.sse_handler
  ]
}

# Lambda Function URL for Webhook Receiver
resource "aws_lambda_function_url" "webhook_receiver" {
  function_name      = aws_lambda_function.webhook_receiver.function_name
  authorization_type = "NONE" # Webhook signature validation happens in code

  cors {
    allow_credentials = false
    allow_origins     = ["*"]
    allow_methods     = ["POST"]
    allow_headers     = ["content-type", "x-github-event", "x-hub-signature-256"]
    max_age           = 86400
  }
}

# Lambda Function URL for SSE Handler (with Response Streaming)
resource "aws_lambda_function_url" "sse_handler" {
  function_name      = aws_lambda_function.sse_handler.function_name
  authorization_type = "NONE"

  invoke_mode = "RESPONSE_STREAM" # Enable response streaming for SSE

  cors {
    allow_credentials = false
    allow_origins     = ["*"] # Update with specific domain in production
    allow_methods     = ["GET"]
    allow_headers     = ["content-type"]
    expose_headers    = ["content-type"]
    max_age           = 86400
  }
}

# Allow Function URL to invoke Lambda functions
resource "aws_lambda_permission" "webhook_receiver_url" {
  statement_id           = "AllowExecutionFromFunctionURL"
  action                 = "lambda:InvokeFunctionUrl"
  function_name          = aws_lambda_function.webhook_receiver.function_name
  principal              = "*"
  function_url_auth_type = "NONE"
}

resource "aws_lambda_permission" "sse_handler_url" {
  statement_id           = "AllowExecutionFromFunctionURL"
  action                 = "lambda:InvokeFunctionUrl"
  function_name          = aws_lambda_function.sse_handler.function_name
  principal              = "*"
  function_url_auth_type = "NONE"
}
