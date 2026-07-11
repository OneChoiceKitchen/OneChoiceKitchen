# API Reference

## Base URL

| Environment | URL |
|-------------|-----|
| Local dev | `http://localhost:3000` |
| Production | `https://api.onechoicekitchen.com` |

## Interactive Documentation

**Swagger UI**: http://localhost:3000/api/docs  
All endpoints are documented with request/response schemas, authentication requirements, and example payloads.

## Authentication

OneChoiceKitchen uses **JWT Bearer tokens**.

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password"
}
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": "...", "role": "CUSTOMER" }
}
```

### Using the token
```http
GET /api/orders
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### Token lifetimes
- Access token: **15 minutes**
- Refresh token: **7 days**

### Refresh
```http
POST /api/auth/refresh
Authorization: Bearer <refresh_token>
```

## User Roles

| Role | Access |
|------|--------|
| CUSTOMER | Order, profile, reviews |
| PARTNER | Restaurant management, orders, menus |
| RIDER | Delivery management, earnings |
| ADMIN | Full access except super-admin settings |
| SUPER_ADMIN | Full platform access |

## Standard Response Format

### Success
```json
{
  "data": { ... },
  "meta": { "total": 100, "page": 1, "limit": 20 }
}
```

### Error
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [{ "field": "email", "message": "Invalid email" }]
}
```

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK — successful GET/PUT |
| 201 | Created — successful POST |
| 204 | No Content — successful DELETE |
| 400 | Bad Request — validation error |
| 401 | Unauthorized — missing/invalid token |
| 403 | Forbidden — insufficient role |
| 404 | Not Found |
| 409 | Conflict — duplicate entry |
| 422 | Unprocessable Entity |
| 429 | Too Many Requests — rate limited |
| 500 | Internal Server Error |

## Rate Limiting

- **Default**: 100 requests per minute per IP
- **Auth endpoints**: 10 requests per minute per IP
- Headers returned: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

## Pagination

All list endpoints support pagination:
```http
GET /api/orders?page=1&limit=20&sortBy=createdAt&sortOrder=DESC
```

## API Module Groups

| Module | Base Path | Description |
|--------|-----------|-------------|
| Auth | `/api/auth` | Login, register, refresh, logout |
| Orders | `/api/orders` | Order CRUD, status, tracking |
| Restaurants | `/api/branches` | Restaurant/branch management |
| Menus | `/api/menus` | Menu items, categories, variants |
| Tiffin | `/api/tiffin` | Subscription meal management |
| Users | `/api/users` | Customer management |
| Payments | `/api/payments` | Razorpay integration, refunds |
| Notifications | `/api/notifications` | Email, SMS, push |
| HRMS | `/api/hrms` | Employee, attendance, payroll |
| CMS | `/api/cms` | Blogs, pages, sliders |
| Marketing | `/api/marketing` | Offers, coupons, rewards |
| Analytics | `/api/analytics` | Revenue, orders, customer stats |
| Health | `/api/health` | System health check |

## Health Check

```http
GET /api/health
```

Response:
```json
{
  "status": "ok",
  "info": {
    "database": { "status": "up" },
    "redis": { "status": "up" }
  },
  "details": {
    "database": { "status": "up", "responseTime": "2ms" }
  }
}
```
