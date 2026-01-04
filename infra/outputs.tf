output "s3_bucket_name" {
  description = "Name of the S3 bucket"
  value       = module.frontend.s3_bucket_name
}

output "s3_bucket_arn" {
  description = "ARN of the S3 bucket"
  value       = module.frontend.s3_bucket_arn
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
  value       = module.frontend.route53_record_name
}
