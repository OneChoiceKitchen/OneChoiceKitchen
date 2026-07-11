# ADR-006: Authentication Strategy

**Status**: Accepted
**Date**: 2026-07-01

---

## Decision

Use NextAuth.js for frontend session management with JWT tokens issued by the NestJS backend for API authentication.

---

## Context

OneChoiceKitchen has 5 distinct user roles (Customer, Partner, Rider, Admin, Super-Admin), each accessing different portals. Authentication must be secure, role-aware, and work across multiple Next.js apps.

---

## Problem

Authentication requirements:
- Multiple roles with different permissions
- Multiple separate Next.js applications
- Mobile app support (no cookie-based sessions)
- OTP-based login for customers (phone number)
- Email/password for partners and admin

---

## Options Considered

### Option 1: Session-based auth (cookies only)
- ❌ Does not work for mobile apps
- ❌ Harder to share sessions across subdomains

### Option 2: Pure JWT (no refresh tokens)
- ✅ Stateless
- ❌ Cannot invalidate tokens (security risk)
- ❌ Long-lived tokens are dangerous

### Option 3: NextAuth.js + JWT with Refresh Tokens (selected)
- ✅ NextAuth.js handles session UI for web apps
- ✅ NestJS issues short-lived JWTs (15 min) + refresh tokens (7 days)
- ✅ Refresh tokens stored in HttpOnly cookies
- ✅ Mobile apps use JWT directly (no cookies)
- ✅ Role claim in JWT payload

---

## Final Decision

**Frontend (Next.js)**: NextAuth.js with JWT strategy
**Backend (NestJS)**: Passport.js + JWT guard + Refresh token rotation

Token structure:
`
{
  sub: userId,
  role: 'CUSTOMER' | 'PARTNER' | 'RIDER' | 'ADMIN' | 'SUPER_ADMIN',
  exp: (15 minutes from now)
}
`

---

## Consequences

### Positive
- Stateless API — horizontal scaling without sticky sessions
- Role-based access control via JWT claim
- Mobile apps work with same JWT

### Negative / Trade-offs
- Refresh token rotation adds complexity
- Must blacklist tokens on logout (Redis)
- CSRF protection needed for cookie-based refresh

### Rules That Follow From This Decision
- Access token expires in 15 minutes — always
- Refresh token stored in HttpOnly cookie — never localStorage
- All API endpoints protected by JwtAuthGuard by default
- @Public() decorator explicitly marks public endpoints
- Never log or expose JWT tokens in error messages
