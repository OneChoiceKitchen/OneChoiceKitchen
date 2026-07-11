---
name: postgres
description: >
  PostgreSQL usage patterns for OneChoiceKitchen. Covers indexing strategy,
  transaction handling, JSON queries, full-text search, and connection pooling.
  Load when optimizing queries or designing data models.
---

# PostgreSQL Standards

## Data Type Rules

| Data | Type | Notes |
|------|------|-------|
| Monetary amounts | `Decimal @db.Decimal(10,2)` | NEVER Float — precision matters |
| IDs | `String @id @default(cuid())` | cuid for portability |
| Timestamps | `DateTime @default(now())` | Always include createdAt/updatedAt |
| Status fields | Prisma `enum` | Type-safe status management |
| JSON/JSONB | `Json` | Use for flexible metadata |
| Coordinates | `Float` | lat/lng as decimal degrees |
| Phone numbers | `String` | Store with country code |

## Indexing Strategy

Always index:
- All foreign key columns
- Columns used in `WHERE` clauses on large tables
- Columns used in `ORDER BY` on paginated queries
- Composite indexes for common query patterns

```prisma
model Order {
  @@index([userId])
  @@index([restaurantId])
  @@index([status])
  @@index([createdAt(sort: Desc)])
  @@index([userId, status])           // Composite: "my active orders"
  @@index([restaurantId, createdAt])  // Composite: "restaurant's recent orders"
}
```

## Transaction Patterns

```typescript
// Use interactive transactions for multi-step operations
const result = await this.prisma.$transaction(async (tx) => {
  const order = await tx.order.create({ data: orderData });
  await tx.cartItem.deleteMany({ where: { userId } });
  await tx.inventory.updateMany({
    where: { itemId: { in: itemIds } },
    data: { quantity: { decrement: 1 } }
  });
  return order;
});
```

## JSON Queries

```typescript
// Query JSONB fields
const orders = await this.prisma.order.findMany({
  where: {
    metadata: {
      path: ['source'],
      equals: 'mobile_app',
    },
  },
});
```

## Full-Text Search

```typescript
// Restaurant search
const restaurants = await this.prisma.$queryRaw`
  SELECT * FROM restaurants
  WHERE to_tsvector('english', name || ' ' || cuisine_type) @@ plainto_tsquery('english', ${query})
  ORDER BY ts_rank(to_tsvector('english', name), plainto_tsquery('english', ${query})) DESC
  LIMIT 20;
`;
```

## Connection Pooling

- Use PgBouncer in production (transaction mode)
- Prisma connection pool size: `DATABASE_URL?connection_limit=10&pool_timeout=30`
- Never create more connections than PostgreSQL `max_connections / 2`

## Query Optimization Rules

- Always use `select` — never return all columns
- Use cursor-based pagination for large datasets
- Prefer `findMany` over `findFirst` in a loop (N+1 prevention)
- Use `include` for related data instead of separate queries
- Analyze slow queries with `EXPLAIN ANALYZE`

