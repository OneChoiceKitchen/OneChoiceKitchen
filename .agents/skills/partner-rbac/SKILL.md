---
name: partner-rbac
description: >
  Partner RBAC and delete approval workflow for OneChoiceKitchen.
  Load when implementing partner portal access control, permission matrices,
  or delete approval flows. Covers Prisma models, NestJS API, and Admin UI.
---

# Partner RBAC Skill

## Overview

OneChoiceKitchen uses a **granular feature-level permission system** for partner portals.
Admin controls which features each partner can access. Partners can only CRUD their own data.
Deletions always require Admin approval before executing.

## Architecture

```
Admin Portal → PartnerPermissionsAdmin page
  → POST /api/admin/partner-permissions/:partnerId   (bulk-set features)
  → GET  /api/admin/partner-permissions/:partnerId   (read features)
  → POST /api/admin/partner-permissions/delete-requests/:id/approve
  → POST /api/admin/partner-permissions/delete-requests/:id/reject

Partner Portal → on login: GET /api/partner/my-permissions
  → Partner reads permissions and conditionally renders only allowed modules
  → Deletions: POST /api/partner/delete-requests  (no direct delete)
```

## Prisma Models

| Model | Purpose |
|-------|---------|
| `PartnerFeaturePermission` | `(partnerId, module, feature, isEnabled)` unique per partner+module+feature |
| `PartnerDeleteRequest` | `(partnerId, module, entity, entityId, status)` PENDING→APPROVED→REJECTED |

## Modules & Features

```typescript
const PARTNER_MODULES = [
  { id: 'food_ordering', features: ['fo_orders','fo_menu','fo_inventory','fo_delivery','fo_offers','fo_coupons'] },
  { id: 'tiffin',        features: ['tf_subs','tf_delivery','tf_plans','tf_terms'] },
  { id: 'dining',        features: ['di_tables','di_reservations','di_waitlist'] },
  { id: 'hall_party',    features: ['hp_venues','hp_packages','hp_bookings'] },
  { id: 'hrms',          features: ['hr_staff','hr_attendance','hr_kiosk'] },
  { id: 'marketing',     features: ['mk_offers','mk_coupons','mk_rewards'] },
  { id: 'analytics',     features: ['an_revenue','an_orders','an_customer'] },
  { id: 'finance',       features: ['fi_earnings','fi_payouts'] },
]
```

## NestJS Files

- `apps/api/src/partner-permissions/partner-permissions.service.ts`
- `apps/api/src/partner-permissions/partner-permissions.controller.ts`
- `apps/api/src/partner-permissions/partner-permissions.module.ts`

## Admin UI

- `apps/admin/admin-portal/src/app/pages/PartnerPermissionsAdmin.tsx`
- Route ID: `partner_permissions` (in Administration category)

## Rules

1. **Data Scoping**: All partner API queries MUST filter by `partnerId` = `req.user.id`.
2. **No Direct Deletes**: Partners call `POST /api/partner/delete-requests`. Admin approves.
3. **Check Permissions**: Before rendering any partner feature, call `hasFeature(partnerId, module, feature)`.
4. **Admin Only**: Permission management endpoints use `JwtAuthGuard` + admin role check.

## Partner Portal Usage

```typescript
// In partner portal app.tsx - on auth load
const [permissions, setPermissions] = useState([]);
useEffect(() => {
  fetch('/api/partner/my-permissions', { headers: authH() })
    .then(r => r.json())
    .then(d => setPermissions(d));
}, []);

const can = (module: string, feature: string) =>
  permissions.some(p => p.module === module && p.feature === feature && p.isEnabled);

// Conditional rendering:
{can('food_ordering', 'fo_orders') && <OrdersSection />}
{can('marketing', 'mk_coupons') && <CouponsSection />}
```
