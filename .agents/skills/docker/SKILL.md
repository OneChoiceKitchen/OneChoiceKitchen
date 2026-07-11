---
name: docker
description: >
  Docker and Docker Compose standards for OneChoiceKitchen. Covers Dockerfile
  patterns for NestJS, local dev compose setup, and production compose configuration.
  Load when containerizing applications or setting up local services.
---

# Docker Standards

## Local Development (Docker Compose)

Run PostgreSQL and Redis locally via Docker:

```yaml
# docker-compose.dev.yml
version: "3.8"
services:
  postgres:
    image: postgres:15-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: onechoice_dev
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - pg_dev_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_dev_data:/data

  maildev:
    image: maildev/maildev
    ports:
      - "1025:1025"   # SMTP
      - "1080:1080"   # Web UI

volumes:
  pg_dev_data:
  redis_dev_data:
```

Start: `docker-compose -f docker-compose.dev.yml up -d`

## NestJS Dockerfile (Multi-stage)

```dockerfile
# === Build Stage ===
FROM node:20-alpine AS builder
RUN npm install -g pnpm
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm nx build api --prod

# === Production Stage ===
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# Only production dependencies
RUN npm install -g pnpm
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod
# Copy built output
COPY --from=builder /app/dist/apps/api ./dist
COPY --from=builder /app/prisma ./prisma
# Generate Prisma client for production
RUN npx prisma generate
EXPOSE 3000
USER node
CMD ["node", "dist/main.js"]
```

## Image Optimization

- Use `node:20-alpine` not `node:20` (3x smaller image)
- Multi-stage builds — don't include dev dependencies in final image
- `.dockerignore` must exclude:
  ```
  node_modules
  .git
  .env
  .env.*
  dist
  coverage
  ```
- Target image size: < 200MB

## Health Check

Add HEALTHCHECK to Dockerfile:
```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s \
  CMD wget -q -O - http://localhost:3000/api/health || exit 1
```

## Security Rules
- Never run as root in container (use `USER node`)
- Never include `.env` files in Docker image
- Scan images for vulnerabilities: `docker scout cves`
- Pin base image versions (not `latest`)
