locals {
  # Domain name with environment prefix (dev.domain.com for non-prod, domain.com for prod)
  # Used across multiple files: lambda.tf, cloudfront.tf
  domain_name = var.environment != "prod" ? "${var.environment}.${var.domain_name}" : var.domain_name

  # Base HTTPS URL for the dashboard
  base_url = "https://${local.domain_name}"

  # Resource naming prefix (project-environment)
  resource_prefix = "${var.project_name}-${var.environment}"
}