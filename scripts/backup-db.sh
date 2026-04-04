#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups"
mkdir -p $BACKUP_DIR

echo "Creating database backup..."
pg_dump $DATABASE_URL > "$BACKUP_DIR/backup_$TIMESTAMP.sql"

# Keep only last 7 backups
cd $BACKUP_DIR
ls -t *.sql | tail -n +8 | xargs -r rm
echo "Backup completed: backup_$TIMESTAMP.sql"
