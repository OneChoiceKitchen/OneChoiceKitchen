---
name: tiffin-subscriptions
description: >
  Tiffin meal subscription system for OneChoiceKitchen. Covers subscription lifecycle,
  plans, pricing, pause/resume, delivery schedule, admin management, and billing.
  Trigger when: implementing tiffin features, subscription management,
  delivery calendar, pause/resume flows, or tiffin pricing.
---

# Tiffin Subscriptions Skill

## Business Rules

1. **Plans**: Daily, Weekly, Monthly
2. **Meal types**: Lunch, Dinner, or Both
3. **Delivery window**: 7:00 AM - 12:00 PM (Lunch), 6:00 PM - 9:00 PM (Dinner)
4. **Min subscription**: 5 consecutive days
5. **Pause**: Allowed up to 3 times/month, min 1 day advance notice
6. **Cancel**: Full refund if cancelled 24h before start, pro-rated after
7. **Skip meal**: Allowed up to 2 times/week with 6h advance notice

## Prisma Models

```prisma
model TiffinPlan {
  id           String @id @default(cuid())
  name         String  // "Basic Thali", "Premium Thali"
  description  String
  pricePerMeal Decimal
  planType     PlanType // DAILY | WEEKLY | MONTHLY
  mealTypes    MealType[] // LUNCH | DINNER
  branchId     String
  branch       Branch @relation(...)
  isActive     Boolean @default(true)
}

model TiffinSubscription {
  id         String @id @default(cuid())
  userId     String
  planId     String
  status     SubStatus // ACTIVE | PAUSED | CANCELLED | EXPIRED
  startDate  DateTime
  endDate    DateTime
  mealType   MealType
  deliveries TiffinDelivery[]
}

model TiffinDelivery {
  id             String @id @default(cuid())
  subscriptionId String
  scheduledDate  DateTime
  status         DeliveryStatus // SCHEDULED | SKIPPED | DELIVERED | PAUSED
  riderId        String?
}
```

## API Endpoints

```
GET    /api/tiffin/plans              # List available plans
POST   /api/tiffin/subscribe          # Create subscription
GET    /api/tiffin/my-subscriptions   # Customer's subscriptions
PATCH  /api/tiffin/:id/pause          # Pause subscription
PATCH  /api/tiffin/:id/resume         # Resume subscription
PATCH  /api/tiffin/:id/skip           # Skip a delivery
DELETE /api/tiffin/:id                # Cancel subscription
```

## Admin Operations

- Manage plans: `apps/admin/admin-portal/src/app/pages/TiffinAdmin.tsx`
- Route: `case 'tiffin': return <TiffinAdmin />;`

## Partner Operations  

- View and prepare tiffin orders
- Rider pickup management
- File: `apps/partner/partner-portal/src/app/TiffinManagementAdmin.tsx`

## Pricing Formula

```typescript
const totalPrice = (pricePerMeal * mealsPerDay * totalDays) * (1 - planDiscount);
// planDiscount: 0% daily, 5% weekly, 15% monthly
```

## Delivery Scheduling

```typescript
// Auto-generate delivery records when subscription is created
async function scheduleDeliveries(subscription: TiffinSubscription) {
  const dates = getWorkingDays(subscription.startDate, subscription.endDate);
  await prisma.tiffinDelivery.createMany({
    data: dates.map(date => ({
      subscriptionId: subscription.id,
      scheduledDate: date,
      status: 'SCHEDULED',
    }))
  });
}
```
