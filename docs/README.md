# OneChoiceKitchen Documentation

Welcome to the OneChoiceKitchen technical documentation. This is your single entry point for all technical guides.

## 📖 Documentation Index

| Section | Description |
|---------|-------------|
| [Architecture](./architecture/README.md) | System design, components, data flow |
| [Setup Guide](./setup/README.md) | Prerequisites, installation, first run |
| [Docker Guide](./setup/docker-guide.md) | Docker infrastructure setup |
| [Environment Variables](./setup/environment-variables.md) | All env vars documented |
| [API Reference](./api/README.md) | REST API overview and authentication |
| [Database](./database/README.md) | Schema, migrations, pgAdmin |
| [Deployment](./deployment/README.md) | Vercel, VPS, Docker production |
| [Mobile Android](./deployment/mobile-android.md) | Google Play Store submission |
| [Mobile iOS](./deployment/mobile-ios.md) | Apple App Store submission |
| [PWA Guide](./deployment/pwa-guide.md) | Progressive Web App setup |
| [Testing](./testing/README.md) | Testing strategy and commands |
| [CI/CD](./ci-cd/README.md) | GitHub Actions, Nx Cloud |
| [Security](./security/README.md) | RBAC, JWT, OWASP compliance |
| [Monitoring](./monitoring/README.md) | Logging, alerting, health checks |
| [Troubleshooting](./troubleshooting/README.md) | Common issues and fixes |
| [Coding Standards](./coding-standards.md) | TypeScript, React, NestJS patterns |
| [Release Process](./release-process.md) | Versioning and releases |
| [Backup & Restore](./backup-restore.md) | Database backup procedures |

## 🚀 Quick Start

```bash
# 1. Clone
git clone https://github.com/your-org/OneChoiceKitchen.git
cd OneChoiceKitchen

# 2. Start everything
.\setup.ps1 start

# 3. Start with Docker infra
.\setup.ps1 start -WithDocker

# 4. Status check
.\setup.ps1 status
```

## 🌐 Service URLs

| Service | URL |
|---------|-----|
| NestJS API | http://localhost:3000 |
| API Documentation (Swagger) | http://localhost:3000/api/docs |
| API Health Check | http://localhost:3000/api/health |
| Customer Web Portal | http://localhost:4208 |
| Admin Portal | http://localhost:4205 |
| Partner Portal | http://localhost:4206 |
| Rider Portal | http://localhost:4207 |
| Customer Mobile App | http://localhost:4210 |
| Partner App | http://localhost:4211 |
| Rider App | http://localhost:4212 |
| MailDev (email testing) | http://localhost:1080 |
| pgAdmin (DB browser) | http://localhost:5050 |
| Prisma Studio | http://localhost:5555 |

## 📦 Tech Stack

- **Backend**: NestJS 10, TypeScript, Prisma ORM
- **Frontend**: Next.js 14 App Router, React 18
- **Database**: SQLite (local dev) / PostgreSQL 15 (Docker/production)
- **Cache/Queue**: Redis 7 + BullMQ
- **Build**: Nx 20 monorepo, pnpm
- **Payments**: Razorpay
- **Email**: Nodemailer + MailDev (dev) / SendGrid (production)
- **Maps**: Google Maps Platform
