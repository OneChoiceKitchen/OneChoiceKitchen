---
name: ui-ux
description: >
  UI/UX principles and patterns for OneChoiceKitchen. Covers user flows for
  ordering, navigation patterns, feedback states, error handling, and
  food delivery-specific UX best practices. Also documents the Azure Portal-inspired
  admin portal design language with Blue+Red brand identity. Load when building
  any UI across admin, web, partner, or rider portals.
---

# UI/UX Standards

## Admin Portal Design Language

**Inspiration:** Microsoft Azure Portal  
**Brand:** Blue (#2563EB) + Red (#DC2626)  
**Key traits:** Clean white surfaces, `#f3f4f8` background, compact table-centric UI,
sticky headers, consistent page padding via `.page-container`.

### Page Structure Pattern (all admin module pages)
```
page-container
  ├── page-header
  │     ├── page-title-block (title + subtitle)
  │     └── page-actions (buttons)
  ├── filter-bar (search + selects)
  └── table-wrapper / card grid
```

### Interactive Element Rules
- **Buttons:** `btn-primary` (Blue) for create/save; `btn-danger` (Red) for delete/cancel
- **Table hover:** Rows highlight with `--brand-blue-lt` (#eff6ff)
- **Focus rings:** Always `--brand-blue` at 3px `0 0 0 3px rgba(37,99,235,.1)`
- **Notification badge:** Brand Red (urgency)
- **Form validation error:** Brand Red text + border
- **Success state:** `--green` (#16a34a)


1. **Speed above all** — food delivery is time-sensitive. Every screen must load fast.
2. **Trust signals** — ratings, photos, and delivery time estimates are critical
3. **Reduce friction** — minimize steps between "hungry" and "order placed"
4. **Clear status** — users must always know what's happening with their order
5. **Mobile-first** — majority of users are on mobile

---

## Key User Flows

### Customer Ordering Flow (Optimize This)
```
Home → Search/Browse → Restaurant → Menu → Cart → Address → Payment → Confirmation
```
Target: < 5 taps from restaurant discovery to order placement.

### Order Tracking Flow
- Real-time status updates (WebSocket)
- Show rider location on map when assigned
- Estimated delivery time prominently displayed
- One-tap contact rider button

### Partner Portal Flow
- New orders appear immediately with audio alert
- Accept/reject within 30 seconds (auto-reject if missed)
- Clear prep time selector
- Order queue view (sorted by pickup time)

---

## Loading States

Every async operation must show appropriate loading UI:

```tsx
// Skeleton loading (preferred over spinners for content)
function RestaurantCardSkeleton() {
  return (
    <div className="restaurant-card animate-pulse">
      <div className="h-48 bg-gray-200 rounded" />
      <div className="p-4">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
      </div>
    </div>
  );
}

// Spinner for actions (add to cart, place order)
<button disabled={isLoading}>
  {isLoading ? <Spinner size="sm" /> : 'Add to Cart'}
</button>
```

## Error States

Every error must:
1. Be visible and clearly communicate what went wrong
2. Offer a recovery action
3. NOT expose technical details to users

```tsx
function OrderError({ onRetry }: { onRetry: () => void }) {
  return (
    <div role="alert" className="error-state">
      <AlertCircle aria-hidden="true" />
      <h2>Order Failed</h2>
      <p>We couldn't place your order. Your payment was not charged.</p>
      <button onClick={onRetry}>Try Again</button>
    </div>
  );
}
```

## Empty States

Never show a blank page. All empty states need:
- Illustration or icon
- Descriptive message
- Call to action

```tsx
function EmptyOrderHistory() {
  return (
    <div className="empty-state">
      <ShoppingBag size={48} className="text-gray-400" />
      <h2>No orders yet</h2>
      <p>When you place your first order, it will appear here.</p>
      <Link href="/restaurants">
        <button>Order Now</button>
      </Link>
    </div>
  );
}
```

## Toast Notifications (In-App)

- Success: Green, 3 seconds, top-right
- Error: Red, 5 seconds, persistent (has close button)
- Info: Blue, 4 seconds
- Never more than 2 toasts at once

```tsx
toast.success('Order placed! Estimated delivery: 35 min');
toast.error('Payment failed. Please check your card details.');
```

## Mobile-Specific UX

- Touch targets: minimum 44x44px
- Bottom navigation bar for primary app sections
- Swipe gestures for common actions (swipe to dismiss)
- One-handed reachability: important actions in bottom third of screen
- Safe area insets respected (iOS notch)

## Form Design

- Always show real-time validation (not just on submit)
- Required fields marked clearly
- Success confirmation after form submission
- Preserve form state on navigation (don't lose draft orders)
- OTP input auto-focuses next field

## Performance UX

- Show content as it loads (streaming) — not blank → full content
- Optimistic UI for cart operations (instant feedback)
- Store recent searches and addresses for fast re-order

