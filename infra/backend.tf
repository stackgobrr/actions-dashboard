terraform {
  backend "s3" {
    bucket  = "h3ow3d-tfstate-575108940418"
    key     = "utils/actions-dashboard/terraform.tfstate"
    region  = "eu-west-2"
    encrypt = true
  }
}
