# OneChoiceKitchen Service Ports

> **This is the canonical port reference.** Always update this file when any port is added, changed, or removed.
> Also update `setup.ps1` and `profiles.md` accordingly.

## Application Ports

| Service | Nx App Name | Port | Protocol | Notes |
|---------|-------------|------|----------|-------|
| NestJS Backend API | `api` | **3000** | HTTP/WS | REST + WebSocket |
| Admin Portal | `admin-portal` | **4205** | HTTP | Internal use |
| Partner Portal | `partner-portal` | **4206** | HTTP | Restaurant partners |
| Rider Portal | `rider-portal` | **4207** | HTTP | Delivery riders |
| Customer Web | `web` | **4208** | HTTP | Main customer app |
| Customer Mobile | `customer-mobile` | **4210** | HTTP | Customer mobile |
| Mobile App (Legacy) | `mobile-app` | **4211** | HTTP | Shared mobile |
| Rider Mobile | `rider-mobile` | **4212** | HTTP | Rider mobile |

## Infrastructure / Dev Tool Ports

| Service | Port | Protocol | Notes |
|---------|------|----------|-------|
| Maildev SMTP | **1025** | SMTP | Email testing |
| Maildev UI | **1080** | HTTP | Email viewer |
| Node Debugger | **9229** | TCP | VS Code debug |
| PostgreSQL | **5432** | TCP | Docker Compose |
| Redis | **6379** | TCP | Docker Compose |
| Prisma Studio | **5555** | HTTP | `npx prisma studio` |

## Port Ranges

| Range | Purpose |
|-------|---------|
| 3000–3999 | Backend services (API, workers) |
| 4200–4299 | Frontend applications |
| 5000–5999 | Dev tools (Prisma Studio, etc.) |
| 1000–1999 | External tool emulators (Maildev) |

## Next Available Port

- Next frontend port: **4213** (after rider-mobile)
- Next backend port: **3001** (for additional workers/microservices)

