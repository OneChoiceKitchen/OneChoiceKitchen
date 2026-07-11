# OneChoiceKitchen — Service Orchestration Guide

> **Version:** v5.4 (setup.ps1 / setup_local.ps1) · v3.1 (setup_deployment.ps1)  
> **Last Updated:** 2026-07-11  
> **Audience:** Developers, DevOps, AI agents

---

## Overview

Three PowerShell scripts manage the full OneChoiceKitchen service lifecycle:

| Script | Purpose | When to use |
|---|---|---|
| [`setup.ps1`](../setup.ps1) | Local dev orchestrator (primary) | Daily development |
| [`setup_local.ps1`](../setup_local.ps1) | Local dev orchestrator (v5.4, identical feature set) | Daily development |
| [`setup_deployment.ps1`](../setup_deployment.ps1) | Production deployment | Staging / production deploy |

> **Note:** `setup.ps1` and `setup_local.ps1` are functionally identical as of v5.4. Either can be used for local development.

> **Important:** Always run scripts from an **open PowerShell terminal** — never double-click from Explorer. Double-clicking opens a temporary window that closes immediately.

---

## Quick Start

### Interactive (recommended — stays open, loops until you exit)
```powershell
.\setup_local.ps1        # shows menu → pick action → returns to menu after completion
.\setup.ps1              # same interactive menu
.\setup_deployment.ps1   # deployment menu (bare invocation = interactive)
```

After each task completes, the script shows:
```
  Task complete. Press Enter to return to main menu...
  >
```
Press **Enter** to go back to the menu. Press **Ctrl+C** or choose **[0] Exit** to close.

### Direct commands (run once, exits immediately — good for scripts/CI)
```powershell
# Start services
.\setup_local.ps1 start                          # standard (5 services)
.\setup_local.ps1 start -RunProfile all          # everything including mobile
.\setup_local.ps1 start -RunProfile core         # API + Web only (fastest)
.\setup_local.ps1 start -RunProfile mobile       # API + Mobile + Rider Mobile

# Stop services
.\setup_local.ps1 stop                           # stop all (keep node_modules)
.\setup_local.ps1 stop -DeepClean                # stop + prompt to delete node_modules etc.

# Show status
.\setup_local.ps1 status
```

---

## Interactive Menu

When run with **no arguments**, both `setup.ps1` and `setup_local.ps1` display:

```
  +============================================================+
  |   ONE CHOICE KITCHEN  -  Local Dev Orchestrator v5.4      |
  +============================================================+

  What would you like to do?

  -- START ------------------------------------------------------------------
  [1]  Start  standard (API + Web Portal + Admin + Partner + Rider)
  [2]  Start  all      (standard + Mobile + Rider Mobile)
  [3]  Start  core     (API + Web Portal only -- fastest startup)
  [4]  Start  mobile   (API + Mobile + Rider Mobile)

  -- STOP -------------------------------------------------------------------
  [5]  Stop services              (kill ports -- keep node_modules)
  [6]  Stop + Deep Clean         (kill ports + delete node_modules, .nx, dist)

  -- INFO -------------------------------------------------------------------
  [7]  Show service status

  -- EXIT -------------------------------------------------------------------
  [0]  Exit orchestrator

  Enter choice [0-7]:
```

After each task completes, the script shows:

```
  Task complete. Press Enter to return to main menu...
  (Press Ctrl+C at any time to close this window)
  ============================================================
  > 
```

Press **Enter** to return to the menu and pick another action. The script **stays open** until you choose **[0] Exit** or press **Ctrl+C**.

After selecting, a **confirmation prompt** appears before any action is taken:

```
  You selected: Start services  (Profile: STANDARD)

  Press Enter to continue (Ctrl+C to cancel)
```

---

## Start — What Happens Step by Step

Every `start` action runs these steps automatically:

| Step | What it does |
|---|---|
| **1/7 Prerequisites** | Checks Node.js, installs pnpm if missing, **always runs `pnpm install`**, creates `.env` if missing, generates Prisma client |
| **2/7 Database** | Runs `prisma generate`, `prisma db push` (SQLite), seeds dev data if seed file exists |
| **3/7 Infrastructure** | Checks Docker services (PostgreSQL, Redis, Maildev, pgAdmin) — shows warnings if not running |
| **4/7 Port cleanup** | Kills any stale processes on all service ports |
| **5/7 API startup** | Launches NestJS API in a new terminal window, waits up to 4 minutes |
| **6/7 Frontend startup** | Launches all frontend services with 2-second stagger between each |
| **7/7 Wait** | Waits for each frontend to be ready (up to 4 minutes each) |
| **Prisma Studio** | Opens database management UI at http://localhost:5555 |
| **Browser tabs** | Opens all service URLs in the confirmed launch order |

### Dependency installation detail

`pnpm install` runs on **every start** — it is idempotent and safe:

| Scenario | Time |
|---|---|
| `node_modules` exists, lock file unchanged | **< 5 seconds** |
| `node_modules` exists, minor lock change | ~15 seconds |
| After deep clean (no `node_modules`) | **2–5 minutes** first time |

### Browser launch order (fixed)

After services are ready, browsers open in this exact sequence:

| # | Service | URL | Notes |
|---|---|---|---|
| 1 | Web Portal | http://localhost:4208 | Always |
| 2 | Admin Portal | http://localhost:4205 | Always |
| 3 | Partner Portal | http://localhost:4206 | Always |
| 4 | Rider Portal | http://localhost:4207 | Always |
| 5 | Mobile | http://localhost:4210 | `all` / `mobile` profiles only |
| 6 | Rider Mobile | http://localhost:4212 | `all` / `mobile` profiles only |
| 7 | API Documentation | http://localhost:3000/api/docs | Always (Swagger UI) |
| 8 | MailDev (Email) | http://localhost:1080 | **Always** — auto-starts via Docker if not running |
| 9 | pgAdmin | http://localhost:5050 | Only if already running |
| 10 | Prisma Studio (DB) | http://localhost:5555 | Always (started automatically) |

> **MailDev:** Automatically attempts `docker compose up -d maildev` if port 1080 is not listening. If Docker is not installed, shows a warning and skips. The browser tab always opens regardless.

> **API Docs:** Served at `http://localhost:3000/api/docs` via Swagger UI — configured in `apps/api/src/main.ts` with `SwaggerModule.setup()`.

> **Port detection:** Uses `Get-NetTCPConnection` (not TCP connect) so it correctly detects both IPv4 (`127.0.0.1`) and IPv6 (`::1`) listeners. Next.js on Windows often binds to `::1`.

---

## Stop — Two Modes

### Mode 1: Stop services only (default)
```powershell
.\setup_local.ps1 stop
# OR menu option [5]
```
- Kills all service processes (by saved PIDs and port scan)
- **Keeps** `node_modules`, `.nx` cache, `dist` folders
- Docker infrastructure (PostgreSQL, Redis) continues running

### Mode 2: Stop + Deep Clean
```powershell
.\setup_local.ps1 stop -DeepClean
# OR menu option [6]
```

After stopping services, shows this prompt:

```
  Deep Clean — remove generated & dependency files?

  This will DELETE:
    node_modules/        (all npm packages)
    .nx/                 (Nx daemon + build cache)
    dist/                (compiled output)
    apps/**/.next/       (Next.js build cache per app)
    apps/**/dist/        (per-app compiled output)
    .service-pids        (PID tracking file)

  This will NEVER delete:
    .env / .env.local    Source code   prisma/migrations   pnpm-lock.yaml

  WARNING: pnpm install will run automatically on next start.

  Type 'yes' to confirm deep clean, or press Enter to skip:
```

The user must type the word `yes` — pressing **Enter** skips the deep clean safely.

#### When to use deep clean
- After major dependency upgrades
- When builds produce unexpected results
- When switching branches that have very different `package.json`
- After resolving merge conflicts in `pnpm-lock.yaml`
- When Nx cache seems corrupted

---

## Service Definitions

### Nx Application Services

| Key | Service Name | Port | Profile |
|---|---|---|---|
| `api` | NestJS API | 3000 | all |
| `web` | Web Portal | 4208 | core, standard, all |
| `admin-portal` | Admin Portal | 4205 | standard, all |
| `partner-portal` | Partner Portal | 4206 | standard, all |
| `rider-portal` | Rider Portal | 4207 | standard, all |
| `customer-mobile` | Mobile | 4210 | mobile, all |
| `rider-mobile` | Rider Mobile | 4212 | mobile, all |

### Infrastructure (Docker-managed)

| Service | Port | Start command |
|---|---|---|
| PostgreSQL | 5432 | `docker compose -f docker-compose.dev.yml up -d` |
| Redis | 6379 | same as above |
| MailDev SMTP | 1025 | same as above |
| MailDev UI | 1080 | same as above |
| pgAdmin | 5050 | same as above |
| Prisma Studio | 5555 | auto-started by setup scripts |

### Profiles

| Profile | Services | Use case |
|---|---|---|
| `core` | API + Web Portal | Fastest startup, frontend work only |
| `standard` | API + Web + Admin + Partner + Rider | Daily development (default) |
| `mobile` | API + Mobile + Rider Mobile | Mobile app development |
| `all` | All 7 services | Full platform testing |

---

## Parameters Reference

### setup.ps1 / setup_local.ps1

| Parameter | Type | Default | Description |
|---|---|---|---|
| `Action` | `start\|stop\|status` | _(menu)_ | Action to perform. Omit to show interactive menu. |
| `RunProfile` | `core\|standard\|all\|mobile` | `standard` | Service profile to start |
| `-DeepClean` | Switch | off | When stopping: prompt to delete node_modules, .nx, dist |
| `-NoBrowser` | Switch | off | Skip auto-opening all browser tabs |
| `-NoDBBrowser` | Switch | off | Skip auto-opening Prisma Studio specifically |
| `-OpenDB` | Switch | off | Force-open Prisma Studio (use if -NoDBBrowser was set) |
| `-WithDocker` | Switch | off | Auto-start Docker infra before services |

### setup_deployment.ps1

| Parameter | Type | Default | Description |
|---|---|---|---|
| `Action` | `deploy\|start\|stop\|status` | _(menu)_ | Action to perform. Omit to show interactive menu. |
| `Target` | `docker\|vercel\|vps\|shared\|auto` | `auto` | Deployment target |
| `Env` | `dev\|staging\|prod` | `prod` | Environment |
| `Profile` | `full\|core\|api\|mobile` | `full` | Service profile |
| `-SkipBuild` | Switch | off | Skip `nx build` (use existing dist/) |
| `-NoBrowser` | Switch | off | Skip opening browser after deploy |
| `-DryRun` | Switch | off | Show what would happen without executing |

---

## Troubleshooting

### Services not starting
```powershell
# Clear all ports manually
Get-NetTCPConnection -LocalPort 3000,4205,4206,4207,4208,4210,4212 -ErrorAction SilentlyContinue |
  ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }

# Then restart
.\setup_local.ps1 start
```

### Browser tabs didn't open
```powershell
# Manually open all URLs — safe to run anytime
Start-Process 'http://localhost:4208'   # Web Portal
Start-Process 'http://localhost:4205'   # Admin Portal
Start-Process 'http://localhost:4206'   # Partner Portal
Start-Process 'http://localhost:4207'   # Rider Portal
Start-Process 'http://localhost:4210'   # Mobile
Start-Process 'http://localhost:4212'   # Rider Mobile
Start-Process 'http://localhost:3000/api/docs'  # API Docs
Start-Process 'http://localhost:5555'   # Prisma Studio
```

### pnpm install fails
```powershell
# Delete pnpm store cache and retry
pnpm store prune
.\setup_local.ps1 start
```

### Nx build errors / cache corruption
```powershell
# Reset Nx cache (keeps node_modules)
pnpm nx reset

# Or do a full deep clean
.\setup_local.ps1 stop -DeepClean    # type 'yes' at prompt
.\setup_local.ps1 start              # reinstalls everything
```

### API won't start (port 3000 busy)
```powershell
# Find and kill whatever is using port 3000
Get-NetTCPConnection -LocalPort 3000 -State Listen |
  ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

### Prisma errors
```powershell
# Regenerate Prisma client manually
pnpm prisma generate

# Reset SQLite dev database (DELETES ALL DATA)
pnpm prisma migrate reset --force
```

---

## Common Patterns

### Start only infra (no Nx apps)
```powershell
docker compose -f docker-compose.dev.yml up -d
```

### Stop only infra
```powershell
docker compose -f docker-compose.dev.yml down
```

### Restart a single service
```powershell
# Kill port first, then open a new terminal manually
Get-NetTCPConnection -LocalPort 4205 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
pnpm nx serve admin-portal
```

### Check what's running
```powershell
.\setup_local.ps1 status
```

### Fresh environment after pulling new code
```powershell
.\setup_local.ps1 stop -DeepClean   # type 'yes' at prompt
.\setup_local.ps1 start             # installs all deps fresh
```

---

## Architecture Notes

- **These scripts are completely independent of Docker.** They only manage Nx app processes.
- Each service runs in its **own `cmd.exe` window** labeled `[OCK] ServiceName`.
- PIDs are saved to `.service-pids` for clean shutdown tracking.
- All scripts use PowerShell strict mode (`Set-StrictMode -Version Latest`).
- The `Wait-Port` function uses a 4-minute (240s) timeout per service.
- Port cleanup uses both saved PIDs and `Get-NetTCPConnection` as fallback.

---

## Related Documentation

- [Docker Setup](../infra/README.md) — Docker compose configuration
- [Database Migrations](./database-migrations.md) — Prisma migration workflow
- [Design System](../.agents/skills/design-system/SKILL.md) — UI component standards
- [Environment Variables](../.env.example) — Required environment configuration
