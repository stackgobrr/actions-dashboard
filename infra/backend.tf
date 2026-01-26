terraform {
  backend "s3" {
    bucket = "h3ow3d-tfstate-575108940418"
    # passed in at terraform init
    # key     = "utils/actions-dashboard/${var.environment}/terraform.tfstate"
    use_lockfile = true
    region       = "eu-west-2"
    encrypt      = true
  }
}
