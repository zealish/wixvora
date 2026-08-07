#!/bin/sh
set -e

echo "🚀 Starting Wixvora application..."

echo "⏳ Waiting for PostgreSQL to be ready..."
until node -e "require('postgres')(process.env.DATABASE_URL).unsafe('SELECT 1').then(() => process.exit(0)).catch(() => process.exit(1))" 2>/dev/null; do
  echo "⏳ PostgreSQL is unavailable - sleeping"
  sleep 2
done

echo "✅ PostgreSQL is ready!"

echo "📦 Generating database migrations..."
pnpm run db:generate || true

echo "🔄 Running database migrations..."
pnpm run db:migrate

echo "🌱 Seeding database..."
pnpm run db:seed || echo "⚠️  Seeding failed or already completed"

echo "🎉 Starting Next.js application..."
exec "$@"
