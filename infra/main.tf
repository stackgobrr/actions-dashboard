# Frontend Module (S3 + CloudFront + Custom Domain)
module "frontend" {
  source = "git::https://github.com/stackgobrr/tf-module-aws-frontend.git?ref=main"

  providers = {
    aws.us_east_1 = aws.us_east_1
  }

  project_name   = var.project_name
  environment    = var.environment
  domain_name    = var.domain_name
  hosted_zone_id = var.hosted_zone_id

  # Add Lambda Function URLs as additional origins
  additional_origins = [
    for key, domain in local.lambda_url_domains : {
      origin_id   = "lambda-${key}"
      domain_name = domain
    }
  ]

  # Add cache behaviors for API routes
  additional_cache_behaviors = [
    for key, path in local.lambda_path_patterns : {
      path_pattern             = path
      target_origin_id         = "lambda-${key}"
      cache_policy_id          = aws_cloudfront_cache_policy.lambda_api.id
      origin_request_policy_id = aws_cloudfront_origin_request_policy.lambda_api.id
    }
  ]

  tags = {
    Name = "${var.project_name}-${var.environment}"
  }
}
