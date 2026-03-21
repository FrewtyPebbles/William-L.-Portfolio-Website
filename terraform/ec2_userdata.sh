#!/bin/bash
set -e

sudo systemctl start docker
sudo systemctl is-active --wait docker

# get Environment Variables
aws s3 cp s3://global-files-wal-aws/portfolio/.env.prod /tmp/.env.prod

source /tmp/.env.prod

cat <<EOF >> /tmp/.env.prod
ENVIRONMENT=prod
CDN_DOMAIN=${cdn_domain}
S3_BUCKET_NAME=${s3_bucket_name}
DATABASE_URL=postgresql://${db_username}:$${DATABASE_PASSWORD}@${db_endpoint}:5432/${db_name}?schema=public&sslmode=require
EOF

echo "[---WAITING FOR DB---]"
until pg_isready -h ${db_endpoint} -p 5432 -U ${db_username}; do
  echo "DB not ready, retrying in 5s..."
  sleep 5
done
echo "[---DB IS READY---]"

# Run the app
docker run -d \
    --name portfolio-app \
    -p 80:3000 \
    --env-file /tmp/.env.prod \
    portfolio

shred -u /tmp/.env.prod

# Get docker stdout logs
sleep 30
echo "[---CONTAINER LOGS---]"
docker logs portfolio-app
echo "[---CONTAINER STATUS---]"
docker ps -a