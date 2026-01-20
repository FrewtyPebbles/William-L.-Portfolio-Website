# Stage 1: Install dependencies
FROM node:24-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# Stage 2: Build the application
FROM node:24-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# SQLite Build Setup
ENV DATABASE_URL="file:/app/prisma/dev.db"
RUN npx prisma generate
RUN npx prisma db push --accept-data-loss
RUN npm run build

# Stage 3: Runner
FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN mkdir -p prisma

# Copy essential files
COPY --from=builder /app/public ./public_seed
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]

VOLUME ["/app/prisma", "/app/public"]

EXPOSE 3000
ENV PORT=3000
ENV DATABASE_URL="file:/app/prisma/dev.db"

CMD ["node", "server.js"]
