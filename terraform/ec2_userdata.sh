#!/bin/bash

# get Environment Variables
aws s3 cp s3://global-files-wal-aws/portfolio/.env.prod /tmp/.env.prod

source /tmp/.env.prod

cat <<EOF >> /tmp/.env.prod
ENVIRONMENT=prod
CDN_DOMAIN="${cdn_domain}"
S3_BUCKET_NAME="${s3_bucket_name}"
DATABASE_URL="postgresql://${db_username}:${DATABASE_PASSWORD}@${db_endpoint}/${db_name}"
EOF

# Run the app
docker run -d \
    --name portfolio-app \
    -p 80:3000 \
    --env-file /tmp/.env.prod \
    portfolio

shred -u /tmp/.env.prod