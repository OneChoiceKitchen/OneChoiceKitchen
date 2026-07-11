# ADR-002: PostgreSQL as Primary Database

**Status**: Accepted
**Date**: 2026-07-01

---

## Decision

Use PostgreSQL 15+ as the primary relational database for all OneChoiceKitchen data.

---

## Context

OneChoiceKitchen requires a reliable, ACID-compliant database for financial transactions, order management, user data, and complex relational queries. The platform handles sensitive payment data, order state machines, and multi-tenancy (customers, partners, riders).

---

## Problem

Selecting the wrong database could result in:
- Data integrity issues in financial records
- Inability to handle complex relational queries (orders, menus, riders)
- Poor scalability under high-concurrency order processing
- Limited support for advanced features (full-text search, JSON, geospatial)

---

## Options Considered

### Option 1: MySQL / MariaDB
- ✅ Widely supported, easy hosting
- ❌ Weaker JSON support vs PostgreSQL
- ❌ No native full-text search for Indian languages
- ❌ Row-level locking less efficient for concurrent writes

### Option 2: MongoDB (NoSQL)
- ✅ Flexible schema for menu items
- ❌ No ACID transactions across collections
- ❌ Complex joins for order + items + restaurant + user
- ❌ Financial data requires strict consistency

### Option 3: PostgreSQL (selected)
- ✅ Full ACID compliance
- ✅ Native JSON/JSONB for flexible menu data
- ✅ PostGIS extension for geospatial delivery queries
- ✅ Full-text search with tsvector
- ✅ Row-level security for multi-tenancy
- ✅ Prisma ORM excellent support

---

## Final Decision

**Use PostgreSQL 15+** with:
- Prisma ORM for type-safe queries
- `cuid()` for primary keys (portable, URL-safe)
- `Decimal` type for all monetary values (never `Float`)
- UUIDs avoided in favor of CUID for performance

---

## Consequences

### Positive
- Type-safe queries via Prisma
- ACID guarantees for payment + order transactions
- PostGIS ready for delivery radius queries
- Strong ecosystem (Railway, Supabase, RDS, Neon)

### Negative / Trade-offs
- Schema migrations required for every structural change
- More complex horizontal scaling vs NoSQL (use read replicas)
- Prisma adds ORM abstraction layer overhead

### Rules That Follow From This Decision
- All monetary values use `Decimal @db.Decimal(10,2)` — never `Float`
- All database changes go through Prisma migrations (no raw DDL)
- Never query database from controllers — only from repository layer
- Use `select` to limit returned fields — never `SELECT *` equivalent

