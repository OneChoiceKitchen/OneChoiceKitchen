# OneChoiceKitchen — Technical Documentation Master Index

> **Last Updated**: 2026-07-09  
> **Version**: 3.0  
> **Stack**: Next.js 14 · NestJS · PostgreSQL/Prisma · Redis · BullMQ · Socket.IO

---

## Documentation Structure

| File | Contents |
|------|---------|
| [ARCHITECTURE.md](./architecture/ARCHITECTURE.md) | System architecture, service boundaries, ports, infrastructure |
| [DATABASE_DESIGN.md](./database/DATABASE_DESIGN.md) | Prisma schema, key models, indexing strategy, relationships |
| [AI_CHAT_MODULE.md](./modules/AI_CHAT_MODULE.md) | AI chatbot, provider config, internal chat, WebSocket |
| [PARTNER_PORTAL_RBAC.md](./modules/PARTNER_PORTAL_RBAC.md) | Partner module permissions, delete approvals, data scoping |

---

## Quick Reference — Service Ports

| Service | Port | Technology |
|---------|------|------------|
| NestJS API | 3000 | NestJS + Prisma |
| Admin Portal | 4205 | Next.js 14 App Router |
| Partner Portal | 4206 | Next.js 14 App Router |
| Rider Portal | 4207 | Next.js 14 App Router |
| Customer Web | 4208 | Next.js 14 App Router |
| PostgreSQL | 5432 | PostgreSQL 15 |
| Redis | 6379 | Redis 7 |
| Maildev UI | 1080 | Maildev |

---

## Quick Reference — Key Design Decisions

### 1. Monorepo (Nx + pnpm)
All services share types from `libs/` preventing drift between frontend/backend contracts.

### 2. Single Prisma Schema
`prisma/schema.prisma` is the single source of truth. Never write raw DDL.

### 3. Partner RBAC
Partners cannot delete data directly — all deletes go through `PartnerDeleteRequest` approval.

### 4. AI Chat Dual-Mode
- **Mock/Rules**: Always available, no API keys needed
- **Real AI**: Activated per-provider via Admin panel

### 5. Design System v3
- **Primary**: `#2563EB` (Brand Blue)
- **Danger/Red**: `#DC2626` (Brand Red)  
- **Background**: `#f3f4f8` (Azure grey)
- **Font**: Inter (Google Fonts)

---

## Module Registry

| Module | Admin Route | API Prefix | Prisma Model(s) |
|--------|-------------|------------|-----------------|
| Branches | `branches` | `/api/branches` | `RestaurantBranch` |
| Menus | `menus` | `/api/menus` | `MenuItem`, `MenuCategory` |
| Orders | `orders` | `/api/orders` | `Order`, `OrderItem` |
| Tiffin/Mess | `tiffin` | `/api/tiffin` | `TiffinSubscription` |
| Dining | `tables`,`reservations` | `/api/tables`,`/api/reservations` | `Table`, `TableReservation` |
| Customers | `users` | `/api/users` | `User` |
| Reviews | `reviews` | `/api/reviews` | `Review` |
| Support | `support` | `/api/support` | `SupportTicket` |
| Marketing | `offers`,`coupons`,`rewards` | `/api/offers`,`/api/coupons` | `Offer`, `Coupon`, `RewardItem` |
| HRMS | `hrms`,`attendance`,`payroll` | `/api/employees`,`/api/attendance` | `Employee`, `Attendance` |
| Finance | `payouts`,`refunds` | `/api/payouts`,`/api/refunds` | `Payout`, `Refund` |
| AI Chat | `ai_chat` | `/api/ai-chat`,`/api/ai-config` | `AiChatSession`, `AiProviderConfig` |
| Internal Chat | `internal_chat` | `/api/chat` | `ChatRoom`, `ChatMessage` |
| Partner RBAC | `partner_permissions` | `/api/admin/partner-permissions` | `PartnerFeaturePermission`, `PartnerDeleteRequest` |
| Dashboards | `dashboard`,`overall_dashboard`,etc | — | Aggregations |

---

## Development Setup

```bash
# 1. Infrastructure (PostgreSQL + Redis + Maildev)
docker compose -f infra/docker-compose.dev.yml up -d

# 2. Prisma migration
pnpm prisma migrate dev --name init

# 3. Start all services
.\setup.ps1 start

# Start minimal (API + Admin only)
.\setup.ps1 start -Profile core
```
