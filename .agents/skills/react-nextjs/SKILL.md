---
name: react-nextjs
description: >
  React and Next.js 14 App Router patterns for OneChoiceKitchen. Covers server
  components, client components, server actions, routing, and state management.
  Load when building any Next.js frontend feature.
---

# React / Next.js Standards

## App Router Structure

```
app/
  layout.tsx              # Root layout (fonts, providers, metadata)
  page.tsx                # Home page (Server Component)
  loading.tsx             # Loading UI (Suspense boundary)
  error.tsx               # Error boundary
  not-found.tsx           # 404 page
  (auth)/                 # Route group (no URL segment)
    login/
      page.tsx
  restaurants/
    page.tsx              # Restaurant listing (ISR)
    [id]/
      page.tsx            # Restaurant detail (SSR)
      loading.tsx
```

## Server vs Client Components

Default: Server Component (no directive needed)

Use 'use client' ONLY when:
- Using useState, useEffect, useReducer, useRef
- Handling browser events (onClick, onChange)
- Using browser APIs (localStorage, navigator)
- Using third-party client-side libraries

```typescript
// Server Component (data fetching, no interactivity)
export default async function RestaurantPage({ params }) {
  const restaurant = await getRestaurant(params.id);
  return <RestaurantDetail restaurant={restaurant} />;
}

// Client Component (interactive)
'use client';
export function AddToCartButton({ item }) {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

## Data Fetching Patterns

```typescript
// Server Component — direct async/await
async function OrderList({ userId }: { userId: string }) {
  const orders = await getOrders(userId); // Direct DB call or fetch()
  return orders.map(order => <OrderCard key={order.id} order={order} />);
}

// ISR — revalidate every 5 minutes
export const revalidate = 300;

// Force dynamic
export const dynamic = 'force-dynamic';
```

## Server Actions (Forms)

```typescript
// actions/order.ts
'use server';

export async function placeOrder(formData: FormData) {
  const userId = await getCurrentUserId();
  const result = orderSchema.safeParse(Object.fromEntries(formData));
  if (!result.success) return { error: result.error.flatten() };

  await createOrder(userId, result.data);
  revalidatePath('/orders');
}

// Component usage
<form action={placeOrder}>
  <button type="submit">Place Order</button>
</form>
```

## Metadata

```typescript
// Static metadata
export const metadata: Metadata = {
  title: 'OneChoiceKitchen — Order Food Online',
  description: 'Order from the best restaurants near you.',
};

// Dynamic metadata
export async function generateMetadata({ params }): Promise<Metadata> {
  const restaurant = await getRestaurant(params.id);
  return {
    title: `${restaurant.name} | OneChoiceKitchen`,
    description: restaurant.description,
    openGraph: { images: [restaurant.coverImage] },
  };
}
```

## State Management

- Server state: React Query / SWR for client-side data fetching
- UI state: React useState / useReducer (no global store for simple state)
- Global state: Zustand (for cart, auth — minimal use)
- Form state: React Hook Form + Zod validation

## Anti-Patterns

- Never fetch data in Client Components when Server Component can do it
- Never use useEffect for data that can be fetched server-side
- Never store user JWT in localStorage — use HttpOnly cookies
- Never use `router.push` for form submissions — use Server Actions
