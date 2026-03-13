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
  }

  required_version = ">= 1.14"
}