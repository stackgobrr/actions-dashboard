locals {
  # API Gateway domain for CloudFront origin
  api_gateway_domain = "${aws_api_gateway_rest_api.main.id}.execute-api.${var.aws_region}.amazonaws.com"

  # Map OAuth Lambda functions to their CloudFront path patterns
  lambda_path_patterns = {
    oauth_start    = "/api/oauth/start"
    oauth_callback = "/api/oauth/callback"
  }
}

# Frontend Module (S3 + CloudFront + Custom Domain)
module "frontend" {
  source = "git::https://github.com/stackgobrr/tf-module-aws-frontend.git?ref=main"

  providers = {
    aws.us_east_1 = aws.us_east_1
  }

  project_name   = var.project_name
  environment    = var.environment
  domain_name    = local.domain_name
  hosted_zone_id = var.hosted_zone_id

  # Add API Gateway as additional origin
  additional_origins = [
    {
      origin_id   = "api-gateway"
      domain_name = local.api_gateway_domain
      origin_path = "/v1"
    }
  ]

  # Add cache behaviors for API routes
  additional_cache_behaviors = [
    for key, path in local.lambda_path_patterns : {
      path_pattern               = path
      target_origin_id           = "api-gateway"
      cache_policy_id            = aws_cloudfront_cache_policy.lambda_api.id
      origin_request_policy_id   = aws_cloudfront_origin_request_policy.lambda_api.id
      response_headers_policy_id = aws_cloudfront_response_headers_policy.lambda_api.id
    }
  ]

  # Enable CloudFront access logging
  enable_logging     = true
  logging_prefix     = "cf-logs/"
  log_retention_days = 30

  tags = {
    Name = "${var.project_name}-${var.environment}"
  }
}
