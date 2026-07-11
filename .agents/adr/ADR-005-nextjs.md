# ADR-005: Next.js App Router Platform

**Status**: Accepted
**Date**: 2026-07-01

---

## Decision

Use Next.js 14+ with the App Router for all OneChoiceKitchen frontend applications.

---

## Context

OneChoiceKitchen has multiple customer-facing and internal web applications. Performance, SEO, and developer experience are critical for the customer web app. Admin and partner portals need rich interactive UIs.

---

## Problem

A client-only SPA (Create React App) would:
- Poor SEO for restaurant/menu pages (search discoverability)
- Slow initial page loads
- No server-side data fetching capabilities
- Need separate meta tag management library

---

## Options Considered

### Option 1: Create React App (SPA)
- ❌ No SSR/SSG
- ❌ Poor SEO
- ❌ No file-based routing
- ❌ Deprecated by Meta

### Option 2: Vite + React (SPA)
- ✅ Fast development server
- ❌ No SSR built-in
- ❌ Separate SEO solution needed

### Option 3: Next.js App Router (selected)
- ✅ Hybrid rendering: SSR, SSG, ISR per-page
- ✅ Built-in SEO metadata API
- ✅ React Server Components (reduce client bundle)
- ✅ File-based routing
- ✅ Vercel deployment integration
- ✅ Server Actions for forms (no separate API routes needed)

---

## Final Decision

**Use Next.js 14+** with **App Router** for all web applications.

Pages Strategy:
- Restaurant listing: ISR (revalidate every 5 min)
- Restaurant detail: SSR (real-time menu availability)
- Order tracking: Client component (real-time WebSocket)
- Admin/partner dashboards: Client components (interactive)

---

## Consequences

### Positive
- Excellent Core Web Vitals scores for SEO
- Server Components reduce JS bundle size by 40-60%
- Vercel native integration = zero-config deployment

### Negative / Trade-offs
- App Router mental model shift (RSC vs client components)
- 'use client' boundary management requires discipline
- Slightly more complex than a simple SPA

### Rules That Follow From This Decision
- Default to Server Components — 'use client' only when necessary
- Use 
ext/image for all images — never raw <img> tags
- Use loading.tsx / error.tsx for each route segment
- SEO metadata defined via generateMetadata() export
