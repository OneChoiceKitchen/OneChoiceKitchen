# ADR-003: Prisma ORM

**Status**: Accepted
**Date**: 2026-07-01

---

## Decision

Use Prisma as the ORM for all database interactions in OneChoiceKitchen.

---

## Context

A consistent, type-safe database access layer is needed across the NestJS API. Raw SQL is error-prone, unmaintainable, and not type-safe. An ORM provides schema management, migrations, and IDE autocompletion.

---

## Problem

Without a structured ORM:
- Raw SQL queries lack type safety
- Schema migrations are manual and error-prone
- Database query patterns become inconsistent across modules
- Developer productivity is lower

---

## Options Considered

### Option 1: TypeORM
- ✅ Well-integrated with NestJS
- ❌ Decorator-heavy, verbose entity definitions
- ❌ Migration system less reliable than Prisma
- ❌ Complex relation loading (eager/lazy inconsistencies)

### Option 2: Knex.js (Query Builder)
- ✅ Flexible, close to SQL
- ❌ No type generation from schema
- ❌ No migration management
- ❌ More boilerplate

### Option 3: Prisma (selected)
- ✅ Schema-first design (single source of truth)
- ✅ Auto-generated TypeScript types from schema
- ✅ First-class migration system
- ✅ Prisma Studio for visual data browsing
- ✅ Excellent Next.js and NestJS ecosystem support

---

## Final Decision

**Use Prisma 5+** with:
- Single schema.prisma file as the source of truth
- Migrations via prisma migrate dev (dev) and prisma migrate deploy (prod)
- Generated client via prisma generate
- PrismaService as a singleton in NestJS DI

---

## Consequences

### Positive
- Full TypeScript type safety for all DB operations
- Automatic type generation when schema changes
- Visual data exploration via Prisma Studio

### Negative / Trade-offs
- Prisma Client must be regenerated after schema changes
- Complex aggregate queries sometimes require $queryRaw
- Prisma-specific API — not transferable to other ORMs

### Rules That Follow From This Decision
- Run pnpm prisma generate after every schema.prisma change
- Never bypass Prisma with raw SQL unless absolutely necessary (document why)
- All migrations committed to git — never modify existing migration files
- schema.prisma is the canonical data model — update it before writing code
