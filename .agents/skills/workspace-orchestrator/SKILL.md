---
name: workspace-orchestrator
description: >
  Workspace service orchestration for OneChoiceKitchen local development.
  CRITICAL: setup.ps1 and docker-compose.dev.yml are COMPLETELY SEPARATE tools.
  setup.ps1 = pure Nx app service manager (NO Docker code inside).
  docker-compose.dev.yml = infra only (PostgreSQL, Redis, Maildev).
  Update this skill whenever ports, apps, or service dependencies change.
---

# Workspace Orchestrator

## Overview

Two completely separate tools manage local development:

| Tool | Manages | Docker? |
|------|---------|---------|
| `setup.ps1` | All Nx app services (API, portals, mobile) | NO |
| `docker-compose.dev.yml` | Infrastructure only (PostgreSQL, Redis, Maildev) | YES |

**RULE**: Never add Docker code to `setup.ps1`. Never add Nx service logic to docker-compose files.

---

## Usage

```powershell
# ONE COMMAND -- handles everything automatically
.\setup.ps1

# Profiles
.\setup.ps1 start -RunProfile core       # API + Web only (fastest)
.\setup.ps1 start -RunProfile standard   # API + Web + 3 portals (DEFAULT)
.\setup.ps1 start -RunProfile all        # Everything incl. mobile
.\setup.ps1 start -RunProfile mobile     # API + Mobile apps only

.\setup.ps1 stop     # Stop all Nx services
.\setup.ps1 status   # Live status of all ports
```

## What setup.ps1 v4.0 handles automatically (7 phases)

| Phase | What it does | Self-heals? |
|-------|-------------|-------------|
| [1/7] Prerequisites | Node.js check, pnpm install, node_modules, .env files | YES |
| [2/7] Database | prisma generate + prisma db push (SQLite schema sync) | YES |
| [3/7] Infra check | Shows Docker service status (informational, never starts Docker) | n/a |
| [4/7] Port cleanup | Kills stale processes on all service ports | YES |
| [5/7] API startup | Starts API, waits for port 3000, checks /health endpoint | YES |
| [6/7] Frontends | Starts all profile services in separate windows | YES |
| [7/7] Browsers | Opens all service URLs in default browser | YES |

---

## Service Port Map

> **IMPORTANT**: Always update `references/ports.md` when any port changes.
> See `references/ports.md` for the canonical port list.

| Service | Port | core | standard | mobile | all |
|---------|------|------|----------|--------|-----|
| `api` (NestJS) | 3000 | ✔ | ✔ | ✔ | ✔ |
| `web` (customer) | 4208 | ✔ | ✔ | — | ✔ |
| `admin-portal` | 4205 | — | ✔ | — | ✔ |
| `partner-portal` | 4206 | — | ✔ | — | ✔ |
| `rider-portal` | 4207 | — | ✔ | — | ✔ |
| `customer-mobile` | 4210 | — | — | ✔ | ✔ |
| `mobile-app` (Customer PWA) | 4211 | — | — | ✔ | ✔ |
| `rider-mobile` | 4212 | — | — | ✔ | ✔ |
| Prisma Studio | 5555 | auto | auto | auto | auto |
| Maildev SMTP | 1025 | ✔ | ✔ | ✔ | ✔ |
| Maildev UI | 1080 | ✔ | ✔ | ✔ | ✔ |
| Node debugger | 9229 | development |

---

## Startup Sequence

The API MUST start before any frontend. See `references/startup-sequence.md`.

```
1. Stop any running services
2. Kill stale processes on all ports
3. Reset Nx cache (npx nx reset)
4. Generate Prisma client (pnpm prisma generate)
5. Start API (port 3000)
6. Wait for API health on :3000
7. Start frontends (profile-dependent)
8. Start Maildev (ports 1025/1080)
9. Wait for all services to be healthy
10. Open browser tabs
```

---

## Pre-Flight Checks (v2.0)

setup.ps1 v2.0 automatically checks before starting:

1. **pnpm** is installed and on PATH
2. **node_modules** exist (runs `pnpm install` if missing)
3. **apps/api/.env** or **apps/api/.env.local** exists (warns if not)
4. **prisma/schema.prisma** exists

## Environment Variables (auto-set by setup.ps1)

```powershell
$env:NX_REJECT_DYNAMIC_QUESTIONS = "true"
$env:CI                          = "true"
$env:NODE_OPTIONS                = "--no-warnings --max-old-space-size=4096"
$env:NX_ISOLATE_PLUGINS          = "false"
$env:NX_DAEMON                   = "false"
$env:NEXT_TELEMETRY_DISABLED     = "1"
$env:FORCE_COLOR                 = "1"
```

Application secrets must be in each app's `.env` or `.env.local` file.

Application secrets must be in each app's `.env.local` file.

---

## Adding a New Application

When a new Nx application is added:

1. **Assign a port** — pick next available in the 4200+ range
2. **Update `setup.ps1`**:
   - Add to the appropriate `$frontendServices` profile arrays
   - Add `Wait-Port -Port XXXX` for the new app
   - Add `Start-Process "http://localhost:XXXX"` browser launch
   - Add to the kill-ports list in `Stop-Services`
3. **Update `references/ports.md`** — add the new service row
4. **Update `references/profiles.md`** — describe which profile includes it
5. **Update `project-context/SKILL.md`** — add to applications table

### New App Checklist

- [ ] Port assigned and not conflicting
- [ ] `setup.ps1` updated in all 3 places (start, stop, wait)
- [ ] `references/ports.md` updated
- [ ] `references/profiles.md` updated
- [ ] `project-context/SKILL.md` applications table updated

---

## Health Checks

After services start, verify:

```powershell
# Check API health
Invoke-WebRequest http://localhost:3000/api/health -UseBasicParsing

# Check frontend apps
Invoke-WebRequest http://localhost:4208 -UseBasicParsing
Invoke-WebRequest http://localhost:4205 -UseBasicParsing

# Check Maildev
Invoke-WebRequest http://localhost:1080 -UseBasicParsing
```

---

## Troubleshooting Common Issues

### Port Already in Use
```powershell
# Find what's using the port
netstat -ano | findstr :3000
# Kill the process
Stop-Process -Id <PID> -Force
```

### Nx Cache Issues
```powershell
npx nx reset
```

### Prisma Client Out of Sync
```powershell
pnpm prisma generate
```

### Node Processes Not Stopping
```powershell
# Kill all node processes
Get-Process -Name node | Stop-Process -Force
```

---

## References

- Port assignments: `references/ports.md`
- Profile definitions: `references/profiles.md`
- Startup sequence detail: `references/startup-sequence.md`
- Startup checklist: `checklists/startup.md`
- Shutdown checklist: `checklists/shutdown.md`
- Troubleshooting: `checklists/troubleshooting.md`

