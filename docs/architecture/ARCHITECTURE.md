# OneChoiceKitchen — System Architecture

> **Last Updated**: 2026-07-09 | **Version**: 3.0

---

## Overview

OneChoiceKitchen is a **multi-tenant food delivery SaaS** for the India market built as an Nx monorepo.

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                        OneChoiceKitchen Nx Monorepo                           │
│                                                                               │
│   apps/                                                                       │
│   ├── api/            NestJS REST API + WebSocket Gateway (port 3000)         │
│   ├── admin/          Admin Portal - Next.js 14 App Router (port 4205)        │
│   ├── partner/        Partner Portal - Next.js 14 App Router (port 4206)      │
│   ├── rider/          Rider Portal - Next.js 14 App Router (port 4207)        │
│   ├── web/            Customer Web - Next.js 14 App Router (port 4208)        │
│   ├── customer-mobile/ React Native (port 4210)                               │
│   └── rider-mobile/   React Native (port 4212)                                │
│                                                                               │
│   libs/               Shared TypeScript types, utilities, design system       │
│   prisma/             Single schema, migrations, seeds                        │
│   infra/              Docker Compose, NGINX, Terraform                        │
└───────────────────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| API | NestJS 10 | Modular, DI, Swagger |
| ORM | Prisma 5 | Single schema = source of truth |
| Database | PostgreSQL 15 | Hosted on VPS or Azure/AWS |
| Cache | Redis 7 | Session, cart, rate-limiting, BullMQ queues |
| Queue | BullMQ | Notifications, email, SMS, background jobs |
| Real-time | Socket.IO | Chat, rider tracking, order updates |
| Auth | JWT + Refresh Tokens | bcrypt hashing, MFA support |
| Frontend | Next.js 14 App Router | Server + Client components |
| Payments | Razorpay | Primary gateway, webhook verified |
| Maps | Google Maps Platform | Geolocation, routing, distance |
| Storage | AWS S3 / Azure Blob | Images, documents |
| Email | SendGrid / SMTP | Transactional email |
| SMS | MSG91 / Twilio | OTP, notifications |
| WhatsApp | Meta Business API | Customer notifications |
| AI Chat | OpenAI / Gemini / Mock | Configurable per admin |
| Build | Nx Monorepo + pnpm | Affected builds, caching |
| CI/CD | Nx Cloud + GitHub Actions | PR-based deployments |

---

## Service Boundaries

### NestJS API (`apps/api`)

Core API serving all frontends. Internal module structure:

```
src/
  app/
    app.module.ts         ← Root module (register all feature modules here)
    auth/                 ← JWT auth, guards, strategies
    controllers/          ← Misc controllers (SEO, menu)
    services/             ← Misc services
    settings/             ← System settings
    storage/              ← File upload (S3/Azure)
  branches/               ← Branch management
  menu/                   ← Menu items & categories
  orders/                 ← Order lifecycle
  tiffin/                 ← Tiffin/mess subscriptions
  users/                  ← User management
  partners/               ← Partner registration
  riders/                 ← Rider management
  chat/                   ← Internal chat (WebSocket)
  ai-chat/               ← AI chatbot (HTTP + rules engine)
  partner-permissions/    ← Partner RBAC + delete approvals ← NEW
  notifications/          ← Email/SMS/WhatsApp/Push via BullMQ
  payment/                ← Razorpay integration
  ...
```

### WebSocket Gateway

```typescript
// Runs on same NestJS process, same port 3000
@WebSocketGateway({ cors: true, namespace: '/chat' })
export class ChatGateway { ... }
```

Rooms:
- `room:{roomId}` — Internal chat rooms
- `user:{userId}` — Direct messages
- `order:{orderId}` — Real-time order updates
- `rider:{riderId}` — Rider location updates

---

## Data Flow

### Order Lifecycle
```
Customer → POST /api/orders → OrdersService
  → BullMQ: email confirmation job
  → WebSocket: emit to admin room
  → Partner Portal notified (if partner's restaurant)
  → Rider assigned → real-time location tracking begins
  → Order delivered → webhook triggers payout queue
```

### AI Chat Flow
```
Customer message → POST /api/ai-chat/send
  → Check active provider (AiProviderConfig where isActive=true)
  → If provider active: call provider API (OpenAI/Gemini)
  → If no active provider: run rules engine (AiBotRule matching)
  → Store in AiChatMessage
  → Return response to customer
  → If escalated: notify support agent via InternalChat
```

### Partner Delete Flow
```
Partner clicks Delete on their data
  → POST /api/partner/delete-requests (entity, entityId, reason)
  → PartnerDeleteRequest created with status=PENDING
  → Admin sees in PartnerPermissionsAdmin → Approvals tab
  → Admin clicks Approve → entity deleted + status=APPROVED
  → Admin clicks Reject → entity kept + status=REJECTED
```

---

## Security Architecture

- **JWT Auth**: Short-lived access tokens (15m) + rotating refresh tokens (7d)
- **RBAC**: Role + feature-level (especially partner portal)
- **Rate Limiting**: Redis-backed per-IP and per-user
- **Input Validation**: class-validator on all DTOs
- **Helmet**: HTTP security headers
- **CORS**: Whitelist of allowed origins per environment
- **Secrets**: Environment variables, never hardcoded

---

## Infrastructure (Production)

```
Internet
  ↓
NGINX (reverse proxy, SSL termination)
  ├── /api      → NestJS API (Docker container, port 3000)
  ├── /admin    → Next.js Admin (Vercel or Docker, port 4205)
  ├── /partner  → Next.js Partner (Vercel or Docker, port 4206)
  ├── /rider    → Next.js Rider (Vercel or Docker, port 4207)
  └── /         → Next.js Customer Web (Vercel or Docker, port 4208)

PostgreSQL (managed or VPS)
Redis (managed or VPS)
S3/Azure Blob (file storage)
```

---

## Environment Variables

All apps require environment-specific `.env` files (never committed to git).
See `docs/ENV_SETUP.md` for the full list.

Key variables:
- `DATABASE_URL` — PostgreSQL connection string
- `REDIS_URL` — Redis connection
- `JWT_SECRET` — JWT signing key
- `RAZORPAY_KEY_ID/SECRET` — Payment gateway
- `SENDGRID_API_KEY` — Email
- `GOOGLE_MAPS_API_KEY` — Maps
- `OPENAI_API_KEY` / `GEMINI_API_KEY` — AI (optional; managed via admin panel)
