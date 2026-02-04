#!/bin/sh
set -e

if [ -z "$DB_HOST" ]; then
  echo "DB_HOST is not set. Exiting."
  exit 1
fi

echo "Running database migrations..."
retries=0
while true; do
  if node node_modules/typeorm/cli.js -d dist/data-source.js migration:run; then
    break
  fi

  retries=$((retries + 1))
  if [ "$retries" -ge 10 ]; then
    echo "Migration failed after $retries attempts."
    exit 1
  fi
  echo "Database not ready, retrying in 3s... ($retries/10)"
  sleep 3
done

echo "Starting NestJS..."
exec node dist/main.js
