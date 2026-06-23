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

variable "lambda_artifacts_bucket" {
  description = "The s3 bucket where the Lambda code is stored"
  type        = string
}

variable "lambda_manifest_key" {
  description = "The s3 object key of the Lambda manifest file"
  type        = string
  default     = "manifests/lambda-manifest.json"
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
  description = "Route53 hosted zone ID"
  type        = string
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

# GitHub App
variable "actions_dashboard_app_id" {
  description = "GitHub App ID for Actions Dashboard"
  type        = string
  default     = ""
}

variable "app_private_key" {
  description = "GitHub App private key (PEM)"
  type        = string
  sensitive   = true
  default     = ""
}

variable "webhook_secret" {
  description = "GitHub webhook HMAC secret"
  type        = string
  sensitive   = true
  default     = ""
}

# Database & JWT
variable "db_password" {
  description = "Master password for Aurora Serverless v2 cluster"
  type        = string
  sensitive   = true
  default     = ""
}

variable "jwt_secret" {
  description = "Secret string used to sign JWT session tokens (min 32 chars)"
  type        = string
  sensitive   = true
  default     = ""
}

# Secrets Manager secret names for new secrets
variable "app_private_key_secret_name" {
  description = "Secrets Manager secret name for GitHub App private key"
  type        = string
  default     = "actions-dashboard/github-app-private-key"
}

variable "webhook_secret_secret_name" {
  description = "Secrets Manager secret name for GitHub webhook secret"
  type        = string
  default     = "actions-dashboard/webhook-secret"
}
