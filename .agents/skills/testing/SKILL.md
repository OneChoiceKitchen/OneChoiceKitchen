---
name: testing
description: >
  Mandatory testing standards for OneChoiceKitchen. Every feature, bug fix, or
  refactor MUST include automated tests. No manual-only testing is acceptable.
  Covers React Testing Library, Vitest, Jest, and Playwright E2E.
---

# Testing Standards

## Core Principle

> **NO task is complete without automated tests.**

Manual testing is for verification only — it cannot replace automated tests. Every piece of functionality must have:
1. Test cases written
2. Automated execution passing
3. Regression validation covered

---

## Testing Pyramid

```
        ┌──────────────────┐
        │    E2E Tests      │  ← Playwright (critical user flows)
        │   (fewest, slow)  │
        └──────────────────┘
       ┌────────────────────┐
       │ Integration Tests  │  ← API tests, DB tests
       │  (medium, medium)  │
       └────────────────────┘
      ┌──────────────────────┐
      │    Unit Tests        │  ← Services, utils, components
      │ (most, fast, cheap)  │
      └──────────────────────┘
```

Target coverage: **≥ 80%** for all new code. Critical paths: **≥ 95%**.

---

## Frontend Testing (React / Next.js)

### Tools
- **Vitest** — test runner (fast, Vite-native)
- **React Testing Library (RTL)** — component testing
- **@testing-library/user-event** — realistic user interactions
- **MSW (Mock Service Worker)** — API mocking

### File Naming
```
component.tsx          → component.test.tsx
hooks/useCart.ts       → hooks/useCart.test.ts
utils/format.ts        → utils/format.test.ts
```

### Component Test Pattern
```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OrderCard } from './OrderCard';

describe('OrderCard', () => {
  it('displays order status correctly', () => {
    render(<OrderCard order={mockOrder} />);
    expect(screen.getByText('CONFIRMED')).toBeInTheDocument();
  });

  it('calls onCancel when cancel button clicked', async () => {
    const onCancel = vi.fn();
    render(<OrderCard order={mockOrder} onCancel={onCancel} />);
    
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalledWith(mockOrder.id);
  });
});
```

### RTL Rules
- Query by **role** first (`getByRole`) — most resilient to refactors
- Use `getByText` for visible text, `getByLabelText` for form fields
- NEVER query by CSS class or internal implementation details
- NEVER test implementation — test user behavior
- Use `screen` from RTL for all queries (not destructured from `render`)

### What to Test (Frontend)
- All rendering states: loading, error, empty, success, pagination
- User interactions: clicks, form submissions, keyboard navigation
- Conditional rendering: role-based UI, feature flags
- Error boundaries and fallback UIs
- Custom hooks (use `renderHook`)

---

## Backend Testing (NestJS)

### Tools
- **Jest** — test runner (NestJS default)
- **Supertest** — HTTP endpoint testing
- **@prisma/client` mock** — database mocking

### File Naming
```
orders.service.ts         → orders.service.spec.ts
orders.controller.ts      → orders.controller.spec.ts
orders.repository.ts      → orders.repository.spec.ts
```

### Unit Test Pattern (Service)
```typescript
describe('OrdersService', () => {
  let service: OrdersService;
  let prisma: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: PrismaService, useValue: mockDeep<PrismaClient>() },
      ],
    }).compile();

    service = module.get(OrdersService);
    prisma = module.get(PrismaService);
  });

  it('should throw NotFoundException if order does not exist', async () => {
    prisma.order.findUnique.mockResolvedValue(null);
    await expect(service.findOne('non-existent-id')).rejects.toThrow(NotFoundException);
  });
});
```

### Integration Test Pattern (Controller)
```typescript
describe('OrdersController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = module.createNestApplication();
    await app.init();
  });

  it('GET /orders/:id returns 404 for missing order', () => {
    return request(app.getHttpServer())
      .get('/orders/non-existent')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(404)
      .expect(res => expect(res.body.message).toBe('Order not found'));
  });
});
```

### What to Test (Backend)
- All service methods: happy path + all error paths
- NotFoundException, ForbiddenException, ConflictException scenarios
- All DTO validation rules (invalid input rejection)
- Business rule enforcement (e.g., cannot cancel order in PREPARING state)
- Authentication guard behavior

---

## E2E Testing (Playwright)

### When to Write E2E
- Critical user flows: registration, login, order placement, payment, checkout
- Subscription management
- Admin operations (order management, user management)

### Playwright Setup
```typescript
import { test, expect } from '@playwright/test';

test('customer can place an order', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByLabel('Email').fill('test@example.com');
  await page.getByLabel('Password').fill('password123');
  await page.getByRole('button', { name: 'Sign In' }).click();
  
  await expect(page).toHaveURL('/dashboard');
  
  await page.getByText('Mumbai Biryani House').click();
  await page.getByRole('button', { name: 'Add to Cart' }).first().click();
  await page.getByRole('link', { name: 'Cart' }).click();
  await page.getByRole('button', { name: 'Place Order' }).click();
  
  await expect(page.getByText('Order Confirmed')).toBeVisible();
});
```

### E2E Coverage Targets
- Customer: Browse → Cart → Checkout → Track
- Auth: Register, Login, Logout, Password Reset
- Admin: View orders, Update status, Manage users
- Partner: View orders, Update menu availability

---

## Quality Gates

Before marking any task complete:

```bash
# Run all affected tests
pnpm nx affected:test

# Run specific app tests
pnpm nx test web
pnpm nx test api

# Run E2E (when available)
pnpm nx e2e web-e2e

# Check coverage
pnpm nx test api --coverage
```

**All tests must pass before PR creation.**

---

## Anti-Patterns

- ❌ Tests with `// TODO: add tests`
- ❌ Mocking the thing you're testing (mock dependencies, not the SUT)
- ❌ Tests that only test `expect(true).toBe(true)`
- ❌ Snapshot tests as a substitute for meaningful assertions
- ❌ `it.skip()` without a linked issue
- ❌ Tests that depend on test execution order
- ❌ Not testing the unhappy path (errors, empty states, forbidden access)

