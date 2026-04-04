#!/bin/bash
if [ -z "$1" ]; then
  echo "Usage: ./restore-db.sh <backup_file>"
  exit 1
fi

echo "Restoring database from $1..."
psql $DATABASE_URL < "$1"
echo "Restore completed!"
