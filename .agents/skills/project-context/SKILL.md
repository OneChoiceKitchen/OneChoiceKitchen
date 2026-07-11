---
name: project-context
description: >
  Complete OneChoiceKitchen system context. Load this FIRST on every task.
  Covers architecture, all applications, business modules, tech stack, and
  infrastructure so the AI understands what it is building and why.
---

# OneChoiceKitchen — Project Context

## What is OneChoiceKitchen?

OneChoiceKitchen is an **enterprise food-tech platform** operating in the Indian market. It connects customers to restaurants, tiffin services, and cloud kitchens. It handles the full lifecycle of food ordering: discovery, ordering, payment, real-time delivery tracking, subscriptions, and business analytics for partners.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    Nx Monorepo                      │
│                                                     │
│  ┌──────────┐  ┌────────┐  ┌──────────┐            │
│  │   web    │  │ admin  │  │ partner  │  (Next.js) │
│  │ (4208)   │  │ (4205) │  │ (4206)   │            │
│  └──────────┘  └────────┘  └──────────┘            │
│  ┌──────────┐  ┌────────┐                          │
│  │  rider   │  │mobile  │  (Next.js / Expo)        │
│  │ (4207)   │  │ apps   │                          │
│  └──────────┘  └────────┘                          │
│                    │                                │
│            ┌───────▼────────┐                      │
│            │   NestJS API   │  port 3000            │
│            └───────┬────────┘                      │
│                    │                                │
│       ┌────────────┼───────────┐                   │
│       ▼            ▼           ▼                   │
│  PostgreSQL      Redis      External APIs           │
│  (Prisma ORM)  (BullMQ)   (Razorpay, Maps, etc.)  │
└─────────────────────────────────────────────────────┘
```

---

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Monorepo | Nx | Latest |
| Frontend Framework | Next.js (App Router) | 14+ |
| UI Library | React | 18+ |
| Backend Framework | NestJS | 10+ |
| Database | PostgreSQL | 15+ |
| ORM | Prisma | 5+ |
| Cache / Queue | Redis + BullMQ | 7+ |
| Authentication | NextAuth.js + JWT | - |
| Language | TypeScript | 5+ (strict) |
| Package Manager | pnpm | 8+ |
| Testing | Vitest, RTL, Playwright | - |
| Containers | Docker + Docker Compose | - |
| Reverse Proxy | NGINX | - |
| CI/CD | GitHub Actions + Nx Cloud | - |
| Email Dev | Maildev | ports 1025/1080 |

---

## Applications

### Customer-Facing

| App Name | Nx Target | Port | Description |
|----------|-----------|------|-------------|
| `web` | `nx serve web` | 4208 | Main customer website — menu browsing, ordering, tracking |
| `customer-mobile` | `nx serve customer-mobile` | 4210 | Customer mobile app |
| `mobile-app` | `nx serve mobile-app` | 4211 | Legacy / shared mobile app |

### Business Operations

| App Name | Nx Target | Port | Description |
|----------|-----------|------|-------------|
| `admin-portal` | `nx serve admin-portal` | 4205 | Operations — orders, users, analytics, config |
| `partner-portal` | `nx serve partner-portal` | 4206 | Restaurant / cloud kitchen management |
| `rider-portal` | `nx serve rider-portal` | 4207 | Delivery rider app — assignment, tracking |
| `rider-mobile` | `nx serve rider-mobile` | 4212 | Rider mobile app |

### Backend

| App Name | Nx Target | Port | Description |
|----------|-----------|------|-------------|
| `api` | `nx serve api` | 3000 | NestJS REST API — single backend for all frontends |

---

## Business Modules

### Core Commerce
- **Restaurant Management** — CRUD for restaurants, menus, items, pricing, availability
- **Tiffin Management** — Subscription-based tiffin services, daily meal plans
- **Order Management** — Full order lifecycle: placement → preparation → dispatch → delivery
- **Cart** — Multi-restaurant cart, quantity management, applied offers

### Operations
- **Inventory** — Stock tracking, low-stock alerts, auto-deactivation
- **Delivery** — Rider assignment, route optimization, real-time GPS tracking
- **Events** — Catering events, bulk orders, corporate meal planning

### Customer Engagement
- **Subscriptions** — Recurring meal plans, pause/resume, upgrade/downgrade
- **Notifications** — Push (FCM), SMS (Twilio/MSG91), Email (SendGrid/SMTP), In-app
- **Reviews & Ratings** — Customer reviews per order/restaurant

### Finance
- **Payments** — Razorpay primary, wallet, COD; refunds and disputes
- **Pricing Engine** — Dynamic pricing, surge, offers, loyalty discounts
- **Reports** — Revenue, GMV, delivery SLAs, restaurant performance

### Platform
- **User & Role Management** — Customer, Admin, Partner, Rider, Super-admin
- **Configuration** — Platform-wide settings, feature flags, service area management

---

## Folder Structure Conventions

```
apps/
  web/                    # Customer Next.js app
  admin-portal/           # Admin Next.js app
  partner-portal/         # Partner Next.js app
  rider-portal/           # Rider Next.js app
  api/                    # NestJS backend
  customer-mobile/        # Customer mobile
  rider-mobile/           # Rider mobile

libs/
  shared/
    ui/                   # Shared React component library
    types/                # Shared TypeScript types
    utils/                # Shared utility functions
    constants/            # Shared constants
  api-client/             # Generated API client / SDKs
  auth/                   # Auth utilities
  data-access/            # Database access patterns
```

---

## Infrastructure

### Local Development
- **Step 1 — Infrastructure** (Docker, run once):
  `docker compose -f docker-compose.dev.yml up -d`
  Starts: PostgreSQL 15 (:5432), Redis 7 (:6379), Maildev (:1025/:1080)
- **Step 2 — App Services** (Nx orchestrator, no Docker):
  `.\setup.ps1 start` — manages all Nx services only
- **Important**: `setup.ps1` and `docker-compose.dev.yml` are COMPLETELY SEPARATE.
  setup.ps1 checks if infra is running and warns — it never starts Docker.
- **Database (dev)**: SQLite (`file:./dev.db`) — zero infra for quick local coding
- **Database (staging/prod)**: PostgreSQL 15 via Docker or managed cloud

### Production
- **Vercel** — Next.js frontends (web, admin, partner, rider)
- **VPS / Cloud** — NestJS API via Docker + NGINX
- **Managed DB** — Cloud PostgreSQL (Railway, Supabase, or RDS)
- **Redis** — Upstash or self-hosted

---

## Environment Variables Pattern

All apps use `.env.local` for local development. Never commit secrets.

Key variables:
```
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:4208
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
GOOGLE_MAPS_API_KEY=...
FCM_SERVER_KEY=...
SMTP_HOST=...
```

---

## Key Integration Points

| Service | Provider | Usage |
|---------|---------|-------|
| Payments | Razorpay | Orders, subscriptions |
| Maps | Google Maps Platform | Geolocation, routing |
| Push Notifications | Firebase FCM | Mobile + web push |
| SMS | MSG91 / Twilio | OTP, order updates |
| Email | SendGrid / SMTP | Transactional emails |
| Storage | AWS S3 / Cloudflare R2 | Images, documents |

