packer {
    required_plugins {
        amazon = {
            version = ">= 1.2.8"
            source  = "github.com/hashicorp/amazon"
        }
    }
}

source "amazon-ebs" "amazon-linux" {
    ami_name      = "AL-portfolio-ami-{{timestamp}}"
    instance_type = "t3.medium"
    region        = "us-east-1"
    ssh_username  = "ec2-user" # Default for Amazon Linux

    source_ami_filter {
        filters = {
        name                = "al2023-ami-*-x86_64" # For Amazon Linux 2023
        root-device-type    = "ebs"
        virtualization-type = "hvm"
        }
        most_recent = true
        owners      = ["137112412989"] # Official Amazon ID
    }
}

build {
    sources = ["source.amazon-ebs.amazon-linux"]

    # Step 1: Install & Start Docker
    provisioner "shell" {
        inline = [
        "sudo yum update -y",
        "sudo yum install -y docker",
        "sudo systemctl enable --now docker",
        "sudo usermod -aG docker ec2-user",
        "sudo dd if=/dev/zero of=/swapfile bs=128M count=16",
        "sudo chmod 600 /swapfile",
        "sudo mkswap /swapfile",
        "sudo swapon /swapfile",
        "echo '/swapfile swap swap defaults 0 0' | sudo tee -a /etc/fstab"
        ]
    }

    provisioner "file" {
        source      = "./tmp/portfolio.tar"
        destination = "/tmp/portfolio.tar"
    }

    provisioner "shell" {
        inline = [
        "sudo docker load -i /tmp/portfolio.tar",
        "sudo rm /tmp/portfolio.tar"
        ]
    }

}
