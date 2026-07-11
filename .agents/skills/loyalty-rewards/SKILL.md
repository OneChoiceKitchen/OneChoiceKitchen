---
name: loyalty-rewards
description: >
  OCK Points loyalty rewards system for OneChoiceKitchen. Covers earning rules,
  redemption, tier system, partner rewards, referral bonuses, and admin management.
  Trigger when: implementing loyalty points, rewards, referrals, OCK coins/points,
  tier upgrades, or redemption at checkout.
---

# Loyalty & Rewards Skill

## OCK Points System

### Earning Rules
| Action | Points Earned |
|--------|--------------|
| Place an order | 1 point per ₹10 spent |
| First order | 100 bonus points |
| Refer a friend | 200 points (when friend places first order) |
| Write a review | 25 points |
| Subscribe to tiffin (monthly) | 500 bonus points |
| Birthday order | 2x points |
| OCK App order | 1.5x points |

### Redemption Rules
| Redemption | Value |
|-----------|-------|
| 100 OCK Points | ₹5 off order |
| Min redemption | 500 points |
| Max per order | 20% of order value |
| Expiry | 365 days from earning |

### Customer Tiers
| Tier | Threshold | Benefits |
|------|-----------|---------|
| Silver | 0–4,999 lifetime pts | 1x earn rate |
| Gold | 5,000–19,999 | 1.25x earn rate + free delivery |
| Platinum | 20,000+ | 1.5x earn rate + priority support + free delivery |

## Prisma Models

```prisma
model LoyaltyAccount {
  id          String @id @default(cuid())
  userId      String @unique
  totalPoints Int    @default(0)
  lifetimePts Int    @default(0)
  tier        Tier   @default(SILVER) // SILVER | GOLD | PLATINUM
  user        User   @relation(...)
  transactions LoyaltyTransaction[]
}

model LoyaltyTransaction {
  id          String          @id @default(cuid())
  accountId   String
  points      Int             // positive = earned, negative = redeemed
  type        TransactionType // EARN | REDEEM | EXPIRE | BONUS | REFERRAL
  description String
  orderId     String?
  createdAt   DateTime        @default(now())
}
```

## API Endpoints

```
GET  /api/loyalty/balance          # Get points balance and tier
POST /api/loyalty/redeem           # Redeem points at checkout
GET  /api/loyalty/transactions     # Transaction history
POST /api/referrals/apply          # Apply referral code
GET  /api/referrals/my-code        # Get own referral code
```

## Admin Management

- View all customer loyalty accounts
- Manually adjust points (with reason)
- Configure earn/redeem rates
- View tier distribution analytics
- Route: `case 'rewards': return <RewardsAdmin />;`
- File: `apps/admin/admin-portal/src/app/pages/RewardsAdmin.tsx`

## Referral System

```typescript
// When referred user places first order:
1. Issue referral code to new user on signup (format: OCK-XXXXX)
2. Referree enters code at checkout → gets 100 point bonus
3. Referrer gets 200 points when referree's first order delivered
4. Max referral bonus: ₹200 per referral (40 referrals/month cap)
```

## Checkout Integration

```typescript
// In order creation flow:
if (dto.usePoints && dto.pointsToRedeem) {
  const account = await loyaltyService.getAccount(userId);
  if (account.totalPoints < dto.pointsToRedeem) throw new BadRequestException('Insufficient points');
  const discount = Math.min((dto.pointsToRedeem / 100) * 5, orderTotal * 0.2);
  orderTotal -= discount;
  await loyaltyService.redeemPoints(userId, dto.pointsToRedeem, orderId);
}
```
