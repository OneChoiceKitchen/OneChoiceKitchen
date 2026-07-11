---
name: deployment
description: >
  Deployment standards for OneChoiceKitchen covering Vercel (Next.js frontends),
  VPS via Docker + NGINX (NestJS API), and cloud platforms (AWS, Azure, GCP).
  Use when deploying, configuring CI/CD, or setting up infrastructure.
---

# Deployment Standards

## Deployment Targets Overview

| Component | Primary Target | Alternative |
|-----------|---------------|-------------|
| Customer web (`web`) | Vercel | AWS Amplify |
| Admin portal | Vercel | Self-hosted |
| Partner portal | Vercel | Self-hosted |
| Rider portal | Vercel | Self-hosted |
| NestJS API (`api`) | VPS / Docker | AWS ECS, GCP Cloud Run |
| PostgreSQL | Managed (Railway/Supabase/RDS) | Self-hosted Dockerized |
| Redis | Upstash | Self-hosted |
| NGINX | VPS | Cloud Load Balancer |

---

## Vercel Deployment (Next.js Frontends)

### Setup

1. Connect GitHub repo to Vercel project
2. Set **Root Directory** to the app folder (e.g., `apps/web`)
3. Configure build settings:
   ```
   Build Command: pnpm nx build web --prod
   Output Directory: apps/web/.next
   Install Command: pnpm install --frozen-lockfile
   ```

### Environment Variables

Required per environment:
```
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=<32-char secret>
NEXT_PUBLIC_API_URL=https://api.yourchoice.in
NEXT_PUBLIC_GOOGLE_MAPS_KEY=...
NEXT_PUBLIC_RAZORPAY_KEY=...
```

Never expose secrets starting with `NEXT_PUBLIC_` — those are client-side!

### Build Optimization
- Enable Vercel's **Edge Runtime** for middleware
- Use `next/image` for all images (auto-optimized)
- Enable ISR (Incremental Static Regeneration) for restaurant listings
- Keep client bundles < 200KB gzipped

### Nx Monorepo + Vercel
- Use Vercel's native Nx integration or configure `vercel.json`:
  ```json
  {
    "buildCommand": "pnpm nx build web --prod",
    "outputDirectory": "apps/web/.next",
    "framework": "nextjs"
  }
  ```

---

## VPS Deployment (NestJS API)

### Stack
- **OS**: Ubuntu 22.04 LTS
- **Runtime**: Docker + Docker Compose
- **Reverse Proxy**: NGINX
- **SSL**: Let's Encrypt (Certbot)
- **Process**: Docker manages restarts (no PM2 needed with Docker)

### Docker Setup

`Dockerfile` (NestJS):
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm nx build api --prod

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist/apps/api ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
RUN npx prisma generate
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

### Docker Compose (Production)
```yaml
version: '3.8'
services:
  api:
    image: onechoice/api:latest
    restart: always
    env_file: .env.production
    ports:
      - "3000:3000"
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15-alpine
    restart: always
    volumes:
      - pg_data:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: onechoice
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}

  redis:
    image: redis:7-alpine
    restart: always
    volumes:
      - redis_data:/data

volumes:
  pg_data:
  redis_data:
```

### NGINX Configuration
```nginx
server {
    listen 80;
    server_name api.onechoicekitchen.in;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.onechoicekitchen.in;

    ssl_certificate /etc/letsencrypt/live/api.onechoicekitchen.in/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.onechoicekitchen.in/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket support for real-time features
    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### SSL Setup
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.onechoicekitchen.in
sudo crontab -e
# Add: 0 0 * * * certbot renew --quiet
```

---

## Cloud Deployment (AWS / Azure / GCP)

### AWS

**Recommended Services:**
| Service | Purpose |
|---------|---------|
| ECS Fargate | Run API containers (serverless) |
| RDS PostgreSQL | Managed database |
| ElastiCache | Managed Redis |
| S3 | Static assets |
| CloudFront | CDN |
| ECR | Docker image registry |
| Secrets Manager | Environment variables |

**Minimal ECS Setup:**
```bash
# Build and push image
docker build -t onechoice-api .
docker tag onechoice-api:latest <account>.dkr.ecr.ap-south-1.amazonaws.com/onechoice-api
docker push <account>.dkr.ecr.ap-south-1.amazonaws.com/onechoice-api
```

### GCP

**Recommended Services:**
| Service | Purpose |
|---------|---------|
| Cloud Run | Serverless containers |
| Cloud SQL | Managed PostgreSQL |
| Memorystore | Managed Redis |
| Cloud Storage | Static assets |
| Artifact Registry | Docker registry |
| Secret Manager | Environment variables |

```bash
gcloud run deploy onechoice-api \
  --image gcr.io/PROJECT_ID/onechoice-api \
  --platform managed \
  --region asia-south1 \
  --allow-unauthenticated \
  --set-env-vars="NODE_ENV=production"
```

### Azure
| Service | Purpose |
|---------|---------|
| Azure Container Apps | Run API |
| Azure Database for PostgreSQL | Managed DB |
| Azure Cache for Redis | Managed Redis |
| Azure Blob Storage | Static assets |
| Azure Key Vault | Secrets |

---

## CI/CD Pipeline (GitHub Actions)

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-api:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - run: pnpm install --frozen-lockfile
      - run: pnpm nx build api --prod
      - run: pnpm nx test api
      - name: Build Docker image
        run: docker build -t api .
      - name: Deploy to VPS
        run: ssh ${{ secrets.VPS_USER }}@${{ secrets.VPS_HOST }} "cd /app && docker compose pull && docker compose up -d"
```

---

## Pre-Deployment Checklist

- [ ] `pnpm nx affected:build` passes
- [ ] `pnpm nx affected:test` passes
- [ ] All environment variables configured for target environment
- [ ] Database migrations run: `npx prisma migrate deploy`
- [ ] Health check endpoint returns 200: `GET /api/health`
- [ ] SSL certificate valid
- [ ] Monitoring/alerting configured
- [ ] Rollback plan documented

