# USE BUILDKIT
ARG ENVIRONMENT=prod
# DEPENDENCIES STAGE
FROM node:lts-slim AS base

ARG ENVIRONMENT

RUN apt-get update && apt-get install -y \
    gnupg \
    software-properties-common \
    curl \
    unzip \
    && rm -rf /var/lib/apt/lists/*

RUN curl https://apt.releases.hashicorp.com/gpg | gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg
RUN echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(grep -oP '(?<=UBUNTU_CODENAME=).*' /etc/os-release || lsb_release -cs) main" | tee /etc/apt/sources.list.d/hashicorp.list
RUN apt update && apt install terraform -y

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

FROM base AS base_build

COPY . .

ENV ENVIRONMENT=${ENVIRONMENT}

RUN terraform -chdir=terraform init

# DEV ENVIRONMENT BUILD STAGE
FROM base_build AS dev_build

RUN npx prisma generate

# This will only be used in dev
# since we dont want to override the db in prod
RUN npx prisma db push


# Build the application
RUN npm run build

# PROD ENVIRONMENT BUILD STAGE
FROM base_build AS prod_build

RUN npx prisma generate
# Build the application
RUN npm run build

# ENVIRONMENT SELECTOR STAGE
FROM ${ENVIRONMENT}_build AS final_build

# RUNTIME STAGE
FROM node:lts-slim AS base_runtime

WORKDIR /app
COPY --from=final_build /app/.next/standalone ./
COPY --from=final_build /app/.next/static ./.next/static
COPY --from=final_build /app/public ./public

# DEV RUNTIME
FROM base_runtime AS dev_runtime

RUN mkdir -p /app/database

COPY --from=final_build /app/prisma/dev_migrations ./prisma/dev_migrations
COPY --from=final_build /app/prisma/schema.dev.prisma ./prisma/schema.dev.prisma
COPY --from=final_build /app/database/dev.db ./database/dev.db

# PROD RUNTIME
FROM base_runtime AS prod_runtime

COPY --from=final_build /app/prisma/prod_migrations ./prisma/prod_migrations
COPY --from=final_build /app/prisma/schema.prod.prisma ./prisma/schema.prod.prisma

# FINAL RUNTIME STAGE
FROM ${ENVIRONMENT}_runtime AS runtime

EXPOSE 3000
ENV PORT=3000

CMD ["npx", "prisma", "migrate", "deploy", "--schema=prisma/schema.${ENVIRONMENT}.prisma", "&&", "node", "server.js"]