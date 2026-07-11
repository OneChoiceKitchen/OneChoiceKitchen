---
name: coding-standards
description: >
  OneChoiceKitchen coding standards for TypeScript, React, Next.js, NestJS,
  and Prisma. Covers naming conventions, file organization, component patterns,
  hook patterns, API patterns, and database patterns.
---

# Coding Standards

## TypeScript Standards

### Naming Conventions

| Construct | Convention | Example |
|-----------|-----------|---------|
| Files | `kebab-case` | `order-service.ts` |
| Classes | `PascalCase` | `OrderService` |
| Interfaces | `PascalCase` (no `I` prefix) | `OrderResponse` |
| Types | `PascalCase` | `OrderStatus` |
| Enums | `PascalCase`, values `UPPER_SNAKE` | `OrderStatus.PENDING` |
| Functions | `camelCase` | `calculateDeliveryFee()` |
| Variables | `camelCase` | `const orderTotal` |
| Constants | `UPPER_SNAKE_CASE` | `MAX_CART_ITEMS = 20` |
| React Components | `PascalCase` | `OrderCard` |
| React Hooks | `camelCase` starting with `use` | `useOrderStatus` |
| Event Handlers | `handle` prefix | `handleOrderCancel` |

### Type Rules
```typescript
// ❌ No any
const data: any = apiResponse;

// ✅ Use specific types or unknown + narrowing
const data: OrderResponse = apiResponse;
// or
const data = apiResponse as unknown;
if (isOrderResponse(data)) { ... }

// ✅ Prefer interface for object shapes
interface CreateOrderDto {
  restaurantId: string;
  items: OrderItemDto[];
  deliveryAddressId: string;
}

// ✅ Prefer type for unions and computed types
type OrderStatus = 'PENDING' | 'CONFIRMED' | 'DELIVERED';
type OrderWithItems = Order & { items: OrderItem[] };
```

---

## React / Next.js Standards

### Component Patterns

**File structure** (one component per file):
```typescript
// OrderCard.tsx
import type { FC } from 'react';

interface OrderCardProps {
  order: Order;
  onCancel?: (orderId: string) => void;
}

export const OrderCard: FC<OrderCardProps> = ({ order, onCancel }) => {
  const handleCancel = () => {
    onCancel?.(order.id);
  };

  return (
    <div role="article" aria-label={`Order ${order.id}`}>
      {/* component JSX */}
    </div>
  );
};
```

### Hook Patterns
```typescript
// useOrderStatus.ts — data-fetching hook
export function useOrderStatus(orderId: string) {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchOrder(orderId)
      .then(setOrder)
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, [orderId]);

  return { order, isLoading, error };
}
```

### Next.js App Router Patterns
```typescript
// app/orders/[id]/page.tsx — Server Component (default)
export default async function OrderPage({ params }: { params: { id: string } }) {
  const order = await getOrder(params.id); // Server-side data fetch
  return <OrderDetail order={order} />;
}

// Mark as Client Component only when needed
'use client';
export function OrderTracker({ orderId }: { orderId: string }) {
  // Client-only code: useState, useEffect, event handlers
}
```

**Rules**:
- Use Server Components by default (no `'use client'`)
- `'use client'` only for: useState, useEffect, event handlers, browser APIs
- Use `loading.tsx` for Suspense boundaries
- Use `error.tsx` for error boundaries
- Server Actions for form submissions (not API routes)

---

## NestJS Standards

### Module Structure
```typescript
// orders.module.ts
@Module({
  imports: [PrismaModule, RedisModule],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersRepository],
  exports: [OrdersService],
})
export class OrdersModule {}
```

### Controller Pattern
```typescript
// orders.controller.ts
@ApiTags('orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  @ApiCreatedResponse({ type: OrderResponseDto })
  async create(
    @Body() dto: CreateOrderDto,
    @CurrentUser() user: AuthUser,
  ): Promise<OrderResponseDto> {
    return this.ordersService.create(dto, user.id);
  }
}
```

### DTO Pattern
```typescript
// create-order.dto.ts
export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Restaurant ID' })
  restaurantId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  @ApiProperty({ type: [OrderItemDto] })
  items: OrderItemDto[];
}
```

---

## Prisma Standards

### Schema Conventions
```prisma
model Order {
  id          String      @id @default(cuid())
  status      OrderStatus @default(PENDING)
  totalAmount Decimal     @db.Decimal(10, 2)
  
  // Timestamps (always include)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  
  // Relations
  userId      String
  user        User        @relation(fields: [userId], references: [id])
  
  @@map("orders")  // snake_case table names
}

enum OrderStatus {
  PENDING
  CONFIRMED
  DELIVERED
  CANCELLED
}
```

### Query Patterns
```typescript
// Always select only needed fields
const orders = await this.prisma.order.findMany({
  where: { userId, status: { not: 'CANCELLED' } },
  select: {
    id: true,
    status: true,
    totalAmount: true,
    createdAt: true,
    restaurant: {
      select: { name: true, logo: true }
    }
  },
  orderBy: { createdAt: 'desc' },
  take: 20,
  skip: page * 20,
});
```

---

## File Organization

```
apps/api/src/
  modules/
    orders/
      dto/                    # Input/Output DTOs
      entities/               # Database entity definitions
      tests/                  # .spec.ts files
      orders.module.ts
      orders.controller.ts
      orders.service.ts
      orders.repository.ts    # All DB queries here

apps/web/
  app/                        # Next.js App Router
    (auth)/                   # Route group
      login/
        page.tsx
  components/
    orders/                   # Feature-scoped components
      OrderCard.tsx
      OrderCard.test.tsx
  hooks/
    useOrderStatus.ts
  lib/
    api/                      # API client functions
```

---

## Import Order

```typescript
// 1. React/framework imports
import { useState, useEffect } from 'react';
import type { NextPage } from 'next';

// 2. Third-party libraries
import { z } from 'zod';
import clsx from 'clsx';

// 3. Internal absolute imports (@org/...)
import { OrderService } from '@onechoice/api-client';
import type { Order } from '@onechoice/shared/types';

// 4. Relative imports (closest last)
import { OrderCard } from '../components/OrderCard';
import { useOrderStatus } from './useOrderStatus';
```

