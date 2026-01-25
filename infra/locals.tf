locals {
  domain_name = var.environment != "prod" ? "${var.environment}.${var.domain_name}" : var.domain_name
}