---
name: api-design
description: >
  RESTful API design standards for OneChoiceKitchen NestJS backend. Covers URL
  conventions, HTTP method usage, response shapes, versioning, and Swagger docs.
  Load when designing or implementing API endpoints.
---

# API Design Standards

## URL Conventions

- Use kebab-case for resources
- Use plural nouns for collections
- Nest resources to show relationships (max 2 levels)

```
GET    /api/restaurants                  # List restaurants
POST   /api/restaurants                  # Create restaurant
GET    /api/restaurants/:id              # Get restaurant
PATCH  /api/restaurants/:id              # Update restaurant
DELETE /api/restaurants/:id              # Delete restaurant

GET    /api/restaurants/:id/menu-items   # Restaurant menu items
POST   /api/orders                       # Create order
GET    /api/orders/:id                   # Get order
PATCH  /api/orders/:id/status            # Update order status
POST   /api/orders/:id/cancel            # Cancel order (action endpoint)
```

## HTTP Methods

| Method | Use | Idempotent |
|--------|-----|-----------|
| GET | Read data | Yes |
| POST | Create resource | No |
| PUT | Replace resource | Yes |
| PATCH | Partial update | No |
| DELETE | Delete resource | Yes |

## Response Shape Standards

### Success Response (single resource)
```json
{
  "id": "clx123",
  "status": "CONFIRMED",
  "totalAmount": 450.00,
  "createdAt": "2026-07-09T10:00:00Z"
}
```

### Success Response (collection)
```json
{
  "data": [...],
  "meta": {
    "total": 150,
    "page": 1,
    "pageSize": 20,
    "hasNextPage": true
  }
}
```

### Error Response
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    { "field": "restaurantId", "message": "restaurantId must not be empty" }
  ]
}
```

## Status Codes

| Code | Use |
|------|-----|
| 200 | Success (GET, PATCH, DELETE) |
| 201 | Created (POST) |
| 204 | No content (DELETE with no body) |
| 400 | Bad request (validation error) |
| 401 | Unauthorized (no/invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not found |
| 409 | Conflict (duplicate resource) |
| 422 | Unprocessable entity |
| 429 | Too many requests (rate limited) |
| 500 | Internal server error |

## Swagger Documentation

All endpoints must have Swagger decorators:
```typescript
@ApiTags('orders')
@ApiOperation({ summary: 'Create a new order' })
@ApiCreatedResponse({ type: OrderResponseDto, description: 'Order created' })
@ApiBadRequestResponse({ description: 'Validation failed' })
@ApiUnauthorizedResponse({ description: 'Not authenticated' })
async create(@Body() dto: CreateOrderDto): Promise<OrderResponseDto> {}
```

## Pagination

Use cursor-based pagination for large datasets:
```typescript
// Query: GET /api/orders?cursor=<lastId>&limit=20
const orders = await this.prisma.order.findMany({
  take: limit + 1,
  cursor: cursor ? { id: cursor } : undefined,
  orderBy: { createdAt: 'desc' },
});
const hasNext = orders.length > limit;
return { data: orders.slice(0, limit), hasNext };
```

## API Versioning

- Current: v1 (implicit, no prefix)
- When breaking changes needed: `/api/v2/...`
- Never remove v1 without deprecation period (minimum 3 months)
