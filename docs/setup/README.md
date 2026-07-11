# Setup Guide

## Prerequisites

| Tool | Minimum Version | Install |
|------|----------------|---------|
| Node.js | 20.x LTS | https://nodejs.org |
| pnpm | 9.x | `npm install -g pnpm` |
| Git | 2.40+ | https://git-scm.com |
| Docker Desktop | 4.x | https://docker.com/desktop *(optional — for PostgreSQL/Redis)* |

---

## 1. Clone & Install

```bash
git clone https://github.com/your-org/OneChoiceKitchen.git
cd OneChoiceKitchen
pnpm install
```

---

## 2. Environment Setup

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

The minimum required variables for local development:

```env
DATABASE_URL="file:./dev.db"        # SQLite for local dev
JWT_SECRET="your-jwt-secret-here"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

See [Environment Variables](./environment-variables.md) for the full list.

---

## 3. Database Setup

### Option A — SQLite (Default, no Docker needed)

```bash
# Generate Prisma client + sync schema to SQLite
pnpm prisma generate
pnpm prisma db push

# Optionally seed the database
pnpm prisma db seed
```

### Option B — PostgreSQL with Docker

```bash
# Start Docker infrastructure
docker compose -f docker-compose.dev.yml up -d

# Verify services are running
docker compose -f docker-compose.dev.yml ps

# Run migrations against PostgreSQL
pnpm prisma migrate deploy
```

---

## 4. Start All Services

### Option A — One command (recommended)

```powershell
# Standard profile (API + Web + Admin + Partner + Rider)
.\setup.ps1 start

# All services including mobile apps
.\setup.ps1 start -RunProfile all

# Start with Docker infra auto-start
.\setup.ps1 start -WithDocker

# Start + open Prisma Studio (database browser)
.\setup.ps1 start -OpenDB

# Start without auto-opening browser tabs
.\setup.ps1 start -NoBrowser
```

### Option B — Individual services

```bash
# API only
pnpm nx serve api

# Customer web portal
pnpm nx serve web

# Admin portal
pnpm nx serve admin-portal

# Partner portal
pnpm nx serve partner-portal

# Rider portal
pnpm nx serve rider-portal
```

---

## 5. Verify Everything Is Running

```powershell
.\setup.ps1 status
```

Expected output shows all services as RUNNING. Then verify:

| Check | URL | Expected |
|-------|-----|----------|
| API Health | http://localhost:3000/api/health | `{"status":"ok"}` |
| API Docs | http://localhost:3000/api/docs | Swagger UI |
| Customer Web | http://localhost:4208 | Home page |
| Admin Portal | http://localhost:4205 | Login screen |

---

## 6. Default Credentials

### Admin Portal (http://localhost:4205)
- Email: `admin@test.com`
- Password: `test123`

### pgAdmin (http://localhost:5050) — Docker mode only
- Email: `admin@onechoicekitchen.com`
- Password: `admin123`
- Server auto-configured to connect to `ock-postgres`

### Prisma Studio (http://localhost:5555)
```bash
pnpm prisma studio
# OR with setup.ps1:
.\setup.ps1 start -OpenDB
```

---

## 7. Common Commands

```bash
# Run all tests
pnpm nx affected:test

# Build all projects
pnpm nx affected:build

# Lint
pnpm nx affected:lint

# Reset Nx cache (fix stale build issues)
pnpm nx reset

# Stop all services
.\setup.ps1 stop

# View service status
.\setup.ps1 status
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Port already in use | `.\setup.ps1 stop` then restart |
| pnpm install fails | Delete `node_modules/` and retry |
| Prisma errors | `pnpm prisma generate` then `pnpm prisma db push` |
| API won't start | Check `.env` has `DATABASE_URL` set |
| Build cache issues | `pnpm nx reset` |

See [Troubleshooting Guide](../troubleshooting/README.md) for more.
