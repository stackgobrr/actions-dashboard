locals {
  domain_name = var.environment != "prod" ? "${var.environment}.${var.domain_name}" : var.domain_name

  secrets = {
    oauth_client_id = {
      name        = var.environment != "prod" ? "${var.environment}-${var.oauth_client_id_secret_name}" : var.oauth_client_id_secret_name
      description = "OAuth client ID for Actions Dashboard"
    }
    oauth_client_secret = {
      name        = var.environment != "prod" ? "${var.environment}-${var.oauth_client_secret_secret_name}" : var.oauth_client_secret_secret_name
      description = "OAuth client secret for Actions Dashboard"
    }
  }

  lambda_url_domains = {
    for key in keys(aws_lambda_function.lambda) :
    key => replace(replace(aws_lambda_function_url.lambda[key].function_url, "https://", ""), "/", "")
  }

  # Map OAuth Lambda functions to their path patterns
  lambda_path_patterns = {
    oauth_start    = "/api/oauth/start"
    oauth_callback = "/api/oauth/callback"
  }
}