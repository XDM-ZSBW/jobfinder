#!/bin/bash
# Install dependencies for Vercel serverless functions
# This script installs api/package.json dependencies at root level

cd backend && npm install && npm run build
cd ..
npm install express@^4.18.2 cors@^2.8.5 dotenv@^16.3.1 socket.io@^4.6.2 winston@^3.11.0 zod@^3.22.4 bcryptjs@^2.4.3 jsonwebtoken@^9.0.2 passport@^0.7.0 passport-jwt@^4.0.1 passport-local@^1.0.0 @aws-sdk/client-ses@^3.917.0 @google-cloud/secret-manager@^6.1.1 @google/generative-ai@^0.24.1 @prisma/client@^5.7.1 langchain@^0.1.1 --save --production

