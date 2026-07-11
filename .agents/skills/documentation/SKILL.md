---
name: documentation
description: >
  Documentation standards for OneChoiceKitchen. Covers code comments,
  API documentation (Swagger), README files, and knowledge base maintenance.
  Load when adding or updating any documentation.
---

# Documentation Standards

## Code Documentation

### When to Write Comments
Write comments for WHY, not WHAT. Code should be self-explanatory for WHAT.

```typescript
// ❌ Bad - explains WHAT (obvious from code)
// Increment count by 1
count++;

// ✅ Good - explains WHY (non-obvious business logic)
// Delivery fee capped at 50 INR per OneChoiceKitchen pricing policy v2
const deliveryFee = Math.min(calculatedFee, 50);

// ✅ Good - documents complex algorithm
// Haversine formula to calculate great-circle distance between coordinates
function calculateDistance(lat1, lng1, lat2, lng2) { ... }
```

### JSDoc for Public APIs
```typescript
/**
 * Creates a new order and initiates the payment flow.
 * Clears the user's cart on success.
 *
 * @param dto - Order creation data including restaurant and items
 * @param userId - Authenticated user creating the order
 * @throws {NotFoundException} If restaurant or menu item not found
 * @throws {ConflictException} If restaurant is closed
 * @returns Created order with payment details
 */
async createOrder(dto: CreateOrderDto, userId: string): Promise<OrderWithPayment> {}
```

## Swagger API Documentation

Required decorators on all controller methods:
```typescript
@ApiTags('orders')
@ApiOperation({ summary: 'Brief description' })
@ApiCreatedResponse({ type: OrderDto, description: 'Order created' })
@ApiBadRequestResponse({ description: 'Validation error' })
@ApiUnauthorizedResponse({ description: 'Not authenticated' })
```

Access Swagger UI: `http://localhost:3000/api/docs`

## README Standards

Every app/lib must have a README with:
```markdown
# App Name

Brief description of what this app/lib does.

## Getting Started
How to run locally (commands only — not duplicating workspace docs)

## Environment Variables
List of required env vars with descriptions (not values)

## Key Features
- Feature 1
- Feature 2
```

## Skills Documentation Maintenance

When to update `.agents/skills/`:
- Business rules change → update `onechoice-business-rules`
- New port added → update `workspace-orchestrator/references/ports.md`
- Architecture decision made → create new ADR in `adr/`
- New pattern established → update relevant skill

Keep skills under 500 lines. Use `references/` subdirectory for detailed docs.
