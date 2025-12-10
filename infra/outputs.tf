output "s3_bucket_name" {
  description = "Name of the S3 bucket"
  value       = aws_s3_bucket.dashboard.id
}

output "s3_bucket_arn" {
  description = "ARN of the S3 bucket"
  value       = aws_s3_bucket.dashboard.arn
}

output "cloudfront_distribution_id" {
  description = "ID of the CloudFront distribution"
  value       = aws_cloudfront_distribution.dashboard.id
}

output "cloudfront_domain_name" {
  description = "Domain name of the CloudFront distribution"
  value       = aws_cloudfront_distribution.dashboard.domain_name
}

output "website_url" {
  description = "URL to access the dashboard"
  value       = var.domain_name != "" ? "https://${var.domain_name}" : "https://${aws_cloudfront_distribution.dashboard.domain_name}"
}

output "certificate_arn" {
  description = "ARN of the ACM certificate (if using custom domain)"
  value       = var.domain_name != "" ? aws_acm_certificate.dashboard[0].arn : null
}

output "route53_record_name" {
  description = "DNS name of the Route53 record (if using custom domain)"
  value       = var.domain_name != "" ? aws_route53_record.dashboard[0].name : null
}
