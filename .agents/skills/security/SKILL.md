---
name: security
description: >
  Security standards for OneChoiceKitchen. Apply OWASP top-10 mitigations,
  authentication guards, authorization (RBAC), input validation, and secrets
  handling. Load when building any API endpoint, auth flow, or data handling.
---

# Security Standards

## OWASP Top-10 Mitigations

### 1. Injection (SQL, NoSQL, Command)
- Use Prisma exclusively — parameterized queries by default
- Never concatenate user input into SQL strings
- Sanitize file path inputs (directory traversal prevention)

### 2. Broken Authentication
- JWT access tokens expire in 15 minutes
- Refresh tokens in HttpOnly cookies only
- Rate limit login attempts (5 per minute per IP)
- OTP expiry: 5 minutes

### 3. Sensitive Data Exposure
- All data transmitted over HTTPS only
- Passwords hashed with bcrypt (min 10 rounds)
- PII fields encrypted at rest (payment card data never stored — Razorpay vault)
- Response DTOs strip sensitive fields before sending

### 4. XML External Entities (XXE)
- No XML parsing — use JSON exclusively

### 5. Broken Access Control
- Every API endpoint checks authentication AND authorization
- RBAC: check user role before every data-modifying operation
- Users can only access their own data (row-level filtering)

### 6. Security Misconfiguration
- No default credentials
- Error messages don't expose stack traces to clients
- CORS explicitly configured — no wildcard origins in production
- Helmet.js enabled on all NestJS apps

### 7. Cross-Site Scripting (XSS)
- All user-generated content sanitized before rendering
- Content Security Policy headers configured
- React's JSX escaping used — never dangerouslySetInnerHTML

### 8. Insecure Deserialization
- All request bodies validated via class-validator DTOs
- Never use eval() or Function() constructors

### 9. Using Components with Known Vulnerabilities
- pnpm audit run as part of CI
- Dependabot or Renovate for automated dependency updates

### 10. Insufficient Logging & Monitoring
- All authentication failures logged
- All authorization failures logged with user context
- Suspicious patterns trigger alerts (multiple failed logins)

## Authentication Guards (NestJS)

`	ypescript
// Protect all routes by default in module
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {}

// Explicitly mark public routes
@Public()
@Get('restaurants')
getRestaurants() {}
`

## Authorization (RBAC)

`	ypescript
// Role-based guard
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
@Delete('orders/:id')
deleteOrder() {}

// Resource ownership check
async getOrder(id: string, userId: string) {
  const order = await this.ordersRepo.findById(id);
  if (!order) throw new NotFoundException();
  if (order.userId !== userId) throw new ForbiddenException();
  return order;
}
`

## Input Validation

All request DTOs use class-validator:
`	ypescript
export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  restaurantId: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  items: OrderItemDto[];

  @IsNumber()
  @Min(0)
  @Max(10000)
  totalAmount: number;
}
`

## Secrets Handling

- All secrets in environment variables — never hardcoded
- .env.local for development (gitignored)
- Production secrets in: Vercel env vars, AWS Secrets Manager, or GCP Secret Manager
- Never log secret values
- Rotate secrets quarterly
