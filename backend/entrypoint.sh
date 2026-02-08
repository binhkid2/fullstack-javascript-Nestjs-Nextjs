#!/bin/sh
set -e

if [ -z "$DATABASE_URL" ]; then
  echo "DATABASE_URL is not set. Exiting."
  exit 1
fi

echo "Running database migrations..."
retries=0
max_retries="${MIGRATION_MAX_RETRIES:-10}"
retry_sleep_seconds="${MIGRATION_RETRY_SECONDS:-3}"
fail_cooldown_seconds="${MIGRATION_FAIL_COOLDOWN_SECONDS:-30}"

while [ "$retries" -lt "$max_retries" ]; do
  if node node_modules/typeorm/cli.js -d dist/data-source.js migration:run; then
    break
  fi

  retries=$((retries + 1))

  if [ "$retries" -lt "$max_retries" ]; then
    echo "Database not ready, retrying in ${retry_sleep_seconds}s... ($retries/$max_retries)"
    sleep "$retry_sleep_seconds"
  fi
done

if [ "$retries" -ge "$max_retries" ]; then
  echo "Migration failed after $retries attempts. Cooling down for ${fail_cooldown_seconds}s to avoid restart thrashing."
  sleep "$fail_cooldown_seconds"
  exit 1
fi

echo "Starting NestJS..."
exec node dist/main.js
