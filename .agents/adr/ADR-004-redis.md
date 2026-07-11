# ADR-004: Redis for Caching and Job Queues

**Status**: Accepted
**Date**: 2026-07-01

---

## Decision

Use Redis as the caching layer and job queue system for OneChoiceKitchen.

---

## Context

Real-time food ordering requires fast data access and reliable background job processing. Order notifications, delivery tracking, and email sending must be handled asynchronously to keep API response times low.

---

## Problem

Without a caching and queue layer:
- Every API call hits the database (high latency, high cost)
- Cart data would require database persistence (slow for frequent updates)
- Notification delivery would block API requests
- No retry mechanism for failed notifications

---

## Options Considered

### Option 1: In-memory caching (node-cache)
- ✅ Simple setup
- ❌ Not shared across multiple API instances
- ❌ Data lost on restart
- ❌ No queue capability

### Option 2: RabbitMQ + Memcached
- ✅ Specialized tools for each job
- ❌ Two systems to maintain
- ❌ More infrastructure complexity

### Option 3: Redis + BullMQ (selected)
- ✅ Single system for both caching and queues
- ✅ Persistent (AOF/RDB snapshots)
- ✅ Shared across API instances (horizontal scaling)
- ✅ BullMQ provides retry, delay, priority queues
- ✅ Redis pub/sub for real-time events

---

## Final Decision

**Use Redis 7+** with **BullMQ** for:
- Session/cart storage (TTL: 24 hours)
- API response caching
- Job queues: notifications, emails, delivery tracking
- Rate limiting

---

## Consequences

### Positive
- Sub-millisecond cart operations
- Reliable async notification delivery with retry
- Single Redis instance serves both needs

### Negative / Trade-offs
- Redis is an additional infrastructure dependency
- Data in Redis is not ACID (complementary to PostgreSQL, not a replacement)
- Must handle Redis connection failures gracefully

### Rules That Follow From This Decision
- Cart data stored in Redis, not PostgreSQL
- All background jobs (emails, push notifications) via BullMQ queues
- Cache TTLs must be explicitly set — no infinite caching
- Redis failures must not crash the API (fallback to DB reads)
