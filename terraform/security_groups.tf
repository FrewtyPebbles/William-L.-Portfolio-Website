# RDS security group — no inline rules to avoid Terraform wiping them
resource "aws_security_group" "rds_sg" {
  name   = "portfolio-rds-sg"
  vpc_id = module.vpc.vpc_id

  tags = {
    Name = "portfolio-rds-sg"
  }
}
