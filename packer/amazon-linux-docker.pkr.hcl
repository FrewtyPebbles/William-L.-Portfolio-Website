packer {
    required_plugins {
        amazon = {
            version = ">= 1.2.8"
            source  = "github.com/hashicorp/amazon"
        }
    }
}

source "amazon-ebs" "amazon-linux" {
    ami_name      = "${var.ami_prefix}-${formatdate("YYYY-MM-DD-hhmm", timestamp())}"
    instance_type = "t4g.small"
    region        = var.aws_region
    ssh_username  = "ec2-user" # Default for Amazon Linux

    launch_block_device_mappings {
        device_name           = "/dev/xvda"
        volume_size           = 15
        volume_type           = "gp3"
        delete_on_termination = true
    }

    source_ami_filter {
        filters = {
        name                = "al2023-ami-*-arm64"
        root-device-type    = "ebs"
        virtualization-type = "hvm"
        }
        most_recent = true
        owners      = ["137112412989"]
    }
}

build {
    sources = ["source.amazon-ebs.amazon-linux"]

    provisioner "shell" {
        inline = [
            "sudo yum update -y",
            "sudo yum install -y docker postgresql15",
            "sudo yum install -y docker",
            "sudo systemctl enable --now docker",
            "sudo usermod -aG docker ec2-user",
            "sudo dd if=/dev/zero of=/swapfile bs=1M count=3072",
            "sudo chmod 600 /swapfile",
            "sudo mkswap /swapfile",
            "sudo swapon /swapfile",
            "echo '/swapfile swap swap defaults 0 0' | sudo tee -a /etc/fstab"
        ]
    }

    provisioner "file" {
        source      = "./packer/tmp/portfolio.tar"
        destination = "/tmp/portfolio.tar"
    }

    provisioner "shell" {
        inline = [
        "sudo docker load -i /tmp/portfolio.tar",
        "sudo rm /tmp/portfolio.tar"
        ]
    }

}
