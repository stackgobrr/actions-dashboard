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

# Lambda Function URLs
output "webhook_receiver_url" {
  description = "URL for GitHub webhook receiver (add this to your GitHub App webhook settings)"
  value       = aws_lambda_function_url.lambda["webhook_receiver"].function_url
}

output "sse_handler_url" {
  description = "URL for SSE streaming endpoint (used by frontend to receive real-time updates)"
  value       = aws_lambda_function_url.lambda["sse_handler"].function_url
}

# Lambda Artifact Bucket
output "lambda_artifacts_bucket" {
  description = "S3 bucket for Lambda deployment artifacts"
  value       = aws_s3_bucket.lambda_artifacts.id
}

# Lambda Function Names
output "webhook_receiver_function_name" {
  description = "Name of the webhook receiver Lambda function"
  value       = aws_lambda_function.lambda["webhook_receiver"].function_name
}

output "sse_handler_function_name" {
  description = "Name of the SSE handler Lambda function"
  value       = aws_lambda_function.lambda["sse_handler"].function_name
}

output "oauth_start_url" {
  description = "URL for OAuth start endpoint"
  value       = aws_lambda_function_url.lambda["oauth_start"].function_url
}

output "oauth_callback_url" {
  description = "URL for OAuth callback endpoint"
  value       = aws_lambda_function_url.lambda["oauth_callback"].function_url
}

output "github_token_url" {
  description = "URL for GitHub token proxy endpoint"
  value       = aws_lambda_function_url.lambda["github_token"].function_url
}

# Secrets Manager Secret ARNs and Names
output "app_private_key_secret_arn" {
  description = "ARN of the Secrets Manager secret for GitHub App private key"
  value       = aws_secretsmanager_secret.secrets["app_private_key"].arn
}

output "webhook_secret_arn" {
  description = "ARN of the Secrets Manager secret for webhook secret"
  value       = aws_secretsmanager_secret.secrets["webhook_secret"].arn
}

output "app_private_key_secret_name" {
  description = "Name of the Secrets Manager secret for GitHub App private key (use in workflows)"
  value       = aws_secretsmanager_secret.secrets["app_private_key"].name
}

output "webhook_secret_name" {
  description = "Name of the Secrets Manager secret for webhook secret (use in workflows)"
  value       = aws_secretsmanager_secret.secrets["webhook_secret"].name
}

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
