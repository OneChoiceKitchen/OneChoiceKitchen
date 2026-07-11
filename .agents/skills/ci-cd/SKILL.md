---
name: ci-cd
description: >
  CI/CD pipeline for OneChoiceKitchen using GitHub Actions and Nx Cloud.
  Covers affected builds, test automation, deployment triggers, Nx Cloud
  remote caching, and self-healing with nx-repair.
  Trigger when: setting up CI/CD, modifying GitHub Actions workflows,
  configuring Nx Cloud, debugging pipeline failures, or deployment automation.
---

# CI/CD Skill

## Pipeline Overview

```
Push/PR → GitHub Actions → Nx affected analysis → Test → Build → Deploy
```

## Key Files

- `.github/workflows/ci.yml` — main CI pipeline
- `.github/workflows/deploy.yml` — deployment pipeline
- `nx.json` — Nx Cloud config

## Nx Cloud Integration

```bash
# Connect to Nx Cloud (one-time setup)
pnpm nx connect-to-nx-cloud

# Run with distributed caching
pnpm nx affected:build --parallel=5
```

## GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: CI
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  main:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      
      - uses: pnpm/action-setup@v3
        with: { version: 9 }
      
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'pnpm' }
      
      - run: pnpm install --frozen-lockfile
      
      - run: pnpm prisma generate
      
      - run: pnpm nx affected:lint --parallel=3
      - run: pnpm nx affected:test --parallel=3 --ci
      - run: pnpm nx affected:build --parallel=3
```

## Monitoring CI

Use the `monitor-ci` skill to watch CI status and self-healing:
```
/monitor-ci
```

## Environment Secrets (GitHub)

Set in GitHub → Settings → Secrets:
- `NX_CLOUD_AUTH_TOKEN`
- `DATABASE_URL` (test DB)
- `JWT_SECRET`
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`

## Deployment on Push to main

```yaml
# Deploy to Vercel (frontends)
- run: npx vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
# Deploy API to VPS
- run: ssh user@server "cd /app && docker compose pull && docker compose up -d"
```
