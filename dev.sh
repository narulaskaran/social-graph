#!/bin/bash
set -e

# Backup schema (do this first, before any changes)
cp prisma/schema.prisma prisma/schema.prisma.bak

# Move migrations out of the way for SQLite dev
if [ -d prisma/migrations ]; then
  mv prisma/migrations prisma/migrations-pg
fi

# Ensure migrations and schema are restored on exit (even with Ctrl+C)
function restore_dev_env {
  if [ -d prisma/migrations-pg ]; then
    mv prisma/migrations-pg prisma/migrations
  fi
  if [ -f prisma/schema.prisma.bak ]; then
    mv prisma/schema.prisma.bak prisma/schema.prisma
  fi
}
trap restore_dev_env EXIT SIGINT

# Switch provider to sqlite
sed -i '' 's/provider = "postgresql"/provider = "sqlite"/' prisma/schema.prisma

# Push schema to SQLite DB (force reset)
DATABASE_URL="file:./prisma/dev.db" npx prisma db push --force-reset

# Regenerate Prisma Client for SQLite
npx prisma generate

# Seed SQLite DB using tsconfig-seed.json
DATABASE_URL="file:./prisma/dev.db" NODE_ENV=development npx ts-node --project tsconfig-seed.json prisma/seed.ts

# Start Next.js dev server
DATABASE_URL="file:./prisma/dev.db" NODE_ENV=development next dev --turbopack 