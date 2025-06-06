#!/bin/bash
set -e

# Restore provider to postgresql in schema.prisma
if [ -f prisma/schema.prisma ]; then
  sed -i '' 's/provider = "sqlite"/provider = "postgresql"/' prisma/schema.prisma
fi 