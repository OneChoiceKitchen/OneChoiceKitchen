---
name: redis
description: >
  Redis caching and BullMQ queue patterns for OneChoiceKitchen. Covers cart
  storage, API caching, job queues, rate limiting, and pub/sub for real-time
  features. Load when implementing caching or background jobs.
---

# Redis Standards

## Connection Setup (NestJS)

```typescript
// redis.module.ts
@Module({
  imports: [
    BullModule.forRoot({ connection: { host: 'localhost', port: 6379 } }),
    BullModule.registerQueue({ name: 'notifications' }),
  ],
  providers: [RedisService],
  exports: [RedisService, BullModule],
})
export class RedisModule {}
```

## Caching Patterns

### Cache-Aside Pattern
```typescript
async getRestaurantMenu(restaurantId: string) {
  const key = `menu:${restaurantId}`;
  const cached = await this.redis.get(key);
  if (cached) return JSON.parse(cached);

  const menu = await this.menuRepo.findByRestaurant(restaurantId);
  await this.redis.setex(key, 300, JSON.stringify(menu)); // 5 min TTL
  return menu;
}
```

### Cache Invalidation
```typescript
// Invalidate when menu changes
async updateMenuItem(restaurantId: string, itemData: UpdateMenuItemDto) {
  await this.menuRepo.update(itemData);
  await this.redis.del(`menu:${restaurantId}`); // Invalidate cache
}
```

## Cart Storage

Cart is stored in Redis (24h TTL) as a Hash:
```typescript
const cartKey = `cart:${userId}`;

// Add item to cart
await this.redis.hset(cartKey, itemId, JSON.stringify({ quantity, price }));
await this.redis.expire(cartKey, 86400); // 24 hours

// Get cart
const cart = await this.redis.hgetall(cartKey);

// Clear cart after order placement
await this.redis.del(cartKey);
```

## Key Naming Convention

Format: `resource:identifier:qualifier`

| Key Pattern | Data | TTL |
|-------------|------|-----|
| `menu:{restaurantId}` | Restaurant menu | 5 min |
| `cart:{userId}` | User cart | 24 hours |
| `restaurant:{id}` | Restaurant info | 5 min |
| `config:platform` | Platform settings | 1 hour |
| `rider:{id}:location` | Rider GPS coords | 30 seconds |
| `rate:login:{ip}` | Login rate limit | 1 minute |
| `session:{sessionId}` | User session | 7 days |

## BullMQ Queue Patterns

### Add Job
```typescript
await this.notificationQueue.add('push', payload, {
  attempts: 3,
  backoff: { type: 'exponential', delay: 2000 },
  removeOnComplete: 100,
  removeOnFail: 500,
});
```

### Job Processor
```typescript
@Processor('notifications')
export class NotificationProcessor {
  @Process('push')
  async handlePush(job: Job) {
    try {
      await this.fcm.send(job.data);
    } catch (error) {
      this.logger.error('Push notification failed', { jobId: job.id, error });
      throw error; // BullMQ will retry
    }
  }
}
```

## Rate Limiting

```typescript
async checkRateLimit(key: string, limit: number, window: number): Promise<boolean> {
  const current = await this.redis.incr(key);
  if (current === 1) await this.redis.expire(key, window);
  return current <= limit;
}

// Usage: max 5 login attempts per minute
const allowed = await this.checkRateLimit(`rate:login:${ip}`, 5, 60);
if (!allowed) throw new TooManyRequestsException();
```

## Pub/Sub (Real-time Order Tracking)

```typescript
// Publisher (order status update)
await this.redis.publish(`order:${orderId}:status`, JSON.stringify(newStatus));

// Subscriber (WebSocket server)
this.subscriber.subscribe(`order:${orderId}:status`);
this.subscriber.on('message', (channel, message) => {
  socket.to(orderId).emit('order:update', JSON.parse(message));
});
```

## Critical Rules

- Set TTL on ALL keys — never store without expiry (except session management)
- Handle Redis connection failures gracefully (fallback to DB)
- Never store sensitive data (passwords, tokens) in Redis without encryption
- Use Redis Cluster or Sentinel for production HA

