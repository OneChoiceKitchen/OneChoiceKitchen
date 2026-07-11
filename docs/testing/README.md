# Testing Guide

## Overview

Every feature, bug fix, or refactor MUST include automated tests. No manual-only testing is acceptable.

## Testing Stack

| Layer | Tool | Purpose |
|-------|------|---------|
| Unit tests | **Vitest** (frontend) / **Jest** (NestJS) | Pure function tests |
| Component tests | **React Testing Library** | UI component behavior |
| API tests | **Jest + Supertest** | Endpoint integration tests |
| E2E tests | **Playwright** | Full user flow automation |

---

## Running Tests

```bash
# Run all affected tests
pnpm nx affected:test

# Run tests for a specific project
pnpm nx test api
pnpm nx test web
pnpm nx test admin-portal

# Run with coverage
pnpm nx test api --coverage

# Run E2E tests
pnpm nx e2e web-e2e
pnpm nx e2e api-e2e

# Watch mode (development)
pnpm nx test api --watch
```

---

## NestJS API Testing

### Unit Test Example (Service)

```typescript
// orders.service.spec.ts
import { Test } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { PrismaService } from '../prisma/prisma.service';

describe('OrdersService', () => {
  let service: OrdersService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: PrismaService, useValue: { order: { create: jest.fn(), findMany: jest.fn() } } },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('creates an order', async () => {
    const mockOrder = { id: '1', status: 'PENDING', totalAmount: 500 };
    (prisma.order.create as jest.Mock).mockResolvedValue(mockOrder);
    
    const result = await service.createOrder({ userId: 'u1', items: [] });
    expect(result.status).toBe('PENDING');
  });
});
```

### Controller Test (Supertest)

```typescript
// orders.controller.spec.ts
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';

describe('OrdersController (e2e)', () => {
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    // Create test app
    token = await loginAsTestUser(app);
  });

  it('GET /api/orders returns 200', () => {
    return request(app.getHttpServer())
      .get('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect(res => expect(res.body).toHaveProperty('data'));
  });

  it('GET /api/orders returns 401 without token', () => {
    return request(app.getHttpServer())
      .get('/api/orders')
      .expect(401);
  });
});
```

---

## React Component Testing

```typescript
// OrderCard.test.tsx
import { render, screen, userEvent } from '@testing-library/react';
import { OrderCard } from './OrderCard';

const mockOrder = {
  id: 'ORD-123',
  status: 'PENDING',
  totalAmount: 520,
  customer: { name: 'Amit Kumar' }
};

describe('OrderCard', () => {
  it('renders order ID and customer name', () => {
    render(<OrderCard order={mockOrder} />);
    expect(screen.getByText('ORD-123')).toBeInTheDocument();
    expect(screen.getByText('Amit Kumar')).toBeInTheDocument();
  });

  it('calls onConfirm when button is clicked', async () => {
    const onConfirm = jest.fn();
    render(<OrderCard order={mockOrder} onConfirm={onConfirm} />);
    await userEvent.click(screen.getByRole('button', { name: /confirm/i }));
    expect(onConfirm).toHaveBeenCalledWith('ORD-123');
  });
});
```

---

## E2E Testing (Playwright)

```typescript
// web-e2e/src/order-flow.spec.ts
import { test, expect } from '@playwright/test';

test('customer can place an order', async ({ page }) => {
  // 1. Login
  await page.goto('http://localhost:4208');
  await page.fill('[data-testid="email"]', 'customer@test.com');
  await page.fill('[data-testid="password"]', 'test123');
  await page.click('[data-testid="login-btn"]');

  // 2. Navigate to menu
  await page.click('text=Browse Menu');
  await expect(page).toHaveURL(/\/menu/);

  // 3. Add item to cart
  await page.click('[data-testid="add-to-cart-btn"]:first-child');
  await expect(page.locator('[data-testid="cart-count"]')).toHaveText('1');

  // 4. Checkout
  await page.click('[data-testid="checkout-btn"]');
  await expect(page.locator('[data-testid="order-confirmation"]')).toBeVisible();
});
```

---

## Coverage Requirements

| Layer | Minimum Coverage |
|-------|----------------|
| API services | 80% |
| API controllers | 70% |
| Shared libs | 85% |
| Critical paths (auth, payments, orders) | 90% |

```bash
# Check coverage
pnpm nx test api --coverage
# Coverage report: coverage/lcov-report/index.html
```

---

## CI Test Commands

```yaml
# GitHub Actions (.github/workflows/ci.yml)
- run: pnpm nx affected:test --parallel=3
- run: pnpm nx affected:lint
- run: pnpm nx affected:build
- run: pnpm nx e2e api-e2e --headless
```
