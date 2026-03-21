# Security Group for the Public Bastion Host
resource "aws_security_group" "bastion_sg" {
    name   = "bastion-sg"
    vpc_id = module.vpc.vpc_id
    ingress {
        from_port   = 22
        to_port     = 22
        protocol    = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
    }
    egress {
        from_port = 0
        to_port = 0
        protocol = "-1"
        cidr_blocks = ["0.0.0.0/0"]
    }
}

# # Security Group for the Private EC2
# resource "aws_security_group" "private_sg" {
#   name   = "private-sg"
#   vpc_id = module.vpc.vpc_id
#   ingress {
#     from_port       = 22
#     to_port         = 22
#     protocol        = "tcp"
#     # Key step: Allow SSH only from bastion
#     security_groups = [aws_security_group.bastion_sg.id]
#   }
#   egress { from_port = 0; to_port = 0; protocol = "-1"; cidr_blocks = ["0.0.0.0/0"] }
# }


data "aws_ssm_parameter" "al2023_ami" {
  name = "/aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-arm64"
}

resource "aws_instance" "bastion" {
    instance_type = "t4g.nano"
  subnet_id                   = module.vpc.public_subnets[0]
  vpc_security_group_ids      = [aws_security_group.bastion_sg.id]
  associate_public_ip_address = true
  ami = data.aws_ssm_parameter.al2023_ami.value
  key_name = "test-server-kp"
  tags = {
    Name = "web-server-bastion"
  }
}