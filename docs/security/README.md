# Security Guide

## Overview

OneChoiceKitchen implements security following OWASP Top 10 mitigations.

## Authentication & Authorization

### JWT Strategy
```typescript
// All API routes require JWT unless marked @Public()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Get('admin-only')
adminRoute() { ... }
```

### Role Hierarchy
| Role | Access |
|------|--------|
| CUSTOMER | Own orders, profile, reviews |
| PARTNER | Their restaurant + orders + staff |
| RIDER | Delivery assignments + own earnings |
| ADMIN | All data except SUPER_ADMIN settings |
| SUPER_ADMIN | Full platform access |

### Token Security
- Access token: 15 min expiry (short window = less damage if stolen)
- Refresh token: 7 days, stored in Redis (can be invalidated server-side)
- Token rotation on each refresh

## Input Validation

```typescript
// DTOs use class-validator — ALL inputs validated
export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsArray()
  @ValidateNested({ each: true })
  items: OrderItemDto[];

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;
}
```

Global validation pipe applied in `main.ts`:
```typescript
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,        // strip unknown properties
  forbidNonWhitelisted: true,
  transform: true,
}));
```

## Rate Limiting

```typescript
// main.ts
app.use(rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 100,             // 100 requests per window
  message: 'Too many requests',
}));

// Stricter for auth endpoints (10/min)
@UseGuards(ThrottlerGuard)
@Throttle(10, 60)
@Post('login')
login() { ... }
```

## CORS Configuration

```typescript
// Only allow whitelisted origins
app.enableCors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:4208'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true,
});
```

## SQL Injection Prevention

Prisma uses parameterized queries automatically. Never use raw SQL with user input:

```typescript
// ✅ Safe — Prisma parameterized
prisma.user.findMany({ where: { email: userInput } });

// ✅ Safe — raw SQL with parameters
prisma.$queryRaw`SELECT * FROM "User" WHERE email = ${userInput}`;

// ❌ NEVER do this — SQL injection vulnerability
prisma.$executeRawUnsafe(`SELECT * FROM "User" WHERE email = '${userInput}'`);
```

## Secrets Management

```typescript
// ✅ Use environment variables
const jwtSecret = process.env.JWT_SECRET;

// ❌ NEVER hardcode secrets
const jwtSecret = 'my-secret-key'; // ← DO NOT DO THIS
```

## OWASP Top 10 Checklist

- [x] A01 Broken Access Control — RBAC guards on all endpoints
- [x] A02 Cryptographic Failures — bcrypt passwords, HTTPS only in prod
- [x] A03 Injection — Prisma parameterized queries, class-validator
- [x] A04 Insecure Design — threat modeling in design phase
- [x] A05 Security Misconfiguration — CORS, headers, no default creds
- [x] A06 Vulnerable Components — pnpm audit in CI
- [x] A07 Auth Failures — JWT rotation, account lockout
- [x] A08 Software Integrity — dependency lock files, signed commits
- [x] A09 Logging Failures — structured logging all auth events
- [x] A10 SSRF — URL validation on webhook/external calls

## Security Headers (Production NGINX)

```nginx
add_header X-Frame-Options "SAMEORIGIN";
add_header X-Content-Type-Options "nosniff";
add_header X-XSS-Protection "1; mode=block";
add_header Referrer-Policy "strict-origin-when-cross-origin";
add_header Content-Security-Policy "default-src 'self'; ...";
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
```
