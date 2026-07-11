# Environment Variables Reference

## Overview

All environment variables are loaded from `.env` (local) or set in deployment environment.  
**Never commit actual secrets to Git.**

---

## API (.env in workspace root)

### Database
```env
DATABASE_URL="file:./dev.db"                          # SQLite (local dev)
# DATABASE_URL="postgresql://user:pass@host:5432/db"  # PostgreSQL (Docker/prod)
```

### Authentication
```env
JWT_SECRET="your-super-secret-jwt-key-minimum-32-chars"
JWT_REFRESH_SECRET="your-refresh-token-secret"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
```

### Server
```env
NODE_ENV="development"    # development | production
PORT=3000
CORS_ORIGIN="http://localhost:4208,http://localhost:4205,http://localhost:4206,http://localhost:4207"
API_PREFIX="/api"
```

### Redis
```env
REDIS_HOST="localhost"
REDIS_PORT=6379
REDIS_PASSWORD=""          # empty for local dev
REDIS_URL="redis://localhost:6379"
```

### Email (MailDev for dev, SendGrid for production)
```env
MAIL_HOST="localhost"      # MailDev SMTP host
MAIL_PORT=1025             # MailDev SMTP port
MAIL_USER=""               # empty for MailDev
MAIL_PASS=""               # empty for MailDev
MAIL_FROM="noreply@onechoicekitchen.com"
# Production:
# SENDGRID_API_KEY="SG.xxxxxxxxxxxx"
```

### SMS (MSG91)
```env
MSG91_AUTH_KEY="your-msg91-auth-key"
MSG91_SENDER_ID="OCKINC"
MSG91_TEMPLATE_ID_OTP="your-otp-template-id"
```

### Payments (Razorpay)
```env
RAZORPAY_KEY_ID="rzp_test_xxxxxxxxxx"
RAZORPAY_KEY_SECRET="your-razorpay-secret"
RAZORPAY_WEBHOOK_SECRET="your-webhook-secret"
```

### Google Maps
```env
GOOGLE_MAPS_API_KEY="AIzaSyxxxxxxxxxxxxxxxxxx"
```

### Push Notifications (FCM)
```env
FCM_SERVER_KEY="your-firebase-server-key"
FCM_PROJECT_ID="onechoicekitchen"
```

### Storage (for images)
```env
# AWS S3
AWS_ACCESS_KEY_ID="AKIAXXXXXXXXXX"
AWS_SECRET_ACCESS_KEY="your-aws-secret"
AWS_REGION="ap-south-1"
AWS_S3_BUCKET="onechoicekitchen-uploads"
# OR Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="xxxxxxxxxxxx"
CLOUDINARY_API_SECRET="xxxxxxxxxxxx"
```

### WhatsApp (optional)
```env
WHATSAPP_API_URL="https://api.whatsapp.com"
WHATSAPP_API_TOKEN="your-token"
WHATSAPP_PHONE_NUMBER_ID="your-phone-id"
```

---

## Frontend Apps

All Next.js apps use `NEXT_PUBLIC_` prefix for client-side vars.

```env
# Required in all apps
NEXT_PUBLIC_API_URL="http://localhost:3000"   # API base URL
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_xxx"   # Razorpay public key
NEXT_PUBLIC_GOOGLE_MAPS_KEY="AIzaSy..."       # Maps API key

# Optional analytics
NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"             # Google Analytics
NEXT_PUBLIC_HOTJAR_ID="xxxxxxx"              # Hotjar

# PWA (mobile apps only)
NEXT_PUBLIC_VAPID_PUBLIC_KEY="your-vapid-public-key"
```

---

## Docker (.env.docker)

```env
# Override DATABASE_URL for Docker PostgreSQL
DATABASE_URL="postgresql://postgres:postgres@ock-postgres:5432/onechoice_prod"
REDIS_HOST="ock-redis"
REDIS_URL="redis://ock-redis:6379"
MAIL_HOST="ock-maildev"
MAIL_PORT=1025
```

---

## Production Checklist

Before deploying to production, verify these are set:

- [ ] `DATABASE_URL` → PostgreSQL connection with SSL
- [ ] `JWT_SECRET` → strong random 64+ char string
- [ ] `RAZORPAY_KEY_ID` → live key (not test)
- [ ] `RAZORPAY_KEY_SECRET` → live secret
- [ ] `FCM_SERVER_KEY` → production Firebase
- [ ] `GOOGLE_MAPS_API_KEY` → restricted to your domain
- [ ] `AWS_*` or `CLOUDINARY_*` → production storage
- [ ] `MSG91_AUTH_KEY` → production SMS
- [ ] `CORS_ORIGIN` → production domain list only
- [ ] `NODE_ENV` = `production`

---

## Generating Secure Secrets

```bash
# Generate a random JWT_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Or using openssl
openssl rand -hex 64
```
