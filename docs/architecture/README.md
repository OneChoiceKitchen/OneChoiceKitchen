# Architecture Overview

## System Architecture

OneChoiceKitchen is an **enterprise-grade food delivery SaaS platform** built as an Nx monorepo, targeting the Indian market.

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENTS                                  │
│  Customer Web  │  Admin Portal │ Partner Portal │ Rider Portal  │
│  :4208         │  :4205        │ :4206          │ :4207         │
│  Customer App  │  Partner App  │ Rider App      │               │
│  :4210         │  :4211        │ :4212          │               │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP / WebSocket
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     NESTJS API  :3000                           │
│  Auth (JWT)  │  Orders  │  Restaurants  │  Users  │  Analytics  │
│  Payments    │  Notifications  │  Chat/AI  │  HRMS  │  CMS      │
└──────┬────────────────────────────────────────────┬────────────┘
       │                                            │
       ▼                                            ▼
┌──────────────┐                          ┌─────────────────────┐
│  PostgreSQL  │                          │  Redis (BullMQ)     │
│  :5432       │                          │  :6379              │
│  Primary DB  │                          │  Cache + Queues     │
└──────────────┘                          └─────────────────────┘
       │
       ▼
┌──────────────┐
│  Prisma ORM  │
│  Migrations  │
│  Studio:5555 │
└──────────────┘
```

## Component Overview

### Backend (apps/api)
- **Framework**: NestJS 10 with TypeScript
- **Port**: 3000
- **API Docs**: http://localhost:3000/api/docs (Swagger/OpenAPI)
- **Health**: http://localhost:3000/api/health
- **Modules**: Auth, Orders, Restaurants, Menus, Tiffin, Customers, Payments, Notifications, HRMS, CMS, Analytics, Chat/AI

### Frontends
| App | Framework | Port | Description |
|-----|-----------|------|-------------|
| `web` | Next.js 14 App Router | 4208 | Customer ordering portal |
| `admin-portal` | Next.js 14 (SPA) | 4205 | Internal admin dashboard |
| `partner-portal` | Next.js 14 (SPA) | 4206 | Restaurant partner portal |
| `rider-portal` | Next.js 14 (SPA) | 4207 | Delivery rider portal |
| `customer-mobile` | Next.js 14 PWA | 4210 | Customer mobile app |
| `mobile-app` | Next.js 14 PWA | 4211 | Partner mobile app |
| `rider-mobile` | Next.js 14 PWA | 4212 | Rider mobile app |

### Infrastructure
| Service | Technology | Port |
|---------|-----------|------|
| Database | PostgreSQL 15 (prod) / SQLite (local) | 5432 |
| Cache/Queues | Redis 7 + BullMQ | 6379 |
| Email (dev) | MailDev | 1080/1025 |
| DB Admin | pgAdmin 4 | 5050 |
| DB Studio | Prisma Studio | 5555 |

## Data Flow

### Order Placement Flow
```
Customer App → POST /api/orders
  → Validate cart (Redis cache)
  → Check restaurant availability
  → Apply offers/discounts
  → Create order (PostgreSQL)
  → Trigger Razorpay payment
  → Notify restaurant (BullMQ → FCM)
  → Notify customer (email + push)
  → Assign rider (BullMQ)
  → Real-time tracking (WebSocket)
  → Mark DELIVERED → trigger refund if needed
```

### Authentication Flow
```
POST /api/auth/login
  → Validate credentials (bcrypt)
  → Check role (CUSTOMER/PARTNER/RIDER/ADMIN)
  → Issue JWT (access_token + refresh_token)
  → Store refresh_token in Redis
  → Client stores access_token (localStorage)
  → All subsequent requests: Authorization: Bearer <token>
```

## Design Patterns

- **API**: RESTful with NestJS controllers + services + guards
- **Auth**: JWT with RBAC guards (`@Roles()` decorator)
- **DB**: Prisma ORM with repository pattern
- **Queues**: BullMQ processors for email/SMS/push notifications
- **Caching**: Redis for cart state, session data, API caching
- **Realtime**: Socket.IO for order tracking and internal chat
- **Code Splitting**: React.lazy per route for frontend performance

## Security Architecture

- JWT access tokens (15 min expiry) + refresh tokens (7 days)
- Role-based access control: CUSTOMER, PARTNER, RIDER, ADMIN, SUPER_ADMIN
- API rate limiting (100 req/min per IP)
- Input validation with class-validator on all DTOs
- SQL injection prevention via Prisma parameterized queries
- CORS configured per environment
- Secrets via environment variables (never hardcoded)
