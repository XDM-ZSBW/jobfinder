#!/bin/bash
set -e

# Build frontend
cd frontend
npm install
npm run build
cd ..

# Build backend
cd backend
npm install
npx prisma generate
npm run build
cd ..

# Copy backend build to api directory
cp -r backend/dist api/backend-dist
cp backend/dist/index.js api/backend-index.js

# Copy Prisma client to api/node_modules
mkdir -p api/node_modules/.prisma
cp -r backend/node_modules/.prisma/* api/node_modules/.prisma/ 2>/dev/null || true

echo "✅ Build complete"

