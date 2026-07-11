---
name: feature-flags
description: >
  Feature flag management for OneChoiceKitchen. Covers implementing feature toggles,
  A/B testing, gradual rollouts, and environment-specific feature enablement.
  Trigger when: adding feature flags, A/B testing, gradual rollouts,
  or making features configurable without deployment.
---

# Feature Flags Skill

## Overview

Feature flags allow enabling/disabling features without deployment. Use for:
- Gradual rollouts (10% → 50% → 100%)
- A/B testing
- Emergency feature kill switches
- Environment-specific features

## Implementation in NestJS

### 1. Feature Flag Table (Prisma)
```prisma
model FeatureFlag {
  id          String  @id @default(cuid())
  key         String  @unique
  name        String
  description String?
  enabled     Boolean @default(false)
  rolloutPct  Int     @default(0) // 0-100
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### 2. Feature Flag Service
```typescript
@Injectable()
export class FeatureFlagService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async isEnabled(key: string, userId?: string): Promise<boolean> {
    // Cache in Redis (5 min TTL)
    const cached = await this.redis.get(`ff:${key}`);
    if (cached !== null) return cached === '1';

    const flag = await this.prisma.featureFlag.findUnique({ where: { key } });
    if (!flag) return false;
    if (!flag.enabled) return false;

    // Rollout percentage check
    if (userId && flag.rolloutPct < 100) {
      const hash = parseInt(userId.slice(-2), 16);
      return (hash % 100) < flag.rolloutPct;
    }

    await this.redis.set(`ff:${key}`, flag.enabled ? '1' : '0', 300);
    return flag.enabled;
  }
}
```

### 3. Usage in Controller
```typescript
@Get('new-checkout')
async newCheckout(@Req() req) {
  const useNewFlow = await this.featureFlags.isEnabled('new_checkout', req.user.id);
  if (!useNewFlow) throw new NotFoundException('Feature not available');
  return this.checkoutService.newFlow();
}
```

## Current Feature Flags

| Key | Description | Default |
|-----|-------------|---------|
| `new_checkout` | New multi-step checkout flow | false |
| `ai_recommendations` | AI-powered menu recommendations | false |
| `subscription_pause` | Allow pausing tiffin subscriptions | true |
| `real_time_tracking` | WebSocket order tracking | true |
| `bulk_ordering` | Corporate bulk order feature | false |
