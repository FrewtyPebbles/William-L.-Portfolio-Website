module "vpc" {
    source = "terraform-aws-modules/vpc/aws"
    version = "6.6.0"

    name = "portfolio-site-vpc"
    cidr = "10.0.0.0/16"

    azs = [ "${var.region}a" ]
    public_subnets = ["10.0.0.0/24"]
    private_subnets = ["10.0.1.0/24"]

    enable_dns_hostnames = true
    enable_nat_gateway = false
    single_nat_gateway = false
}

resource "aws_vpc_endpoint" "s3" {
  vpc_id            = module.vpc.vpc_id
  service_name      = "com.amazonaws.${var.region}.s3"
  vpc_endpoint_type = "Gateway"
  route_table_ids   = module.vpc.private_route_table_ids
}
