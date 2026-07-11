---
name: performance
description: >
  Performance optimization standards for OneChoiceKitchen. Covers lazy loading,
  caching strategies, bundle optimization, and database query optimization.
  Apply when building features that must handle high traffic or large datasets.
---

# Performance Standards

## Frontend Performance

### Bundle Optimization (Next.js)
- Use dynamic imports for heavy components:
  `	ypescript
  const MapView = dynamic(() => import('@/components/MapView'), { ssr: false });
  `
- Tree-shake all imports — avoid import * as
- Image optimization: always use 
ext/image with explicit width and height
- Target: LCP < 2.5s, FID < 100ms, CLS < 0.1 (Core Web Vitals)
- Bundle analyze: ANALYZE=true pnpm nx build web

### Rendering Strategy
- Restaurant listings: ISR (evalidate: 300 — 5 minutes)
- Menu pages: SSR (real-time availability)
- Order tracking: Client component with WebSocket
- Static pages (About, Terms): SSG

### Frontend Caching
- SWR or React Query for client-side data fetching with cache
- Optimistic UI updates for cart operations
- Service Worker for offline support (PWA)

## Backend Performance

### Database Query Optimization
- Always use select to return only needed fields
- Never use N+1 queries — use Prisma include or batch queries
- Add database indexes for all foreign keys and frequently filtered columns
- Use cursor-based pagination for large datasets (not offset)
- Connection pooling via PgBouncer in production

### API Response Caching (Redis)
`	ypescript
// Cache restaurant menu for 5 minutes
const cacheKey = estaurant::menu;
const cached = await this.redis.get(cacheKey);
if (cached) return JSON.parse(cached);

const menu = await this.menuRepo.getByRestaurant(id);
await this.redis.setex(cacheKey, 300, JSON.stringify(menu));
return menu;
`

Cache TTL Guidelines:
| Data | TTL |
|------|-----|
| Restaurant info | 5 minutes |
| Menu items | 5 minutes |
| User cart | 24 hours |
| Order status | No cache (real-time) |
| Config/settings | 1 hour |

### HTTP Performance
- Response compression: Gzip/Brotli via NGINX
- HTTP/2 on all production endpoints
- Proper Cache-Control headers on static assets
- Rate limiting to prevent abuse

## Database Indexing Strategy

Critical indexes to add in Prisma schema:
`prisma
model Order {
  @@index([userId])           // All user orders
  @@index([restaurantId])     // All restaurant orders
  @@index([status])           // Status-based filtering
  @@index([createdAt])        // Date range queries
  @@index([userId, status])   // Composite: user + status
}

model MenuItem {
  @@index([restaurantId, isAvailable])  // Active menu items
  @@index([categoryId])                 // Category filter
}
`

## Performance Monitoring

- Track API response times (p50, p95, p99)
- Alert on: p95 > 500ms, p99 > 2s
- Track DB query times — alert on queries > 100ms
- Monitor Redis hit rate — target > 90%
