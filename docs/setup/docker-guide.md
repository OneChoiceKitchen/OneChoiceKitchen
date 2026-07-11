# Docker Infrastructure Guide

## Overview

Docker manages **infrastructure services only** (PostgreSQL, Redis, MailDev, pgAdmin).  
Application services (NestJS API, Next.js portals) are managed by `setup.ps1`.

```
┌─────────────────────────────────────────────┐
│  docker-compose.dev.yml (LOCAL DEV)         │
│  ├── PostgreSQL :5432                        │
│  ├── Redis      :6379                        │
│  ├── MailDev    :1025 (SMTP) :1080 (UI)     │
│  └── pgAdmin    :5050                        │
├─────────────────────────────────────────────┤
│  docker-compose.yml (PRODUCTION)            │
│  ├── All above infra services                │
│  ├── api service         :3000               │
│  ├── web service         :4208               │
│  ├── admin-portal        :4205               │
│  ├── partner-portal      :4206               │
│  ├── rider-portal        :4207               │
│  ├── customer-mobile     :4210               │
│  ├── mobile-app          :4211               │
│  └── rider-mobile        :4212               │
└─────────────────────────────────────────────┘
```

---

## Local Development (docker-compose.dev.yml)

### Start all infrastructure

```bash
docker compose -f docker-compose.dev.yml up -d
```

### Or use setup.ps1 flag

```powershell
.\setup.ps1 start -WithDocker
```

### Verify status

```bash
docker compose -f docker-compose.dev.yml ps
```

### View logs

```bash
# All services
docker compose -f docker-compose.dev.yml logs -f

# Specific service
docker compose -f docker-compose.dev.yml logs -f postgres
docker compose -f docker-compose.dev.yml logs -f redis
```

### Stop

```bash
docker compose -f docker-compose.dev.yml down

# Stop AND delete all data (nuclear option)
docker compose -f docker-compose.dev.yml down -v
```

---

## Service Details

### PostgreSQL (port 5432)
- **Container**: `ock-postgres`
- **Database**: `onechoice_dev`
- **Username**: `postgres`
- **Password**: `postgres`
- **Connection string**: `postgresql://postgres:postgres@localhost:5432/onechoice_dev`
- **Data volume**: `pg_dev_data` (persists across restarts)

### Redis (port 6379)
- **Container**: `ock-redis`
- **Max memory**: 256 MB
- **Eviction policy**: `allkeys-lru`
- **Persistence**: AOF enabled

### MailDev (ports 1025/1080)
- **Container**: `ock-maildev`
- **SMTP port**: 1025 — configure NestJS to send here
- **Web UI**: http://localhost:1080 — view all emails sent by the API
- **No authentication** required (dev tool only)

### pgAdmin (port 5050)
- **Container**: `ock-pgadmin`
- **URL**: http://localhost:5050
- **Login**: `admin@onechoicekitchen.com` / `admin123`
- **Server auto-connects** to `ock-postgres` (no manual setup needed)
- **Data volume**: `pgadmin_data`

---

## Database Operations via pgAdmin

1. Open http://localhost:5050
2. Login with admin credentials
3. Expand **Servers → OneChoiceKitchen Dev** (auto-configured)
4. Navigate: **Databases → onechoice_dev → Schemas → public → Tables**
5. Right-click any table → **View/Edit Data**

---

## Connecting from NestJS API

Set in your `.env`:

```env
# For Docker PostgreSQL
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/onechoice_dev"

# For local SQLite (default)
DATABASE_URL="file:./dev.db"

# Redis
REDIS_URL="redis://localhost:6379"

# Email
MAIL_HOST="localhost"
MAIL_PORT="1025"
MAIL_FROM="noreply@onechoicekitchen.com"
```

---

## Production (docker-compose.yml)

For production deployment, see [VPS Docker Guide](../deployment/vps-docker.md).

```bash
# Copy and configure production env
cp .env.docker .env.docker.local
# Edit with production values...

# Start production stack
docker compose up -d

# Scale API (multiple instances)
docker compose up -d --scale api=3
```

---

## Troubleshooting Docker

| Problem | Solution |
|---------|----------|
| Port 5432 in use | `docker ps` to find conflicting container, stop it |
| pgAdmin login fails | Clear browser cache, try incognito |
| Postgres won't connect | Check `docker compose logs postgres` for errors |
| Data missing after restart | Volumes are named — check with `docker volume ls` |
| Redis connection refused | Verify Redis is running: `docker compose ps redis` |
