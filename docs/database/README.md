# Database Guide

## Overview

OneChoiceKitchen uses **Prisma ORM** with:
- **SQLite** — local development (no Docker needed)
- **PostgreSQL 15** — Docker / staging / production

Single source of truth: `prisma/schema.prisma`

---

## Database Browsers

### Prisma Studio (SQLite & PostgreSQL)
```bash
pnpm prisma studio
# Opens at http://localhost:5555
# OR via setup.ps1:
.\setup.ps1 start -OpenDB
```

### pgAdmin (PostgreSQL / Docker only)
1. Start Docker: `docker compose -f docker-compose.dev.yml up -d`
2. Open http://localhost:5050
3. Login: `admin@onechoicekitchen.com` / `admin123`
4. Server auto-connects to `ock-postgres`

---

## Migration Workflow

### Create a new migration
```bash
pnpm prisma migrate dev --name "add_column_name"
```

### Apply migrations (production)
```bash
pnpm prisma migrate deploy
```

### Reset database (destructive — dev only)
```bash
pnpm prisma migrate reset
```

### Push schema without migration (dev only)
```bash
pnpm prisma db push
```

### Generate Prisma client after schema changes
```bash
pnpm prisma generate
```

---

## Core Models

| Model | Description |
|-------|-------------|
| User | All platform users (customer, partner, rider, admin) |
| Branch | Restaurant locations |
| Menu / MenuItem / MenuCategory | Food menu structure |
| Order / OrderItem | Customer orders and line items |
| Payment / Transaction | Payment records |
| TiffinPlan / TiffinSubscription | Meal subscription plans |
| Offer / Coupon | Discounts and promotions |
| Review | Customer reviews and ratings |
| Notification | All notification logs |
| Employee | HRMS staff records |
| Attendance | Clock-in/out records |
| Leave / LeaveBalance | Leave management |
| Payroll | Salary and payslip records |

---

## Connection Strings

### Local SQLite
```env
DATABASE_URL="file:./dev.db"
```

### Docker PostgreSQL
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/onechoice_dev"
```

### Production PostgreSQL
```env
DATABASE_URL="postgresql://USER:PASS@HOST:5432/onechoice_prod?schema=public&connection_limit=5"
```

---

## Seeding

```bash
# Run seed script
pnpm prisma db seed

# Seed file location
prisma/seeds/seed.ts
```

The seed script creates:
- Admin user (`admin@test.com` / `test123`)
- Sample restaurants and menus
- Test customers and orders

---

## Backup & Restore

See [Backup & Restore Guide](../backup-restore.md)

### Quick backup (PostgreSQL)
```bash
docker exec ock-postgres pg_dump -U postgres onechoice_dev > backup.sql
```

### Quick restore
```bash
cat backup.sql | docker exec -i ock-postgres psql -U postgres onechoice_dev
```
