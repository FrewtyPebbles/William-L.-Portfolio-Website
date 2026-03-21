# USE BUILDKIT
ARG ENVIRONMENT=prod
# DEPENDENCIES STAGE
FROM node:lts-slim AS base

ARG ENVIRONMENT

WORKDIR /app
COPY package.json package-lock.json* ./
COPY public ./public

# install npm package dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

RUN npm ci

FROM base AS final_build

COPY . .

ENV ENVIRONMENT=${ENVIRONMENT}

RUN npx prisma generate
# Build the application
RUN npm run build

# RUNTIME STAGE
FROM node:lts-slim AS runtime

# Update the certificates for rds connection
RUN apt-get update && apt-get install -y \
    openssl \
    curl \
    ca-certificates \
    && curl -sS https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem \
       -o /etc/ssl/certs/rds-global-bundle.pem \
    && rm -rf /var/lib/apt/lists/*

ENV NODE_EXTRA_CA_CERTS=/etc/ssl/certs/rds-global-bundle.pem

WORKDIR /app

COPY --from=final_build /app/prisma/migrations ./prisma/migrations
COPY --from=final_build /app/.next/standalone ./
COPY --from=final_build /app/.next/static ./.next/static
COPY --from=final_build /app/public ./public
COPY --from=final_build /app/prisma/schema.prisma ./prisma/schema.prisma
COPY --from=final_build /app/prisma.config.ts ./prisma.config.ts

RUN npm install prisma@7.5.0 --save-dev

EXPOSE 3000
ENV PORT=3000

CMD npx prisma migrate deploy && node server.js