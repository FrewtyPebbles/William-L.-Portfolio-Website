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
    security_groups = [aws_security_group.ec2_sg.id]

    iam_instance_profile = aws_iam_instance_profile.ec2_s3_profile.name
    
user_data = <<-EOF
            #!/bin/bash
            # set up swap memory
            sudo fallocate -l 2G /swapfile
            sudo chmod 600 /swapfile
            sudo mkswap /swapfile
            sudo swapon /swapfile
            echo '/swapfile swap swap defaults 0 0' | sudo tee -a /etc/fstab
            
            # install git and docker
            sudo yum install git -y
            sudo dnf install -y docker docker-compose-plugin
            sudo systemctl enable docker
            sudo systemctl start docker

            # pull repo
            git clone https://github.com/FrewtyPebbles/William-L.-Portfolio-Website.git "site"
            cd site

            # in repo
            docker compose up -d
            EOF
    
    tags = {
        Name = "web-server"
    }
}

resource "aws_lb_target_group_attachment" "ec2_attachment" {
  target_group_arn = aws_lb_target_group.alb-target-group.arn
  target_id        = aws_instance.web-server.id   # or your instance ID
  port             = 80
}