data "aws_ec2_managed_prefix_list" "cloudfront" {
  name = "com.amazonaws.global.cloudfront.origin-facing"
}

resource "aws_security_group" "ec2_sg" {
  name        = "portfolio-private-ec2-sg"
  description = "Restrict access to CloudFront VPC Origin only"
  vpc_id      = module.vpc.vpc_id

  ingress {
    description     = "HTTP from CloudFront VPC Origin"
    from_port       = 80
    to_port         = 80
    protocol        = "tcp"
    prefix_list_ids = [data.aws_ec2_managed_prefix_list.cloudfront.id]
  }

  # Remove this in prod vvv
  ingress {
    from_port       = 22
    to_port         = 22
    protocol        = "tcp"
    security_groups = [aws_security_group.bastion_sg.id]
  }
  # ^^^ Remove this in prod

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "Portfolio-Private-SG"
  }
}

resource "aws_security_group" "rds_sg" {
  name   = "portfolio-rds-sg"
  vpc_id = module.vpc.vpc_id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ec2_sg.id]
    description     = "Allow PostgreSQL from EC2 app only"
  }

  tags = {
    Name = "rds-behind-ec2"
  }
}
