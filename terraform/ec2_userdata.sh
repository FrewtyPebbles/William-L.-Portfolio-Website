#!/bin/bash
# set up swap memory
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile swap swap defaults 0 0' >> /etc/fstab

# install docker
yum update -y
amazon-linux-extras install docker -y
systemctl enable docker
systemctl start docker

# pull image from s3
aws s3 cp s3://global-files-wal-aws/deployments/portfolio.tar /tmp/portfolio.tar
# get Environment Variables
aws s3 cp s3://global-files-wal-aws/portfolio/.env.prod /tmp/.env.prod

# Load the tarball
docker load < /tmp/portfolio.tar
# Run the app
docker run -d \
    --name portfolio-app \
    -p 80:3000 \
    --env-file /tmp/.env.prod \
    -e ENVIRONMENT=prod \
    -e CDN_DOMAIN="${cdn_domain}" \
    -e S3_BUCKET_NAME="${s3_bucket_name}" \
    -e DATABASE_URL="postgresql://${db_username}:${DATABASE_PASSWORD}@${db_endpoint}/${db_name}" \
    portfolio