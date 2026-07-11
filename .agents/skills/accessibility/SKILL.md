---
name: accessibility
description: >
  WCAG 2.1 AA accessibility standards for OneChoiceKitchen frontends.
  Apply on every UI component. Covers keyboard navigation, screen readers,
  color contrast, ARIA roles, and accessible forms.
---

# Accessibility Standards

## Compliance Target: WCAG 2.1 Level AA

All OneChoiceKitchen web interfaces must meet WCAG 2.1 AA. No exceptions.

## Core Principles (POUR)

- **Perceivable**: All content visible to all users (alt text, captions, contrast)
- **Operable**: All functionality accessible via keyboard
- **Understandable**: Content is readable and predictable
- **Robust**: Works with current and future assistive technologies

## Color Contrast

| Use Case | Minimum Ratio |
|----------|--------------|
| Normal text | 4.5:1 |
| Large text (18pt+) | 3:1 |
| UI components, icons | 3:1 |

Never use color alone to convey information (e.g., red = error must also have icon/text).

## Semantic HTML

`html
<!-- ❌ Bad — no semantics -->
<div onClick={handleClick}>Add to Cart</div>

<!-- ✅ Good — semantic button -->
<button type="button" onClick={handleClick}>
  Add to Cart
</button>

<!-- ✅ Good — semantic structure -->
<main>
  <section aria-labelledby="restaurants-heading">
    <h1 id="restaurants-heading">Nearby Restaurants</h1>
    <ul role="list">
      <li><article>Restaurant card</article></li>
    </ul>
  </section>
</main>
`

## ARIA Roles and Labels

`	sx
// Loading states
<div role="status" aria-live="polite" aria-label="Loading orders">
  <Spinner />
</div>

// Error messages
<div role="alert" aria-live="assertive">
  Order failed. Please try again.
</div>

// Interactive elements
<button
  aria-label="Cancel order #12345"
  aria-disabled={isCancelling}
>
  Cancel
</button>

// Progress indicators
<div
  role="progressbar"
  aria-valuenow={75}
  aria-valuemin={0}
  aria-valuemax={100}
  aria-label="Order preparation progress"
/>
`

## Keyboard Navigation

- All interactive elements reachable via Tab key
- Logical focus order (follows visual flow)
- Visible focus indicators (never outline: none without replacement)
- Modal dialogs trap focus within modal
- ESC key closes modals
- Arrow keys navigate menus and lists

`css
/* ✅ Custom focus indicator */
:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}
`

## Accessible Forms

`	sx
// ✅ All inputs have associated labels
<div>
  <label htmlFor="delivery-address">Delivery Address</label>
  <input
    id="delivery-address"
    type="text"
    aria-required="true"
    aria-describedby="address-hint"
    aria-invalid={!!errors.address}
  />
  <p id="address-hint">Enter your full street address</p>
  {errors.address && (
    <p role="alert" aria-live="assertive">{errors.address.message}</p>
  )}
</div>
`

## Images

`	sx
// Informative image — descriptive alt text
<img src="/restaurant-banner.jpg" alt="Spicy Biryani House storefront" />

// Decorative image — empty alt
<img src="/divider.svg" alt="" aria-hidden="true" />

// next/image with alt
<Image src="/logo.png" alt="OneChoiceKitchen logo" width={120} height={40} />
`

## Testing Accessibility

`ash
# Run axe-core in component tests
import { axe } from 'jest-axe';

it('has no accessibility violations', async () => {
  const { container } = render(<RestaurantCard restaurant={mockRestaurant} />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
`

Manual testing checklist:
- [ ] Navigate entire page with keyboard only
- [ ] Test with screen reader (NVDA on Windows, VoiceOver on Mac)
- [ ] Check color contrast with browser devtools
- [ ] Test at 200% zoom (no horizontal scroll)
- [ ] Verify error messages are announced by screen readers
