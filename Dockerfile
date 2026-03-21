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

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

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