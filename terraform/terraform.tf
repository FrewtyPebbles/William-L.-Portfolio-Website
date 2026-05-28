terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.32"
    }
    dotenv = {
      source  = "jrhouston/dotenv"
      version = "~> 1.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.7"
    }
  }

  backend "s3" {
    bucket = "global-files-wal-aws"
    key            = "portfolio-website/terraform.tfstate"
    region         = "us-west-1"
    encrypt        = true
    use_lockfile = true
  }

  required_version = ">= 1.14"
}
