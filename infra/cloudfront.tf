# CloudFront cache policies and origins for Lambda Function URLs

# Extract Lambda Function URL domains (without https:// and trailing /)
locals {
  lambda_url_domains = {
    for key in keys(aws_lambda_function.lambda) :
    key => replace(replace(aws_lambda_function_url.lambda[key].function_url, "https://", ""), "/", "")
  }
  
  # Map Lambda functions to their path patterns
  lambda_path_patterns = {
    webhook_receiver = "/api/webhook"
    sse_handler      = "/api/sse"
    oauth_start      = "/api/oauth/start"
    oauth_callback   = "/api/oauth/callback"
    github_token     = "/api/github/token"
  }
}

# Create cache policy for API requests (no caching)
resource "aws_cloudfront_cache_policy" "lambda_api" {
  name        = "${var.project_name}-${var.environment}-lambda-api"
  comment     = "No caching for API requests"
  default_ttl = 0
  max_ttl     = 0
  min_ttl     = 0

  parameters_in_cache_key_and_forwarded_to_origin {
    cookies_config {
      cookie_behavior = "none"
    }

    headers_config {
      header_behavior = "none"
    }

    query_strings_config {
      query_string_behavior = "none"
    }

    enable_accept_encoding_brotli = true
    enable_accept_encoding_gzip   = true
  }
}

# Create origin request policy to forward all headers/cookies/query strings
resource "aws_cloudfront_origin_request_policy" "lambda_api" {
  name    = "${var.project_name}-${var.environment}-lambda-api"
  comment = "Forward all headers, cookies, and query strings to Lambda"

  cookies_config {
    cookie_behavior = "all"
  }

  headers_config {
    header_behavior = "allViewer"
  }

  query_strings_config {
    query_string_behavior = "all"
  }
}

