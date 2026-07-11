# Troubleshooting Guide

## Quick Diagnostic

```powershell
.\setup.ps1 status
```

---

## Common Issues

### 1. Port Already in Use

**Symptom**: `EADDRINUSE: address already in use :::3000`

```powershell
# Stop all OneChoiceKitchen services
.\setup.ps1 stop

# Or find and kill specific port
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

---

### 2. API Won't Start

**Symptom**: NestJS crashes immediately on startup

**Check 1 — Missing DATABASE_URL**
```bash
# Verify .env exists and has DATABASE_URL
cat .env | grep DATABASE_URL
# If missing:
echo 'DATABASE_URL="file:./dev.db"' >> .env
```

**Check 2 — Prisma not generated**
```bash
pnpm prisma generate
pnpm prisma db push
```

**Check 3 — Missing .env file**
```bash
cp .env.example .env
# Then fill in required values
```

---

### 3. Prisma Client Not Found

**Symptom**: `Cannot find module '@prisma/client'`

```bash
pnpm prisma generate
```

---

### 4. Database Migration Failed

**Symptom**: `P3018 migration failed`

```bash
# Check what failed
pnpm prisma migrate status

# For local SQLite, reset and redo:
pnpm prisma migrate reset  # ⚠️ deletes all data

# For PostgreSQL:
pnpm prisma migrate deploy
```

---

### 5. pnpm install Fails

**Symptom**: `ENOENT` or `ERR_PNPM_FETCH_500`

```bash
# Clear pnpm cache
pnpm store prune

# Delete node_modules and retry
Remove-Item -Recurse -Force node_modules
pnpm install
```

---

### 6. Nx Build Fails

**Symptom**: `Cannot find project 'api'` or stale cache errors

```bash
# Reset Nx cache
pnpm nx reset

# Rebuild specific project
pnpm nx build api --skip-nx-cache
```

---

### 7. Redis Connection Refused

**Symptom**: `Error: connect ECONNREFUSED 127.0.0.1:6379`

```powershell
# Start Redis via Docker
docker compose -f docker-compose.dev.yml up -d redis

# Or verify Docker status
docker compose -f docker-compose.dev.yml ps
```

---

### 8. PostgreSQL Connection Refused (Docker)

**Symptom**: `P1001: Can't reach database server at localhost:5432`

```powershell
# Start PostgreSQL container
docker compose -f docker-compose.dev.yml up -d postgres

# Check logs for errors
docker compose -f docker-compose.dev.yml logs postgres

# Verify connection
docker exec ock-postgres psql -U postgres -c "\l"
```

---

### 9. pgAdmin Won't Load

**Symptom**: http://localhost:5050 shows error

```powershell
# Restart pgAdmin container
docker compose -f docker-compose.dev.yml restart pgadmin

# Check logs
docker compose -f docker-compose.dev.yml logs pgadmin
```

---

### 10. Browser Tabs Not Opening

**Symptom**: setup.ps1 runs but no browser tabs appear

```powershell
# Run without auto-browser (check if services start first)
.\setup.ps1 start -NoBrowser

# Then manually open:
Start-Process "http://localhost:3000/api/docs"
Start-Process "http://localhost:4208"
```

---

### 11. Emails Not Received in MailDev

**Symptom**: API sends email, nothing in MailDev UI

1. Check MailDev is running: http://localhost:1080
2. Verify SMTP settings in `.env`:
   ```env
   MAIL_HOST=localhost
   MAIL_PORT=1025
   ```
3. Start MailDev: `docker compose -f docker-compose.dev.yml up -d maildev`

---

### 12. Next.js Build Error (Module not found)

**Symptom**: `Module not found: Can't resolve '@org/ui-design-system'`

```bash
# Rebuild the shared library first
pnpm nx build ui-design-system

# Then rebuild the app
pnpm nx build admin-portal
```

---

### 13. TypeScript Errors After Schema Change

**Symptom**: TS errors on Prisma types after `schema.prisma` change

```bash
# Regenerate Prisma client
pnpm prisma generate

# Restart TypeScript server in VS Code: Ctrl+Shift+P → "Restart TS Server"
```

---

## Service Health Checks

| Service | Command | Expected |
|---------|---------|---------|
| API | `curl http://localhost:3000/api/health` | `{"status":"ok"}` |
| PostgreSQL | `docker exec ock-postgres pg_isready` | `accepting connections` |
| Redis | `docker exec ock-redis redis-cli ping` | `PONG` |
| MailDev | `curl http://localhost:1080` | HTML response |

---

## Log Locations

| Service | Log Command |
|---------|------------|
| API | `pnpm nx serve api` (stdout) |
| PostgreSQL | `docker compose logs postgres` |
| Redis | `docker compose logs redis` |
| Nx tasks | `.nx/cache/` |
| setup.ps1 | Colored console output |

---

## Still Stuck?

1. Check [GitHub Issues](https://github.com/your-org/OneChoiceKitchen/issues)
2. Run `pnpm nx reset` and try again
3. Wipe and reinstall: `Remove-Item -Recurse node_modules; pnpm install`
4. Check `.env` has all required variables (see [Environment Variables](../setup/environment-variables.md))
