---
name: database-migrations
description: >
  Prisma migration strategy for OneChoiceKitchen. Covers creating migrations,
  applying to production, rollback strategy, and data migration patterns.
  Load when making any database schema changes.
---

# Database Migrations

## Migration Workflow

### Development
```bash
# Make schema changes in schema.prisma, then:
pnpm prisma migrate dev --name describe_the_change

# This will:
# 1. Generate SQL migration file in prisma/migrations/
# 2. Apply migration to dev database
# 3. Regenerate Prisma client
```

### Staging / Production
```bash
# Apply pending migrations (safe for production - no schema comparison)
pnpm prisma migrate deploy

# Never run "migrate dev" in production
```

## Naming Conventions

Migration names must be descriptive:
```
add_order_delivery_notes        ← GOOD
add_subscription_pause_fields   ← GOOD
add_restaurant_rating_index     ← GOOD
migration1                      ← BAD
update_table                    ← BAD
```

## Schema Change Patterns

### Adding a Column (Safe)
```prisma
model Order {
  // Existing fields...
  deliveryNotes String? // Nullable for backward compat with existing rows
}
```

### Removing a Column (Dangerous — 2-step)
Step 1: Deploy code that no longer reads the column
Step 2: Create migration to drop the column

Never drop in one step — old code may still reference the column during rollout.

### Renaming a Column (2-step)
Step 1: Add new column, copy data, update code to use new column
Step 2: Remove old column in a separate deployment

### Data Migrations
```typescript
// In a seed script or standalone migration script
const orders = await prisma.order.findMany({ where: { legacyField: null } });
for (const order of orders) {
  await prisma.order.update({
    where: { id: order.id },
    data: { newField: computeValue(order) },
  });
}
```

## Critical Rules

- **Never modify existing migration files** — create a new one to fix mistakes
- **Always test migrations on a copy of production data** before deploying
- **Migrations must be committed to git** — never apply ad-hoc SQL to production
- **Zero-downtime migrations**: add columns as nullable, backfill data, add NOT NULL later
- Run `pnpm prisma generate` after every schema change
- Keep a migration rollback plan for every production deployment

## Rollback Strategy

Prisma does not support automatic rollback. Rollback plan:
1. Keep the previous Docker image ready for API rollback
2. Write reverse migration SQL manually if needed
3. For data migrations: always backup before running
4. Use database snapshots (RDS / Supabase) before major migrations

