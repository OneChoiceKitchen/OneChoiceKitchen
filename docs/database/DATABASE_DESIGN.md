# OneChoiceKitchen — Database Design

> **Source of Truth**: `prisma/schema.prisma`  
> **Database**: SQLite (local dev) → PostgreSQL 15 (production)  
> **Last Updated**: 2026-07-09

---

## Core Domain Models

### Users & Authentication

```
User
  ├── id (UUID PK)
  ├── email (unique)
  ├── password (bcrypt hashed)
  ├── name, mobile, profilePhoto
  ├── roleId → Role
  ├── restaurantId → Restaurant  (for partner/staff users)
  ├── isActive, isLocked, lockoutUntil
  ├── mfaEnabled, mfaSecret, mfaType
  ├── loyaltyPoints, referralCode (unique)
  ├── notificationPrefs (JSON string)
  └── createdAt, updatedAt

Role
  ├── id (UUID PK)
  ├── name (SUPER_ADMIN | ADMIN | MANAGER | PARTNER | RIDER | CUSTOMER | SUPPORT)
  ├── permissions (JSON string - array of permission strings)
  └── isSystem (built-in roles cannot be deleted)
```

### Restaurant & Branch

```
Restaurant
  ├── id, name, email, mobile
  ├── city, address, lat, lng
  ├── rating, reviewCount
  ├── isFranchise, parentRestaurantId
  ├── isActive, isDeleted, deletedAt
  └── → branches (RestaurantBranch[])

RestaurantBranch
  ├── id, restaurantId → Restaurant
  ├── name, address, city, lat, lng
  ├── openTime, closeTime (string HH:mm)
  ├── isActive, isDeleted
  └── → orders (Order[])
```

### Menu

```
MenuCategory
  ├── id, name, description, imageUrl
  ├── restaurantId → Restaurant
  ├── sortOrder, isActive
  └── → items (MenuItem[])

MenuItem
  ├── id, name, description, imageUrl
  ├── categoryId → MenuCategory
  ├── price (Float), discountedPrice
  ├── isVeg (Boolean), isAvailable
  ├── preparationTime (minutes)
  ├── allergens, nutritionInfo (JSON strings)
  └── tags, sortOrder
```

### Orders

```
Order
  ├── id, orderNumber (auto, display friendly)
  ├── userId → User (customer)
  ├── restaurantId, branchId → Restaurant/Branch
  ├── status: PENDING|CONFIRMED|PREPARING|READY|PICKED|DELIVERED|CANCELLED
  ├── paymentStatus: PENDING|PAID|FAILED|REFUNDED
  ├── paymentMethod, paymentId (Razorpay)
  ├── subtotal, tax, deliveryFee, totalAmount (Float)
  ├── deliveryAddress (JSON: {line1,city,lat,lng})
  ├── specialInstructions, estimatedDeliveryTime
  ├── riderId → User (rider)
  └── items (OrderItem[])

OrderItem
  ├── id, orderId → Order
  ├── menuItemId → MenuItem
  ├── quantity, unitPrice, totalPrice
  └── customizations (JSON string)
```

### Tiffin/Mess

```
TiffinSubscription (linked to TiffinPlan via planId)
  ├── id, userId → User
  ├── planType (DAILY|WEEKLY|MONTHLY)
  ├── status (ACTIVE|PAUSED|CANCELLED|EXPIRED)
  ├── startDate, endDate
  ├── deliveryTime, deliveryDays (JSON array)
  ├── totalAmount
  └── deliveries (TiffinDelivery[])
```

### Partner RBAC (New — 2026-07-09)

```
PartnerFeaturePermission
  ├── id (UUID PK)
  ├── partnerId (String) → references User.id
  ├── module  (food_ordering|tiffin|dining|hall_party|hrms|marketing|analytics|finance)
  ├── feature (granular feature ID e.g. fo_orders, mk_coupons)
  ├── isEnabled (Boolean)
  ├── grantedById (String?) → admin User.id
  ├── grantedAt, updatedAt
  └── @@unique([partnerId, module, feature])

PartnerDeleteRequest
  ├── id (UUID PK)
  ├── partnerId (String) → User.id
  ├── module, entity (model name), entityId
  ├── reason (String?)
  ├── status (PENDING|APPROVED|REJECTED)
  ├── reviewedById (String?) → admin User.id
  ├── reviewedAt (DateTime?)
  ├── requestedAt, updatedAt
  └── @@index([partnerId]), @@index([status])
```

### AI Chat (2026-07-09)

```
AiChatSession
  ├── id, sessionToken (unique)
  ├── userId → User (nullable for anonymous)
  ├── channel (WEB|MOBILE|WHATSAPP)
  ├── status (OPEN|RESOLVED|ESCALATED)
  ├── assignedTo → User (support agent)
  └── messages (AiChatMessage[])

AiChatMessage
  ├── id, sessionId → AiChatSession
  ├── role (USER|BOT|AGENT)
  ├── content (Text)
  ├── provider (openai|gemini|mock|human)
  └── createdAt

AiProviderConfig
  ├── id, provider (openai|gemini|anthropic|custom)
  ├── apiKey (encrypted String)
  ├── model, isActive (Boolean - only 1 can be active)
  ├── temperature, maxTokens
  └── createdAt, updatedAt

AiBotRule
  ├── id, name, category
  ├── keywords (JSON array of trigger strings)
  ├── response (Text - the bot's reply)
  ├── priority (higher = matched first)
  ├── isActive, usageCount
  └── createdAt, updatedAt
```

### Internal Chat

```
ChatRoom
  ├── id, name, type (DIRECT|GROUP|SUPPORT)
  ├── restaurantId (optional - for partner rooms)
  ├── createdById → User
  └── participants (ChatParticipant[]), messages (ChatMessage[])

ChatMessage
  ├── id, roomId → ChatRoom
  ├── senderId → User
  ├── content (Text), type (TEXT|IMAGE|FILE|SYSTEM)
  ├── replyToId → ChatMessage (thread)
  ├── isDeleted, deletedAt
  └── starred (ChatStarredMessage[])
```

---

## Indexing Strategy

| Table | Index | Reason |
|-------|-------|--------|
| `Order` | `userId`, `restaurantId`, `status`, `createdAt` | Frequent filter/sort |
| `MenuItem` | `categoryId`, `isAvailable`, `restaurantId` | Menu queries |
| `User` | `email`, `mobile`, `roleId` | Auth lookups |
| `TiffinSubscription` | `userId`, `status` | Subscription queries |
| `ChatMessage` | `roomId`, `senderId`, `createdAt` | Chat history |
| `AiChatSession` | `userId`, `status` | Active session lookup |
| `PartnerFeaturePermission` | `partnerId` (unique on 3 cols) | Permission check |
| `PartnerDeleteRequest` | `partnerId`, `status` | Approval queue |

---

## Migration Strategy

1. **Never write raw DDL** — always use `pnpm prisma migrate dev`
2. **Name migrations descriptively**: `--name add_partner_rbac_models`
3. **Seed data** in `prisma/seeds/` after migrations
4. **Production migration**: `pnpm prisma migrate deploy` (no prompt)
5. **Rollback**: Prisma has no built-in rollback — rely on DB backups + forward migration

```bash
# Local: create + apply migration
pnpm prisma migrate dev --name add_partner_rbac_models

# Production: apply only
pnpm prisma migrate deploy

# After schema changes: regenerate client
pnpm prisma generate
```
