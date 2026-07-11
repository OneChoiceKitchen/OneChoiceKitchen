# OneChoiceKitchen 🍽️

> Enterprise-grade food delivery platform built as an Nx monorepo. Serving the India market.

[![Build Status](https://github.com/your-org/OneChoiceKitchen/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/OneChoiceKitchen/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🌐 Service URLs

| Service | URL | Description |
|---------|-----|-------------|
| API | http://localhost:3000 | NestJS REST API |
| API Docs | http://localhost:3000/api/docs | Swagger/OpenAPI |
| API Health | http://localhost:3000/api/health | Health check |
| Customer Web | http://localhost:4208 | Customer ordering portal |
| Admin Portal | http://localhost:4205 | Internal admin dashboard |
| Partner Portal | http://localhost:4206 | Restaurant partner portal |
| Rider Portal | http://localhost:4207 | Delivery rider portal |
| Customer App | http://localhost:4210 | Customer mobile PWA |
| Partner App | http://localhost:4211 | Partner mobile PWA |
| Rider App | http://localhost:4212 | Rider mobile PWA |
| MailDev | http://localhost:1080 | Email testing UI |
| pgAdmin | http://localhost:5050 | Database browser (Docker) |
| Prisma Studio | http://localhost:5555 | Database browser (local) |

## 🚀 Quick Start

### Requirements
- Node.js 20+ LTS
- pnpm 9+
- Docker Desktop (optional, for PostgreSQL/Redis)

### Start in 3 commands

```powershell
# 1. Install
pnpm install

# 2. Setup database
pnpm prisma generate && pnpm prisma db push

# 3. Launch all services
.\setup.ps1 start
```

### With Docker (PostgreSQL + Redis + MailDev + pgAdmin)

```powershell
.\setup.ps1 start -WithDocker
```

### All options

```powershell
.\setup.ps1 start                  # Standard (API + Web + Admin + Partner + Rider)
.\setup.ps1 start -RunProfile all  # All services including mobile apps
.\setup.ps1 start -WithDocker      # Auto-start Docker infrastructure
.\setup.ps1 start -OpenDB          # Include Prisma Studio
.\setup.ps1 start -NoBrowser       # No auto-open browser
.\setup.ps1 stop                   # Stop all services
.\setup.ps1 status                 # Show service status table
```

## 📦 Project Structure

```
OneChoiceKitchen/
├── apps/
│   ├── api/                ← NestJS backend (port 3000)
│   ├── web/                ← Customer Next.js app (port 4208)
│   ├── admin/              ← Admin portal (port 4205)
│   ├── partner/            ← Partner portal (port 4206)
│   ├── rider/              ← Rider portal (port 4207)
│   ├── customer-mobile/    ← Customer mobile PWA (port 4210)
│   ├── mobile-app/         ← Partner mobile PWA (port 4211)
│   └── rider-mobile/       ← Rider mobile PWA (port 4212)
├── libs/                   ← Shared libraries
├── prisma/                 ← Database schema and migrations
├── docs/                   ← Technical documentation
├── infra/                  ← Docker, NGINX configs
├── .agents/                ← AI agent skills (37 domain skills)
├── docker-compose.dev.yml  ← Dev infrastructure
├── docker-compose.yml      ← Production stack
└── setup.ps1               ← Service orchestration script
```

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | NestJS 10, TypeScript, Prisma ORM |
| Frontend | Next.js 14 App Router, React 18 |
| Database | SQLite (dev) / PostgreSQL 15 (prod) |
| Cache/Queue | Redis 7 + BullMQ |
| Build | Nx 20 monorepo, pnpm |
| Payments | Razorpay |
| Maps | Google Maps Platform |
| Email | Nodemailer / SendGrid |
| SMS | MSG91 |
| Push | Firebase FCM |

## 🧪 Testing

```bash
pnpm nx affected:test   # Run all affected tests
pnpm nx affected:lint   # Run linting
pnpm nx e2e web-e2e     # E2E tests
```

## 📖 Documentation

See [docs/README.md](./docs/README.md) for the full documentation index including:
- Architecture overview
- Setup guide
- Docker guide  
- API reference
- Database guide
- Mobile deployment (Android + iOS)
- Testing guide
- Troubleshooting

## 📱 Mobile Apps

Download our apps from the respective portals. Each portal has a **"Download Apps"** section:
- **Customer Web** → http://localhost:4208/download
- **Partner Portal** → Downloads tab in the header
- **Rider Portal** → Downloads tab in the header
- **Admin Portal** → App Downloads section (includes Admin App)

## 🤝 Contributing

1. Read [coding-standards](./docs/coding-standards.md) and [git-workflow](./.agents/skills/git-workflow/SKILL.md)
2. Branch from `develop`
3. Commit with conventional format: `feat(orders): add real-time tracking`
4. Open PR with full description
5. All PRs require passing CI + code review

## 🔑 Default Credentials

| Portal | Email | Password |
|--------|-------|----------|
| Admin | admin@test.com | test123 |
| Partner | partner@test.com | test123 |
| Customer | customer@test.com | test123 |
| pgAdmin | admin@onechoicekitchen.com | admin123 |
