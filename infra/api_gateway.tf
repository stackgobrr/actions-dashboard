resource "aws_api_gateway_rest_api" "main" {
  name        = "${local.resource_prefix}-api"
  description = "API Gateway for Actions Dashboard OAuth endpoints"

  endpoint_configuration {
    types = ["REGIONAL"]
  }

  tags = {
    Name        = "${local.resource_prefix}-api"
    Environment = var.environment
  }
}

# Resource hierarchy: /api
resource "aws_api_gateway_resource" "api" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_rest_api.main.root_resource_id
  path_part   = "api"
}

# Resource hierarchy: /api/oauth
resource "aws_api_gateway_resource" "oauth" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.api.id
  path_part   = "oauth"
}

# Resource hierarchy: /api/oauth/start
resource "aws_api_gateway_resource" "oauth_start" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.oauth.id
  path_part   = "start"
}

# Resource hierarchy: /api/oauth/callback
resource "aws_api_gateway_resource" "oauth_callback" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.oauth.id
  path_part   = "callback"
}

# OAuth endpoints use GET (not POST) because browser redirects are GET requests.
# These don't "get" a resource in the REST sense - they initiate OAuth flows
# and return 302 redirects.

resource "aws_api_gateway_method" "oauth_start" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.oauth_start.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_method" "oauth_callback" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.oauth_callback.id
  http_method   = "GET"
  authorization = "NONE"
}

# Lambda proxy integration for oauth_start
resource "aws_api_gateway_integration" "oauth_start" {
  rest_api_id             = aws_api_gateway_rest_api.main.id
  resource_id             = aws_api_gateway_resource.oauth_start.id
  http_method             = aws_api_gateway_method.oauth_start.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.lambda["oauth_start"].invoke_arn
}

# Lambda proxy integration for oauth_callback
resource "aws_api_gateway_integration" "oauth_callback" {
  rest_api_id             = aws_api_gateway_rest_api.main.id
  resource_id             = aws_api_gateway_resource.oauth_callback.id
  http_method             = aws_api_gateway_method.oauth_callback.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.lambda["oauth_callback"].invoke_arn
}

# Lambda permission for API Gateway to invoke oauth_start
resource "aws_lambda_permission" "api_gateway_oauth_start" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.lambda["oauth_start"].function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

# Lambda permission for API Gateway to invoke oauth_callback
resource "aws_lambda_permission" "api_gateway_oauth_callback" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.lambda["oauth_callback"].function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

# API Gateway deployment
resource "aws_api_gateway_deployment" "main" {
  rest_api_id = aws_api_gateway_rest_api.main.id

  triggers = {
    redeployment = sha1(jsonencode([
      aws_api_gateway_resource.api.id,
      aws_api_gateway_resource.oauth.id,
      aws_api_gateway_resource.oauth_start.id,
      aws_api_gateway_resource.oauth_callback.id,
      aws_api_gateway_method.oauth_start.id,
      aws_api_gateway_method.oauth_callback.id,
      aws_api_gateway_integration.oauth_start.id,
      aws_api_gateway_integration.oauth_callback.id,
    ]))
  }

  lifecycle {
    create_before_destroy = true
  }
}

# API Gateway stage
resource "aws_api_gateway_stage" "main" {
  deployment_id = aws_api_gateway_deployment.main.id
  rest_api_id   = aws_api_gateway_rest_api.main.id
  stage_name    = "v1"

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_gateway.arn
    format = jsonencode({
      requestId         = "$context.requestId"
      sourceIp          = "$context.identity.sourceIp"
      requestTime       = "$context.requestTime"
      protocol          = "$context.protocol"
      httpMethod        = "$context.httpMethod"
      resourcePath      = "$context.resourcePath"
      routeKey          = "$context.routeKey"
      status            = "$context.status"
      responseLength    = "$context.responseLength"
      integrationError  = "$context.integrationErrorMessage"
      integrationStatus = "$context.integrationStatus"
    })
  }

  tags = {
    Name        = "${local.resource_prefix}-api-v1"
    Environment = var.environment
  }
}

# CloudWatch log group for API Gateway access logs
resource "aws_cloudwatch_log_group" "api_gateway" {
  name              = "/aws/apigateway/${local.resource_prefix}-api"
  retention_in_days = 7

  tags = {
    Name        = "${local.resource_prefix}-api-logs"
    Environment = var.environment
  }
}

# Method settings for throttling
resource "aws_api_gateway_method_settings" "all" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  stage_name  = aws_api_gateway_stage.main.stage_name
  method_path = "*/*"

  settings {
    throttling_burst_limit = 100
    throttling_rate_limit  = 50
    logging_level          = "INFO"
    metrics_enabled        = true
  }
}
