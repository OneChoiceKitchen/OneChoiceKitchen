---
name: release-management
description: >
  Release process and semantic versioning for OneChoiceKitchen. Covers version
  numbering, release notes, deployment coordination, and hotfix releases.
  Load when preparing or executing a release.
---

# Release Management

## Versioning (Semantic Versioning)

`MAJOR.MINOR.PATCH`

| Segment | When |
|---------|------|
| MAJOR | Breaking API change, major architecture change |
| MINOR | New feature, backward-compatible |
| PATCH | Bug fix, backward-compatible |

Current version tracked in root `package.json`.

## Release Types

### Standard Release (Weekly/Bi-weekly)
1. Merge `develop` → PR to `main`
2. Tag: `git tag v1.2.0`
3. Push tag: `git push origin v1.2.0`
4. GitHub Actions deploys to production
5. Update CHANGELOG.md

### Hotfix Release
1. Branch from `main`: `hotfix/fix-payment-double-charge`
2. Fix and test
3. PR to `main` (bypass develop)
4. Tag: `v1.2.1`
5. Cherry-pick into `develop`

## Pre-Release Checklist
- [ ] All affected tests passing
- [ ] Staging deployment tested
- [ ] Database migrations included if needed
- [ ] Environment variables documented for ops team
- [ ] Rollback plan confirmed
- [ ] Customer-impacting changes documented for support team
- [ ] Monitoring alerts set up for new features

## Release Notes Format
```markdown
## v1.3.0 - 2026-07-09

### New Features
- Subscription pause/resume capability (#123)
- Rider real-time GPS tracking (#145)

### Bug Fixes
- Fixed order cancellation refund calculation (#134)

### Database Migrations
- `pnpm prisma migrate deploy` required

### Breaking Changes
- None
```

## Deployment Order
1. Run database migrations
2. Deploy API (NestJS)
3. Deploy frontends (Vercel — automatic on main push)
4. Verify health checks
5. Monitor error rates for 30 minutes
