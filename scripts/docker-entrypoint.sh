#!/bin/sh
set -e

echo "🔄 Syncing database schema..."
node ./node_modules/prisma/build/index.js db push --skip-generate
echo "✅ Database schema is up to date."

echo "🚀 Starting ViewTrace 阅迹..."
exec node server.js
