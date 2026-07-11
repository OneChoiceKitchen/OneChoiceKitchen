<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- For navigating/exploring the workspace, invoke the `nx-workspace` skill first - it has patterns for querying projects, targets, and dependencies
- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- Prefix nx commands with the workspace's package manager (e.g., `pnpm nx build`, `npm exec nx test`) - avoids using globally installed CLI
- You have access to the Nx MCP server and its tools, use them to help the user
- For Nx plugin best practices, check `node_modules/@nx/<plugin>/PLUGIN.md`. Not all plugins have this file - proceed without it if unavailable.
- NEVER guess CLI flags - always check nx_docs or `--help` first when unsure

## Scaffolding & Generators

- For scaffolding tasks (creating apps, libs, project structure, setup), ALWAYS invoke the `nx-generate` skill FIRST before exploring or calling MCP tools

## When to use nx_docs

- USE for: advanced config options, unfamiliar flags, migration guides, plugin configuration, edge cases
- DON'T USE for: basic generator syntax (`nx g @nx/react:app`), standard commands, things you already know
- The `nx-generate` skill handles generator discovery internally - don't call nx_docs just to look up generator syntax

<!-- nx configuration end-->

---

# OneChoiceKitchen — AI Agent Universal Guide

> This file applies to ALL AI coding assistants: **Gemini (Antigravity)**, **Cursor**, **GitHub Copilot**, **Claude**, **Codex**, and any other AI tool working in this workspace.

## Project Overview

**OneChoiceKitchen** is an enterprise-grade food delivery platform built as an Nx monorepo.

- **Type**: Multi-tenant food delivery SaaS (India market)
- **Stack**: Next.js 14 (frontends) + NestJS (API) + PostgreSQL/Prisma + Redis/BullMQ
- **Build System**: Nx with pnpm
- **Package Manager**: `pnpm` — NEVER use `npm install` or `yarn`

## Workspace Structure

```
OneChoiceKitchen/           ← Monorepo root
  apps/
    api/                    ← NestJS backend (PRIMARY — port 3000)
    api-e2e/                ← API end-to-end tests
    web/                    ← Customer Next.js app (port 4208)
    admin/                  ← Admin portal (port 4205)
    partner/                ← Partner portal (port 4206)
    rider/                  ← Rider portal (port 4207)
    customer-mobile/        ← Customer mobile (port 4210)
    rider-mobile/           ← Rider mobile (port 4212)
    landing-page/           ← Marketing landing page
    web-e2e/                ← Web E2E tests
  libs/                     ← Shared libraries (types, utils, UI)
  prisma/
    schema.prisma           ← Database schema (single source of truth)
    migrations/             ← All DB migrations
    seeds/                  ← Seed scripts
  scripts/
    maintenance/            ← One-off scripts, utilities (NOT in git CI)
  infra/                    ← Infrastructure configs (Docker, NGINX, Terraform)
  docs/                     ← Technical documentation
  tools/                    ← Nx workspace tools and generators
  .agents/                  ← AI agent skills and knowledge base (see below)
```

## AI Agent Skills System

All domain knowledge, standards, and patterns are in `.agents/skills/`. 

**Load these skills FIRST on every task (in order):**
1. `project-context` — Architecture overview
2. `onechoice-business-rules` — Domain rules (order lifecycle, roles, pricing)
3. Task-specific skill (e.g., `testing`, `api-design`, `database-migrations`)

Skills directory: `.agents/skills/`
ADR directory: `.agents/adr/`

## Critical Rules (Apply Always)

1. **Package manager**: Always `pnpm` — never `npm` or `yarn`
2. **Nx tasks**: Always `pnpm nx [task] [project]` — never run build tools directly
3. **Testing**: No task is complete without automated tests (see `testing` skill)
4. **Security**: All API endpoints need auth guards + RBAC (see `security` skill)
5. **No secrets**: Never hardcode API keys — always use environment variables
6. **Types first**: Define TypeScript types in `libs/` before implementing features
7. **Migrations**: Schema changes via `pnpm prisma migrate dev` — no raw DDL

## Common Commands

```bash
# Start local development (all services)
.\setup.ps1 start

# Start minimal (API + Web only)
.\setup.ps1 start -Profile core

# Run affected tests
pnpm nx affected:test

# Run affected builds
pnpm nx affected:build

# Lint
pnpm nx affected:lint

# Generate a new app
pnpm nx g @nx/next:app apps/my-app

# Run Prisma Studio
npx prisma studio
```

## Service Ports

| Service | Port |
|---------|------|
| NestJS API | 3000 |
| Admin Portal | 4205 |
| Partner Portal | 4206 |
| Rider Portal | 4207 |
| Customer Web | 4208 |
| PostgreSQL | 5432 |
| Redis | 6379 |
| Maildev UI | 1080 |

## AI Tool-Specific Notes

### Cursor
- Rules are in `.cursor/` directory
- Skills available in `.cursor/skills/`
- Use `@.agents/skills/[skill-name]/SKILL.md` to reference skills in chat

### GitHub Copilot / Codex
- Rules are in `.github/` directory
- Skills available in `.github/skills/`
- Context file: this `AGENTS.md` at workspace root

### Claude
- Config in `.claude/settings.json`
- Load `AGENTS.md` + relevant `.agents/skills/` files for context

### Gemini (Antigravity)
- Full skill system in `.agents/skills/`
- Skills auto-load based on task descriptions
- 37 domain-specific skills available

## Maintenance Scripts

One-off migration and utility scripts are in `scripts/maintenance/`.
These are NOT part of CI/CD. Do not run them automatically.
Review each script before running — many are historical data fixes.

---

## Design System v3.0 (Updated 2026-07-09)

**This section is MANDATORY reading before making any UI changes.**

### Brand Identity
- **Primary:** `#2563EB` (Blue) — buttons, links, active tabs, focus rings, charts
- **Accent:** `#DC2626` (Red) — danger actions, delete, notifications, error states
- **Background:** `#f3f4f8` (Azure Portal grey — NOT white)
- **Surface:** `#ffffff` (cards, panels, modals)
- **Design Inspiration:** Microsoft Azure Portal — clean, compact, data-dense

### CSS Token Files (Single Source of Truth)
| File | Purpose |
|------|---------|
| `apps/admin/admin-portal/src/styles.css` | Global design tokens, component classes, grid system |
| `apps/admin/admin-portal/src/page-defaults.css` | Cascade overrides for all 57+ module pages |
| `apps/admin/admin-portal/src/app/app.module.css` | Admin shell: header, sidebar, login, navigation |
| `apps/web/app/globals.css` | Customer web portal tokens |
| `apps/partner/partner-portal/src/styles.css` | Partner portal tokens |
| `apps/rider/rider-portal/src/styles.css` | Rider portal tokens |

### Key CSS Variables (use these — never hardcode)
```css
--brand-blue:     #2563EB   /* Primary buttons, links */
--brand-blue-dk:  #1d4ed8   /* Hover state */
--brand-blue-lt:  #eff6ff   /* Table row hover tint */
--brand-red:      #DC2626   /* Danger, delete, error */
--brand-red-dk:   #b91c1c   /* Danger hover */
--brand-red-lt:   #fef2f2   /* Error background tint */
--bg:             #f3f4f8   /* Page background */
--surf:           #ffffff   /* Card/panel background */
--bdr:            #e2e8f0   /* Default border */
```

### UI Rules for AI Agents
1. **NEVER use** `#0054A6`, `#003893`, `#004385` — these are old legacy blues, **replaced**
2. **NEVER use** `#ef4444` as the primary error/danger color — use `#DC2626` (brand red)
3. **Primary action buttons** → `background: #2563EB` (or `var(--brand-blue)`)
4. **Danger/delete buttons** → `background: #DC2626` (or `var(--brand-red)`)
5. **Notification badges** → Brand Red (urgency indicator)
6. **Table row hover** → `var(--brand-blue-lt, #eff6ff)` — never `#f8fafc`
7. **Focus rings** → `0 0 0 3px rgba(37,99,235,.1)` with `border-color: var(--brand-blue)`
8. **Module page wrapper** → add class `page-container` to root div — inherits page-defaults.css styles

### Page Shell Pattern (Admin Portal)
Every admin module page MUST follow this HTML structure for visual consistency:
```html
<div class="page-container">
  <div class="page-header">
    <div class="page-title-block">
      <h1 class="page-title">📦 Module Name</h1>
      <p class="page-subtitle">Description</p>
    </div>
    <div class="page-actions">
      <button class="btn btn-primary">+ Create</button>
    </div>
  </div>
  <div class="filter-bar">...</div>
  <div class="table-wrapper"><table class="table">...</table></div>
</div>
```

### Skills to Load for UI Work
- `design-system` — full token reference and component patterns
- `ui-ux` — Azure Portal admin patterns and interaction rules
- `accessibility` — WCAG 2.1 AA compliance checklist

