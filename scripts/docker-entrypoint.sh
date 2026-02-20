#!/bin/sh
set -e

echo "🔄 Syncing database schema..."
node ./node_modules/prisma/build/index.js db push --skip-generate
echo "✅ Database schema is up to date."

echo "👤 Seeding admin user..."
node /app/scripts/create-admin.js || echo "⚠️ Admin seed skipped (may already exist or ADMIN_EMAIL not set)"

echo "🚀 Starting Next.js..."
exec node server.js
