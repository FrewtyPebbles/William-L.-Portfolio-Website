data "aws_ec2_managed_prefix_list" "cloudfront" {
  name = "com.amazonaws.global.cloudfront.origin-facing"
}

resource "aws_security_group" "private_ec2_sg" {
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

resource "aws_security_group_rule" "allow_cloudfront_to_ec2" {
  type              = "ingress"
  from_port         = 80
  to_port           = 80
  protocol          = "tcp"
  prefix_list_ids   = [data.aws_ec2_managed_prefix_list.cloudfront.id]
  security_group_id = aws_security_group.ec2_sg.id
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
