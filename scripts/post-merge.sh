#!/bin/bash
set -e

npm install --legacy-peer-deps --force

npx prisma generate

npx prisma migrate deploy 2>/dev/null || true
