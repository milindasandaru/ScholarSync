#!/bin/sh
set -e

if [ "${RUN_MIGRATIONS}" = "true" ]; then
  echo "Running prisma db push..."
  npx prisma db push --schema=prisma/schema.prisma
fi

if [ "${RUN_SEED}" = "true" ]; then
  echo "Running seed script..."
  npm run seed
fi

echo "Starting Next.js server..."
exec npm run start
