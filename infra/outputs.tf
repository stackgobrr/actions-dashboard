output "s3_bucket_name" {
  description = "Name of the S3 bucket"
  value       = module.frontend.s3_bucket_name
}

output "s3_bucket_arn" {
  description = "ARN of the S3 bucket"
  value       = "arn:aws:s3:::${module.frontend.s3_bucket_name}"
}

output "cloudfront_distribution_id" {
  description = "ID of the CloudFront distribution"
  value       = module.frontend.cloudfront_distribution_id
}

output "cloudfront_domain_name" {
  description = "Domain name of the CloudFront distribution"
  value       = module.frontend.cloudfront_domain_name
}

output "website_url" {
  description = "URL to access the dashboard"
  value       = module.frontend.website_url
}

output "certificate_arn" {
  description = "ARN of the ACM certificate (if using custom domain)"
  value       = module.frontend.certificate_arn
}

output "route53_record_name" {
  description = "DNS name of the Route53 record (if using custom domain)"
  value       = module.frontend.domain_name
}

# Lambda Artifact Bucket
output "lambda_artifacts_bucket" {
  description = "S3 bucket for Lambda deployment artifacts"
  value       = aws_s3_bucket.lambda_artifacts.id
}

# OAuth Lambda Function URLs
output "oauth_start_url" {
  description = "URL for OAuth start endpoint"
  value       = aws_lambda_function_url.lambda["oauth_start"].function_url
}

output "oauth_callback_url" {
  description = "URL for OAuth callback endpoint"
  value       = aws_lambda_function_url.lambda["oauth_callback"].function_url
}

# OAuth Secrets Manager Secret ARNs and Names
output "oauth_client_id_secret_arn" {
  description = "ARN of the Secrets Manager secret for OAuth client ID"
  value       = aws_secretsmanager_secret.secrets["oauth_client_id"].arn
}

output "oauth_client_secret_secret_arn" {
  description = "ARN of the Secrets Manager secret for OAuth client secret"
  value       = aws_secretsmanager_secret.secrets["oauth_client_secret"].arn
}

output "oauth_client_id_secret_name" {
  description = "Name of the Secrets Manager secret for OAuth client ID (use in workflows)"
  value       = aws_secretsmanager_secret.secrets["oauth_client_id"].name
}

output "oauth_client_secret_secret_name" {
  description = "Name of the Secrets Manager secret for OAuth client secret (use in workflows)"
  value       = aws_secretsmanager_secret.secrets["oauth_client_secret"].name
}
