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

# Set DATABASE_URL for build
ENV DATABASE_URL="file:/app/database/dev.db"

# Create temporary database directory for build
RUN mkdir -p /app/database

# Generate Prisma Client and create temporary database for build
RUN npx prisma generate
RUN npx prisma db push --accept-data-loss

# Build the application
RUN npm run build

# Remove the temporary database (it won't be in the final image)
RUN rm -rf /app/database

# Stage 3: Runner
FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Create database directory for volume mount
RUN mkdir -p /app/database

# Copy essential files
COPY --from=builder /app/public ./public_seed
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy Prisma schema and migrations for runtime database setup
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]

EXPOSE 3000
ENV PORT=3000
ENV DATABASE_URL="file:/app/database/dev.db"

CMD ["node", "server.js"]