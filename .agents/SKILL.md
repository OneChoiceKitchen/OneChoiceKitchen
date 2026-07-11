---
name: onechoice-root
description: >
  Master root skill for the OneChoiceKitchen monorepo. Auto-loaded on every task.
  Establishes baseline context: this is an enterprise food-tech platform using Nx,
  Next.js, NestJS, PostgreSQL, Prisma, and Redis. Always load project-context and
  onechoice-business-rules before implementing any feature.
---

# OneChoiceKitchen — Root AI Skill

## Critical Rules (Always Apply)

1. **Load project-context first** — understand the architecture before writing code
2. **Load onechoice-business-rules** — never violate domain constraints
3. **Apply enterprise-development standards** — clean code, SOLID, error handling
4. **Write tests** — no manual-only testing is acceptable
5. **Run quality gates** before declaring any task complete:
   ```
   pnpm nx affected:test
   pnpm nx affected:lint
   pnpm nx affected:build
   ```

## Technology Stack (Quick Reference)

| Layer | Technology |
|-------|-----------|
| Monorepo | Nx |
| Frontend | Next.js 14+ (App Router), React 18 |
| Backend | NestJS |
| Database | PostgreSQL + Prisma ORM |
| Cache/Queue | Redis (BullMQ) |
| Auth | NextAuth.js / JWT |
| Package Manager | pnpm |
| Language | TypeScript (strict mode) |
| Testing | Vitest, React Testing Library, Playwright |
| Containers | Docker + Docker Compose |
| CI/CD | GitHub Actions + Nx Cloud |

## Applications (Quick Reference)

| App | Port | Description |
|-----|------|-------------|
| api | 3000 | NestJS backend |
| web | 4208 | Customer-facing Next.js |
| admin-portal | 4205 | Admin dashboard |
| partner-portal | 4206 | Restaurant partner portal |
| rider-portal | 4207 | Delivery rider portal |

## When to Load Additional Skills

- Building a UI component → `react-nextjs`, `design-system`, `accessibility`
- Database work → `postgres`, `database-migrations`
- API endpoint → `api-design`, `security`
- Payment feature → `payments`, `security`
- New deployment → `deployment`, `docker`
- Performance issue → `performance`, `redis`
- Bug fix → `troubleshooting`, `testing`

