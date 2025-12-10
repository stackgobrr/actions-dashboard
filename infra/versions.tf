terraform {
  required_version = ">= 1.14.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }

  backend "s3" {
    # Configure via backend config file or environment variables
    # bucket         = "your-terraform-state-bucket"
    # key            = "actions-dashboard/terraform.tfstate"
    # region         = "eu-west-2"
    # encrypt        = true
    # dynamodb_table = "terraform-locks"
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "h3ow3d-actions-dashboard"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}
