---
name: production-readiness
description: >
  Production launch checklist for OneChoiceKitchen features. Covers performance,
  security, monitoring, and operational readiness. Load before any production
  deployment or feature launch.
---

# Production Readiness

## Launch Checklist

### Performance
- [ ] API response times < 200ms (p95) under expected load
- [ ] Database queries optimized (no N+1, proper indexes)
- [ ] Redis caching implemented for high-traffic data
- [ ] Frontend bundle size checked (< 200KB initial JS)
- [ ] Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1
- [ ] Load tested with expected peak traffic (use k6 or Artillery)

### Security
- [ ] All API endpoints have authentication (or explicitly public)
- [ ] RBAC authorization implemented and tested
- [ ] Input validation on all DTOs
- [ ] No secrets in codebase or logs
- [ ] CORS properly configured for production domains
- [ ] SSL/TLS configured and auto-renewing
- [ ] Rate limiting on public endpoints

### Monitoring
- [ ] Health check endpoint: `GET /api/health` returns 200
- [ ] Error tracking (Sentry) configured
- [ ] Log aggregation set up
- [ ] Uptime monitoring configured
- [ ] Alerting rules set for critical metrics
- [ ] Database backup verified

### Reliability
- [ ] Graceful shutdown implemented (SIGTERM handled)
- [ ] Database connection pooling configured
- [ ] Redis connection error handling (fallback to DB)
- [ ] Background jobs have retry logic
- [ ] Idempotency keys on payment operations

### Operations
- [ ] Environment variables documented in `.env.example`
- [ ] Database migrations ready: `pnpm prisma migrate deploy`
- [ ] Rollback plan documented
- [ ] Support team briefed on new functionality
- [ ] Runbook updated for new failure scenarios

## Post-Launch
- Monitor error rates for first 2 hours
- Check Sentry for new errors
- Verify notification delivery rates
- Confirm payment success rates unchanged
