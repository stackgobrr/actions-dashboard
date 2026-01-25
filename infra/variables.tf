variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "eu-west-2"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"

  validation {
    condition     = contains(["dev", "prod"], var.environment)
    error_message = "Environment must be either 'dev' or 'prod'"
  }
}

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
  default     = "actions-dashboard"
}

variable "domain_name" {
  description = "Custom domain name for the dashboard (optional)"
  type        = string
  default     = "actions.dashboard.stackgobrr.com"
}

variable "hosted_zone_id" {
  description = "Route53 hosted zone ID (required if domain_name is set)"
  type        = string
  default     = ""
}

variable "cloudfront_price_class" {
  description = "CloudFront price class (PriceClass_All, PriceClass_200, PriceClass_100)"
  type        = string
  default     = "PriceClass_100" # US, Canada, Europe
}

# GitHub App Configuration (for webhook support)
variable "actions_dashboard_app_id" {
  description = "GitHub App ID for Actions Dashboard"
  type        = string
}

variable "private_key_secret_name" {
  description = "Secrets Manager secret name for GitHub App private key"
  type        = string
  default     = "actions-dashboard/app-private-key"
}

variable "webhook_secret_name" {
  description = "Secrets Manager secret name for webhook secret"
  type        = string
  default     = "actions-dashboard/webhook-secret"
}

variable "oauth_client_id_secret_name" {
  description = "Secrets Manager secret name for OAuth client ID"
  type        = string
  default     = "actions-dashboard/oauth-client-id"
}

variable "oauth_client_secret_secret_name" {
  description = "Secrets Manager secret name for OAuth client secret"
  type        = string
  default     = "actions-dashboard/oauth-client-secret"
}

# Secret values (passed from GitHub Actions secrets)
variable "app_private_key" {
  description = "GitHub App private key (PEM format)"
  type        = string
  sensitive   = true
}

variable "webhook_secret" {
  description = "GitHub App webhook secret"
  type        = string
  sensitive   = true
}

variable "oauth_client_id" {
  description = "OAuth client ID"
  type        = string
  sensitive   = true
}

variable "oauth_client_secret" {
  description = "OAuth client secret"
  type        = string
  sensitive   = true
}
