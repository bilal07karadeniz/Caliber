#!/bin/bash
set -e

echo "=== AI Match Deployment ==="

echo "1. Building server..."
cd server
npm run build
cd ..

echo "2. Building client..."
cd client
npm run build
cd ..

echo "3. Running migrations..."
cd server
npx prisma migrate deploy
cd ..

echo "=== Deployment complete ==="
echo "Server: http://localhost:3001"
echo "Client: http://localhost:5173"
echo "AI Engine: http://localhost:8000"
