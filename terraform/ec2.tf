data "aws_ssm_parameter" "amazon_linux_2023_ami" {
    name = "/aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64"
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
    ami = data.aws_ssm_parameter.amazon_linux_2023_ami.value
    instance_type = "t2.micro"

    subnet_id = module.vpc.private_subnets[0]

    iam_instance_profile = aws_iam_instance_profile.ec2_s3_profile.name

    vpc_security_group_ids = [aws_security_group.ec2_sg.id]
    
    user_data = templatefile("${path.module}/ec2_userdata.sh",{
      db_username = aws_rds_cluster.portfolio_db.master_username
      db_endpoint = aws_rds_cluster.portfolio_db.endpoint
      db_name = aws_rds_cluster.portfolio_db.database_name
      cdn_domain = aws_cloudfront_distribution.portfolio-cdn.domain_name
      s3_bucket_name = aws_s3_bucket.static-content-bucket.id
    })
    
    tags = {
        Name = "web-server"
    }
}
