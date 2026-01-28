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

# OAuth Configuration
variable "oauth_client_id_secret_name" {
  description = "Secrets Manager secret name for OAuth client ID"
  type        = string
  default     = "actions-dashboard/oauth-client-id"
}

variable "oauth_start_source_code_hash" {
  description = "Source code hash for oauth_start Lambda (base64-encoded SHA256)"
  type        = string
  default     = ""
}

variable "oauth_callback_source_code_hash" {
  description = "Source code hash for oauth_callback Lambda (base64-encoded SHA256)"
  type        = string
  default     = ""
}

variable "oauth_client_secret_secret_name" {
  description = "Secrets Manager secret name for OAuth client secret"
  type        = string
  default     = "actions-dashboard/oauth-client-secret"
}

# Secret values (passed from GitHub Actions secrets)
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
