---
name: troubleshooting
description: >
  Debugging runbooks for common OneChoiceKitchen issues. Covers API errors,
  database issues, Redis problems, Nx build failures, and service startup issues.
  Load when diagnosing any production or development issue.
---

# Troubleshooting Guide

## Service Startup Issues

### API Not Starting
1. Check if port 3000 is in use: `netstat -ano | findstr :3000`
2. Kill conflicting process: `Stop-Process -Id <PID> -Force`
3. Check `.env.local` exists and has `DATABASE_URL`
4. Run `pnpm prisma generate` (Prisma client may be missing)
5. Check `docker-compose up` for PostgreSQL and Redis

### Nx Build Failing
1. Reset Nx cache: `npx nx reset`
2. Clear node_modules: `Remove-Item node_modules -Recurse` then `pnpm install`
3. Check for TypeScript errors: `pnpm nx run-many --target=typecheck --all`
4. Verify tsconfig.json paths are correct

**Known: `Cannot read file '.../apps/tsconfig.base.json'`**
- Cause: `apps/api/tsconfig.json` or `tsconfig.app.json` uses `"extends": "../tsconfig.base.json"` (resolves to `apps/`) instead of `"../../tsconfig.base.json"` (resolves to root)
- Fix: Change both `apps/api/tsconfig.json` and `apps/api/tsconfig.app.json` extends path to `"../../tsconfig.base.json"`
- Same fix applies to `apps/api-e2e/tsconfig.json`

**Known: `Module not found: Can't resolve 'otplib'` or `'qrcode'`**
- These packages are used in `auth.service.ts` for 2FA (TOTP) features
- Fix: `pnpm add otplib qrcode`

**Known: `serve` runs `api:build:production` instead of development**
- Cause: `project.json` build target `defaultConfiguration` was set to `"production"`
- Fix: Change `defaultConfiguration` in build target to `"development"` in `apps/api/project.json`

### Port Already in Use
```powershell
# Find and kill process
netstat -ano | findstr :4208
Stop-Process -Id <PID> -Force
```

## API Errors

### 401 Unauthorized
- Check JWT token is included in Authorization header: `Bearer <token>`
- Token may be expired (15 min expiry) — refresh using refresh token
- Verify `NEXTAUTH_SECRET` matches between frontend and backend

### 403 Forbidden
- User role doesn't have permission for this action
- Check `@Roles()` decorator on the endpoint
- Verify user's role in database matches expected role

### 500 Internal Server Error
1. Check API logs for stack trace
2. Look for: database connection errors, Prisma errors, missing env vars
3. Common: Prisma client not generated — run `pnpm prisma generate`

## Database Issues

### Connection Refused
```bash
# Check PostgreSQL is running
docker ps | grep postgres
docker-compose up postgres -d
# Verify DATABASE_URL in .env.local
```

### Prisma Migration Failed
```bash
# Reset dev database (CAUTION: data loss)
pnpm prisma migrate reset
# Or apply manually
pnpm prisma migrate dev --name fix_issue
```

### N+1 Query Performance
- Use Prisma `include` instead of separate queries in a loop
- Add `@@index` to Prisma schema for frequently queried fields
- Use `EXPLAIN ANALYZE` in `psql` to identify slow queries

## Redis Issues

### Connection Failed
```bash
docker ps | grep redis
docker-compose up redis -d
# Test: redis-cli ping → PONG
```

### Cart Lost
- Cart has 24h TTL — this is expected after expiry
- Check Redis key: `redis-cli hgetall cart:<userId>`

## Nx CI Issues

### Affected Not Working
- Ensure base commit is set: `pnpm nx affected --base=main --head=HEAD`
- Check `.nxignore` for excluded paths

### Cache Miss in CI
- Verify `NX_CLOUD_AUTH_TOKEN` is set in CI environment
- Check Nx Cloud dashboard for cache status

## Quick Diagnostic Commands

```powershell
# Service health checks
Invoke-WebRequest http://localhost:3000/api/health
# Prisma DB connection
npx prisma db execute --stdin "SELECT 1"
# Redis ping
redis-cli ping
# Nx project graph
pnpm nx graph
```
