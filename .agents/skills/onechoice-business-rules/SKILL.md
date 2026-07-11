---
name: onechoice-business-rules
description: >
  OneChoiceKitchen domain business rules. Load SECOND on every task.
  Documents order lifecycle, cart rules, pricing, delivery, subscriptions,
  cancellations, refunds, and role permissions. Never violate these rules.
---

# OneChoiceKitchen Business Rules

## User Roles & Permissions

| Role | Description | Key Permissions |
|------|-------------|-----------------|
| `CUSTOMER` | End user placing orders | Browse, order, track, review |
| `PARTNER` | Restaurant/kitchen owner | Manage menu, view orders, update status |
| `RIDER` | Delivery person | Accept/decline delivery, update location |
| `ADMIN` | Platform operations | Full access except financial reports |
| `SUPER_ADMIN` | Engineering/Finance | Full access + financial data |
| `SUPPORT` | Customer support | View all, limited edit |

---

## User Journeys

### Customer Order Journey
```
1. Browse restaurants/menus (unauthenticated)
2. Add items to cart (requires login)
3. Select delivery address
4. Apply coupon/offer
5. Choose payment method
6. Place order → Payment capture
7. Real-time order tracking
8. Delivery confirmation → Review
```

### Restaurant Partner Journey
```
1. Register restaurant (requires KYC)
2. Setup menu (categories, items, pricing, availability)
3. Receive orders (notification + portal)
4. Accept/Reject within 5 minutes
5. Update preparation status
6. Hand off to rider
7. View daily/weekly settlement
```

### Rider Journey
```
1. Go online (GPS active)
2. Receive delivery assignment (nearest rider algorithm)
3. Accept/Decline (auto-reassign after 30s timeout)
4. Pick up from restaurant
5. Deliver to customer
6. Confirm delivery (photo proof or OTP)
7. Earnings updated
```

---

## Order Lifecycle

```
PENDING         → Customer placed, payment pending
PAYMENT_FAILED  → Payment capture failed (terminal)
CONFIRMED       → Payment captured, sent to restaurant
ACCEPTED        → Restaurant accepted preparation
REJECTED        → Restaurant rejected (triggers refund + reassignment)
PREPARING       → Kitchen actively preparing
READY           → Food ready, awaiting rider pickup
PICKED_UP       → Rider has collected the order
OUT_FOR_DELIVERY→ Rider en route to customer
DELIVERED       → Confirmed delivery (terminal success)
CANCELLED       → Cancelled by customer/admin (triggers refund flow)
```

### Key Rules
- Orders in `CONFIRMED` or later state CANNOT be modified by customer
- Restaurant must accept/reject within **5 minutes** of `CONFIRMED`
- Auto-accept enabled restaurants skip the `ACCEPTED` state
- If restaurant rejects, a new restaurant must be found OR customer refunded fully

---

## Cart Rules

- One cart per user (persisted in Redis, expires after 24 hours)
- Items from **different restaurants** can coexist in cart (multi-restaurant cart)
- Max items per order: configurable (default: 20 unique items, 99 quantity each)
- Out-of-stock items auto-removed from cart on checkout validation
- Prices are locked at **time of checkout**, not time of add-to-cart
- Applied coupons validated fresh at checkout — may be invalidated
- Minimum order value enforced per restaurant (configurable)
- Delivery fee calculated at checkout based on distance + surge

---

## Restaurant Rules

- Restaurants must have an **approved KYC** before going live
- Menu items must have at least: name, price, category, image
- Restaurant availability windows: lunch (11am–3pm), dinner (6pm–11pm), or custom
- Auto-deactivate if: zero inventory, rating below 2.0 for 7 days, KYC expired
- Price changes take effect **immediately** (existing confirmed orders not affected)
- Menu categorized as: Vegetarian, Non-Vegetarian, Vegan, Jain — mandatory labeling

---

## Delivery Rules

- Delivery radius configurable per restaurant (default: 10km)
- Delivery fee formula: `base_fee + (distance_km × per_km_rate) + surge_multiplier`
- Surge multiplier applies during peak hours (12–2pm, 7–9pm) or bad weather
- Free delivery for: orders above threshold, subscription customers, promotional periods
- Max delivery time SLA: 45 minutes (within 5km), 60 minutes (5–10km)
- If SLA breached by >15 min without customer consent → partial refund triggered

---

## Pricing Rules

- All prices inclusive of GST (displayed to customer)
- Platform commission: configurable per restaurant (default: 18%)
- GST on food: 5% (standard), 12% (premium/AC restaurants)
- GST on delivery: 18%
- Discounts applied in order: Platform Offer → Restaurant Offer → Loyalty Points → Coupon
- Maximum discount cap: 60% of cart value (prevents abuse)

---

## Subscription Rules

- Plans: Daily, Weekly, Monthly
- Delivery days: configurable (Mon–Fri, Mon–Sat, or all 7 days)
- Pause: allowed up to 7 days per month, requires 24h advance notice
- Resume: automatic on end date, or manual
- Upgrade/Downgrade: applies from next billing cycle
- Cancellation: within 24h of purchase → full refund; after that → prorated
- Skipped deliveries: credited to wallet (not refunded directly)

---

## Cancellation Rules

| Scenario | Who Can Cancel | Refund |
|----------|---------------|--------|
| Before CONFIRMED | Customer | 100% |
| After CONFIRMED, before ACCEPTED | Customer | 100% (restaurant not started) |
| After ACCEPTED | Customer | 0–50% (restaurant may have started) |
| Restaurant rejects | System | 100% |
| PREPARING or later | Customer | 0% (food being made) |
| Admin cancel (any stage) | Admin | 100% + compensation credit |

---

## Refund Rules

- Refunds processed within **5–7 business days** to original payment method
- Wallet refunds are instant
- COD orders: no refund to source; wallet credit issued
- Razorpay refund API called for card/UPI/netbanking
- Refund triggers automatic inventory re-check
- Disputes resolved within 14 days

---

## Notification Triggers

| Event | Customer | Partner | Rider | Admin |
|-------|----------|---------|-------|-------|
| Order placed | ✅ | ✅ | - | - |
| Order accepted | ✅ | - | - | - |
| Order rejected | ✅ | - | - | ✅ |
| Rider assigned | ✅ | - | ✅ | - |
| Rider picked up | ✅ | - | - | - |
| Order delivered | ✅ | - | ✅ | - |
| Refund issued | ✅ | - | - | - |
| Subscription renewal | ✅ | - | - | - |
| SLA breach alert | - | - | - | ✅ |

---

## Anti-Patterns (Never Do)

- Never expose another customer's order data through an API response
- Never allow a customer to modify an order in `PREPARING` or later state
- Never process a payment without verifying cart total server-side
- Never skip KYC validation for a restaurant going live
- Never delete an order — use status transitions only (audit trail)
- Never charge delivery fee twice (idempotency required on all payment calls)

