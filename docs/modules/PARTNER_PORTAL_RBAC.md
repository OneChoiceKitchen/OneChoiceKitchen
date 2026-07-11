# Partner Portal RBAC — Module Documentation

> **Last Updated**: 2026-07-09  
> **Owner**: Platform Team

---

## Overview

The Partner Portal uses a **granular, admin-controlled permission system**. Each partner is granted access to specific modules and features. Partners can only see and modify their **own data** (scoped by `partnerId`). Deletions require **Admin approval**.

---

## Available Modules & Features

| Module | ID | Features |
|--------|----|---------|
| Food Ordering | `food_ordering` | View Orders, Menu Builder, Inventory, Delivery Settings, Offers & Discounts, Coupons |
| Mess / Tiffin | `tiffin` | Subscriptions, Delivery Tracking, Meal Plans, Terms & Policies |
| Dining | `dining` | Tables, Reservations, Waitlist |
| Hall / Party | `hall_party` | Venues, Packages, Bookings |
| HRMS | `hrms` | Staff Management, Attendance, ESS Kiosk |
| Marketing | `marketing` | Own Offers, Own Coupons, Rewards |
| Analytics | `analytics` | Revenue Reports, Order Analytics, Customer Insights |
| Finance | `finance` | Earnings View, Payout History |

---

## Permission Management (Admin)

### Admin Panel Path
`Admin → Administration → Partner Permissions`

### What Admin Can Do
1. Select any partner from the left panel
2. Toggle modules On/Off (enables/disables all features in that module)
3. Toggle individual features within a module
4. Click **Save Permissions** to persist
5. Review and approve/reject partner delete requests in the **Delete Approvals** tab

---

## Data Scoping Rules

All partner-facing API endpoints MUST enforce:

```typescript
// ❌ WRONG — returns data from all partners
const offers = await prisma.offer.findMany();

// ✅ CORRECT — scoped to logged-in partner
const offers = await prisma.offer.findMany({
  where: { restaurantId: req.user.restaurantId }
});
```

Partner users are identified by `req.user.id` and `req.user.restaurantId` (set during JWT authentication).

---

## Delete Approval Workflow

```
Partner clicks "Delete" button
       ↓
POST /api/partner/delete-requests
  { module, entity, entityId, reason }
       ↓
PartnerDeleteRequest created (status=PENDING)
       ↓
Admin sees in Partner Permissions → Delete Approvals tab
       ↓
Admin clicks "Approve" or "Reject"
       ↓
If APPROVED: entity is actually deleted from DB
If REJECTED: entity remains, request closed
       ↓
Partner portal should poll or subscribe to status updates
```

---

## Partner Portal Implementation Guide

### 1. On Login — Load Permissions

```typescript
// In partner portal auth flow
const loadPermissions = async () => {
  const res = await fetch('/api/partner/my-permissions', { headers: authH() });
  const perms = await res.json();
  // Store in state or context
  setPermissions(perms);
};
```

### 2. Conditional Rendering

```typescript
const can = (module: string, feature: string) =>
  permissions.some(p => p.module === module && p.feature === feature && p.isEnabled);

// Usage:
{can('food_ordering', 'fo_orders') && <OrdersSection />}
{can('food_ordering', 'fo_menu')   && <MenuBuilder />}
{can('marketing', 'mk_coupons')    && <CouponsSection />}
```

### 3. Requesting Deletes

```typescript
const requestDelete = async (entity: string, entityId: string, reason: string) => {
  const res = await fetch('/api/partner/delete-requests', {
    method: 'POST',
    headers: authH(),
    body: JSON.stringify({ module: 'food_ordering', entity, entityId, reason }),
  });
  if (res.ok) {
    toast('Delete request submitted — awaiting admin approval');
  }
};
```

---

## API Endpoints

### Admin Endpoints (require admin JWT)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/admin/partner-permissions/:partnerId` | Get all permissions for a partner |
| `POST` | `/api/admin/partner-permissions/:partnerId` | Bulk-set permissions `{ permissions: [...] }` |
| `GET` | `/api/admin/partner-permissions/delete-requests?status=PENDING` | List delete requests |
| `POST` | `/api/admin/partner-permissions/delete-requests/:reqId/approve` | Approve a delete |
| `POST` | `/api/admin/partner-permissions/delete-requests/:reqId/reject` | Reject a delete |

### Partner Endpoints (require partner JWT)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/partner/my-permissions` | Own permissions |
| `POST` | `/api/partner/delete-requests` | Submit delete request |

---

## Prisma Models Reference

```prisma
model PartnerFeaturePermission {
  id          String   @id @default(uuid())
  partnerId   String
  module      String
  feature     String
  isEnabled   Boolean  @default(false)
  grantedById String?
  grantedAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  @@unique([partnerId, module, feature])
  @@index([partnerId])
}

model PartnerDeleteRequest {
  id           String    @id @default(uuid())
  partnerId    String
  module       String
  entity       String
  entityId     String
  reason       String?
  status       String    @default("PENDING")
  reviewedById String?
  reviewedAt   DateTime?
  requestedAt  DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  @@index([partnerId])
  @@index([status])
}
```

---

## NestJS Files

| File | Purpose |
|------|---------|
| `apps/api/src/partner-permissions/partner-permissions.service.ts` | Core business logic |
| `apps/api/src/partner-permissions/partner-permissions.controller.ts` | REST endpoints |
| `apps/api/src/partner-permissions/partner-permissions.module.ts` | NestJS module |

---

## Admin UI Files

| File | Purpose |
|------|---------|
| `apps/admin/admin-portal/src/app/pages/PartnerPermissionsAdmin.tsx` | Admin management UI |

Route: `partner_permissions` (in **Administration** category in Explore Workspace)
