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

# pull repo from s3
aws s3 cp s3://global-files-wal-aws/deployments/portfolio.tar /tmp/portfolio.tar

# Load the tarball
docker load < /tmp/portfolio.tar
# get Environment Variables
aws s3 cp s3://global-files-wal-aws/portfolio/.env /tmp/.env
# Run the app
docker run -d \
    -p 80:3000 \
    --env-file /tmp/.env \
    -e CDN_DOMAIN=${cdn_domain} \
    -e S3_BUCKET_NAME=${s3_bucket_name} \
    -e DATABASE_URL="postgresql://${db_username}:${DATABASE_PASSWORD}@${db_endpoint}/${db_name}" \
    portfolio