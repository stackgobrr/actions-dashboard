# CloudFront cache policies and origins for Lambda Function URLs

# Create cache policy for API requests (no caching)
resource "aws_cloudfront_cache_policy" "lambda_api" {
  name        = "${local.resource_prefix}-lambda-api"
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

    enable_accept_encoding_brotli = false
    enable_accept_encoding_gzip   = false
  }
}

# Create origin request policy to forward all headers/cookies/query strings
resource "aws_cloudfront_origin_request_policy" "lambda_api" {
  name    = "${local.resource_prefix}-lambda-api"
  comment = "Forward all headers, cookies, and query strings to Lambda"

  cookies_config {
    cookie_behavior = "all"
  }

  headers_config {
    header_behavior = "allExcept"
    headers {
      items = ["Host"]
    }
  }

  query_strings_config {
    query_string_behavior = "all"
  }
}

# Response headers policy for CORS
resource "aws_cloudfront_response_headers_policy" "lambda_api" {
  name    = "${local.resource_prefix}-lambda-api-cors"
  comment = "CORS policy for Lambda API endpoints"

  cors_config {
    access_control_allow_credentials = true

    access_control_allow_headers {
      items = ["Authorization", "Content-Type", "Accept", "Origin", "X-Requested-With"]
    }

    access_control_allow_methods {
      items = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    }

    access_control_allow_origins {
      items = [local.base_url]
    }

    access_control_expose_headers {
      items = ["Content-Length", "Content-Type", "Date", "ETag", "X-Amzn-RequestId"]
    }

    access_control_max_age_sec = 86400
    origin_override            = true
  }
}

