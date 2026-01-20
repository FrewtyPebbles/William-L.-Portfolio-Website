#!/bin/sh
set -e

# Source and target directories
SOURCE_DIR="/app/public_seed"
TARGET_DIR="/app/public"

# Create target directory if it doesn't exist
mkdir -p "$TARGET_DIR"

# Copy initial public files if the volume is empty
if [ -z "$(ls -A "$TARGET_DIR")" ]; then
  echo "Copying initial public files into volume..."
  cp -R "$SOURCE_DIR/"* "$TARGET_DIR/"
else
  echo "Public volume already has files, skipping copy."
fi

# Initialize database if it doesn't exist
DB_FILE="/app/database/dev.db"
if [ ! -f "$DB_FILE" ]; then
  echo "Database not found. Initializing database..."
  npx prisma db push --accept-data-loss --skip-generate
  echo "Database initialized successfully."
else
  echo "Database already exists, skipping initialization."
fi

# Start the app
exec "$@"