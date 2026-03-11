# Default provider for ALB and S3
provider "aws" {
  region = "us-west-1"
}
# Specific provider for CloudFront Certificate (MUST be us-east-1)
provider "aws" {
  alias = "us-east-1"
  region = "us-east-1"
}