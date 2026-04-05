#!/bin/sh
echo "Running migrations..."
npx prisma migrate deploy || echo "Migration warning (continuing)"
echo "Starting server..."
exec node dist/index.js
