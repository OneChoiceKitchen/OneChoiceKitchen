# Monitoring Guide

## Overview

OneChoiceKitchen uses structured logging with NestJS Logger + optional external monitoring.

## Health Check Endpoints

```http
GET /api/health
```

Response:
```json
{
  "status": "ok",
  "info": {
    "database": { "status": "up" },
    "redis": { "status": "up" },
    "disk": { "status": "up", "details": { "free": 5368709120 } }
  }
}
```

## NestJS Structured Logging

```typescript
// Use NestJS Logger — never console.log in production
@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  async createOrder(dto: CreateOrderDto) {
    this.logger.log(`Creating order for user ${dto.userId}`);
    try {
      const order = await this.prisma.order.create({ data: dto });
      this.logger.log(`Order created: ${order.id}`);
      return order;
    } catch (err) {
      this.logger.error(`Order creation failed`, err.stack);
      throw err;
    }
  }
}
```

## Log Levels

| Level | Use Case |
|-------|----------|
| `log` | Normal operations, user actions |
| `warn` | Non-critical issues, deprecations |
| `error` | Exceptions, failures, needs attention |
| `debug` | Development-only detailed info |
| `verbose` | Trace-level, performance profiling |

## What to Log

✅ **DO log:**
- User authentication events (login, logout, failed attempts)
- Order state changes
- Payment events
- Admin actions
- API errors (with stack traces)
- Performance warnings (slow queries > 1s)

❌ **DON'T log:**
- Passwords, PINs, OTPs
- Full credit card numbers
- JWT tokens
- Personal health information

## Production Monitoring Stack

### Option 1: Self-hosted (Recommended for India)
- **Logs**: ELK Stack (Elasticsearch + Logstash + Kibana)
- **Metrics**: Prometheus + Grafana
- **Alerts**: Grafana Alerting → Slack/Email/SMS

### Option 2: Cloud
- **Logs**: CloudWatch (AWS) or Cloud Logging (GCP)
- **APM**: Datadog or New Relic
- **Errors**: Sentry

## Sentry Integration (Error Tracking)

```bash
pnpm add @sentry/nestjs @sentry/node
```

```typescript
// main.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1, // 10% performance monitoring
});
```

## Alerting Rules

| Alert | Threshold | Channel |
|-------|-----------|---------|
| API 5xx rate | > 1% of requests | PagerDuty |
| DB connection pool exhausted | > 80% | Slack |
| Redis memory usage | > 200 MB | Slack |
| Order failure rate | > 5% | PagerDuty |
| Payment failure | Any | PagerDuty + Email |

## setup.ps1 Health Status

The setup.ps1 script shows live health status for all services:
```powershell
.\setup.ps1 status
```
