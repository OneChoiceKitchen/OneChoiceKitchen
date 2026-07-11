---
name: backup-restore
description: >
  Database backup and restore procedures for OneChoiceKitchen.
  Covers PostgreSQL pg_dump, automated backups, S3 storage, and restore procedures.
  Trigger when: setting up backups, performing restores, disaster recovery,
  or asking about data safety.
---

# Backup & Restore Skill

## Quick Backup (PostgreSQL via Docker)

```bash
# One-line backup
docker exec ock-postgres pg_dump -U postgres onechoice_dev > backup_$(date +%Y%m%d_%H%M%S).sql

# Compressed backup
docker exec ock-postgres pg_dump -U postgres onechoice_dev | gzip > backup_$(date +%Y%m%d).sql.gz
```

## Quick Restore

```bash
# Restore from SQL file
cat backup.sql | docker exec -i ock-postgres psql -U postgres onechoice_dev

# Restore from gzip
gunzip -c backup.sql.gz | docker exec -i ock-postgres psql -U postgres onechoice_dev
```

## Automated Daily Backup Script

```bash
#!/bin/bash
# scripts/maintenance/backup.sh
BACKUP_DIR="/var/backups/ock"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
FILENAME="ock_$TIMESTAMP.sql.gz"

mkdir -p $BACKUP_DIR

docker exec ock-postgres pg_dump -U postgres onechoice_prod | \
  gzip > "$BACKUP_DIR/$FILENAME"

# Keep only last 30 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Backup completed: $BACKUP_DIR/$FILENAME"
```

Add to cron (daily at 2 AM):
```bash
0 2 * * * /opt/ock/scripts/maintenance/backup.sh >> /var/log/ock-backup.log 2>&1
```

## Prisma Migrate State Check

```bash
# Check migration status before restore
pnpm prisma migrate status

# After restore, sync schema
pnpm prisma migrate deploy
```
