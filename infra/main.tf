# Frontend Module (S3 + CloudFront + Custom Domain)
module "frontend" {
  source = "git::https://github.com/stackgobrr/tf-module-aws-frontend.git?ref=main"

  providers = {
    aws.us_east_1 = aws.us_east_1
  }

  project_name   = var.project_name
  environment    = var.environment
  domain_name    = var.domain_name
  hosted_zone_id = var.hosted_zone_id

  tags = {
    Name = "${var.project_name}-${var.environment}"
  }
}
