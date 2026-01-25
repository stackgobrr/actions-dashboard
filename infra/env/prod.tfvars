# AWS Configuration
aws_region  = "eu-west-2"
environment = "prod"

# Domain Configuration
#hosted_zone_id = "your-route53-hosted-zone-id"

# GitHub App Configuration
# Note: App ID is passed via GitHub Actions secret as TF_VAR_actions_dashboard_app_id
# Secrets (private key, webhook secret, OAuth credentials) are managed via AWS Secrets Manager
# and uploaded by the deployment workflow before Terraform runs
