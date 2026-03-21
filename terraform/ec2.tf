data "aws_ami" "web-server-ami" {
  most_recent = true
  owners      = ["self"] # this means only the amis in my account

  filter {
    name   = "name"
    values = ["AL-portfolio-ami-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

resource "aws_iam_instance_profile" "ec2_s3_profile" {
  name = "ec2-s3-instance-profile"
  role = aws_iam_role.ec2_s3_role.name
  tags = {
    Application = "Portfolio"
    Environment = var.ENVIRONMENT
  }
}

resource "aws_instance" "web-server" {
  depends_on = [aws_rds_cluster_instance.portfolio_instance]
  ami           = data.aws_ami.web-server-ami.id
  instance_type = "t4g.nano"

  subnet_id = module.vpc.private_subnets[0]

  iam_instance_profile = aws_iam_instance_profile.ec2_s3_profile.name

  vpc_security_group_ids = [aws_security_group.ec2_sg.id]

  user_data = templatefile("${path.module}/ec2_userdata.sh", {
    db_username    = aws_rds_cluster.portfolio_db.master_username
    db_endpoint    = aws_rds_cluster.portfolio_db.endpoint
    db_name        = aws_rds_cluster.portfolio_db.database_name
    cdn_domain     = "walofcode.com"
    s3_bucket_name = aws_s3_bucket.static-content-bucket.id
    s3_region = aws_s3_bucket.static-content-bucket.region
  })

  user_data_replace_on_change = true
  # Remove in prod VVV
  key_name = "test-server-kp"
  # Remove in prod ^^^
  tags = {
    Name = "web-server"
  }
}
