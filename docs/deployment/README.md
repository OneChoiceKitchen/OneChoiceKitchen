# Deployment Guide

## Deployment Targets

| Target | Technology | When |
|--------|-----------|------|
| Frontend apps | Vercel | Customer web, portals |
| NestJS API | VPS + Docker + NGINX | Always |
| Mobile apps | Google Play / App Store | Mobile apps |
| Full stack | Docker Compose | Self-hosted / staging |

---

## Frontend (Next.js) → Vercel

See [Vercel Deployment Guide](./vercel.md)

Quick deploy:
```bash
npx vercel --prod
```

## Backend (NestJS API) → VPS

See [VPS Docker Guide](./vps-docker.md)

Quick deploy:
```bash
docker compose up -d api
```

## Mobile Apps → App Stores

- [Android / Google Play](./mobile-android.md)
- [iOS / App Store](./mobile-ios.md)
- [PWA Guide](./pwa-guide.md)

## Environment Variables

See [Environment Variables](../setup/environment-variables.md) for all required vars per environment.

## Service Ports

| Service | Local | Docker |
|---------|-------|--------|
| API | 3000 | 3000 |
| Web | 4208 | 4208 |
| Admin | 4205 | 4205 |
| Partner | 4206 | 4206 |
| Rider | 4207 | 4207 |
| Customer Mobile | 4210 | 4210 |
| Partner App | 4211 | 4211 |
| Rider App | 4212 | 4212 |
