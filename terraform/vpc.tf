module "vpc" {
    source = "terraform-aws-modules/vpc/aws"
    version = "6.6.0"

    name = "portfolio-site-vpc"
    cidr = "10.0.0.0/16"

    azs = ["${var.region}a", "${var.region}c"]
    private_subnets = ["10.0.1.0/24", "10.0.2.0/24"]

    enable_dns_hostnames = true
    enable_nat_gateway = false
  }
