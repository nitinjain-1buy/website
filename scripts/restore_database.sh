#!/bin/bash

# Database Restore Script for 1BUY.AI
# This script restores the MongoDB database from a backup

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(dirname "$SCRIPT_DIR")"
BACKUP_FILE="$APP_DIR/database_backup.tar.gz"
BACKUP_DIR="$APP_DIR/database_backup"

echo "=========================================="
echo "1BUY.AI Database Restore Script"
echo "=========================================="

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo "ERROR: Backup file not found at $BACKUP_FILE"
    echo "Please ensure database_backup.tar.gz is in the /app directory"
    exit 1
fi

# Extract backup if needed
if [ ! -d "$BACKUP_DIR" ]; then
    echo "Extracting backup archive..."
    cd "$APP_DIR"
    tar -xzvf database_backup.tar.gz
fi

# Get MongoDB connection details from .env
MONGO_URL="${MONGO_URL:-mongodb://localhost:27017}"
DB_NAME="${DB_NAME:-test_database}"

echo ""
echo "Restoring database: $DB_NAME"
echo "MongoDB URL: $MONGO_URL"
echo ""

# Restore the database
mongorestore --uri="$MONGO_URL" --db="$DB_NAME" --drop "$BACKUP_DIR/test_database/"

echo ""
echo "=========================================="
echo "Database restore complete!"
echo "=========================================="
echo ""
echo "Collections restored:"
mongosh --quiet "$MONGO_URL/$DB_NAME" --eval "db.getCollectionNames().forEach(function(c) { print('  - ' + c + ': ' + db[c].countDocuments() + ' documents'); })"
