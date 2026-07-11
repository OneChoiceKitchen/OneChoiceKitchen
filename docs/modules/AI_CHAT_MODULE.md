# AI Chat & Communication Module — Documentation

> **Last Updated**: 2026-07-09  
> **Module Type**: Dual-system (AI Customer Chat + Internal Staff Chat)

---

## Overview

OneChoiceKitchen provides two completely **independent** chat systems:

1. **AI Customer Chat** — AI-powered assistant for customers on the web/mobile portal
2. **Internal Chat** — Private messaging between admin, partner, rider, and support staff

> ⚠️ **Critical Rule**: Public/customer users can NEVER directly contact Admin, Partner, or Rider users. The AI chat is the only public-facing channel.

---

## System 1: AI Customer Chat

### Flow

```
Customer types message
  → POST /api/ai-chat/send { sessionToken, message }
  → Check AiProviderConfig for active provider
  → If provider active: call real AI API (OpenAI/Gemini/etc.)
  → If no active provider: run rules engine (AiBotRule matching)
  → Store response in AiChatMessage
  → Customer receives AI response
  → If escalated: forward to support agent via internal chat
```

### AI Provider Configuration (Admin-Managed)

```
Admin → Chat & AI → AI Chat Management → Providers tab
  ↓
1. Click "+ Add Provider"
2. Select: OpenAI | Gemini | Anthropic | Custom
3. Paste API Key
4. Select model (e.g. gpt-4o-mini, gemini-1.5-flash)
5. Click Activate → chatbot uses real AI immediately
6. Deactivate → falls back to rules engine
```

Only **one** provider can be active at a time.

### Rules Engine (Mock Mode)

When no AI provider is configured/active:
- System queries `AiBotRule` table sorted by `priority DESC`
- Each rule has `keywords` (JSON array) — if any keyword found in user message (case-insensitive), `response` is returned
- Catch-all rule (empty keywords) returns default fallback message

**Admin manages rules at**: Chat & AI → AI Chat Management → Bot Rules tab

### Chat Widget (Customer Web)

The customer-facing chat widget is rendered in `apps/web`. It:
- Creates/resumes a session via `sessionToken` stored in `localStorage`
- Connects to `/api/ai-chat` endpoints
- Shows typing indicator, message history, escalation button

---

## System 2: Internal Chat

### Participants (All Internal)

- Super Admin, Admin, Support Team, Customer Care, Operations Team
- Partners (can only chat with their assigned Admin/Support)
- Riders (direct message with Support/Dispatch)

### Room Types

| Type | Description |
|------|-------------|
| `DIRECT` | 1:1 between any two internal users |
| `GROUP` | Multi-user rooms (e.g. "Operations Team") |
| `SUPPORT` | Ticket-linked rooms escalated from AI chat |

### WebSocket (Socket.IO)

```typescript
// Client connects to:
const socket = io('http://localhost:3000/chat', {
  auth: { token: localStorage.getItem('token') }
});

// Events emitted by server:
socket.on('message:new', (msg) => { ... });
socket.on('message:edited', (msg) => { ... });
socket.on('user:typing', ({ userId, roomId }) => { ... });

// Events sent by client:
socket.emit('message:send', { roomId, content, replyToId? });
socket.emit('typing:start', { roomId });
socket.emit('typing:stop', { roomId });
```

---

## Prisma Models

```
AiChatSession
  id, sessionToken (unique)
  userId? → User (null for anonymous)
  channel: WEB | MOBILE | WHATSAPP
  status: OPEN | RESOLVED | ESCALATED
  assignedTo? → User (human agent after escalation)

AiChatMessage  
  id, sessionId → AiChatSession
  role: USER | BOT | AGENT
  content (long text)
  provider: openai | gemini | anthropic | mock | human

AiProviderConfig
  id, provider, apiKey (encrypted), model
  isActive (Boolean — only one active at a time)
  temperature, maxTokens
  
AiBotRule
  id, name, category
  keywords (JSON array)
  response (text — the bot's reply)
  priority (Int — higher matched first)
  isActive, usageCount

ChatRoom
  id, name, type (DIRECT|GROUP|SUPPORT)
  restaurantId? (for partner-scoped rooms)
  createdById → User

ChatMessage
  id, roomId → ChatRoom
  senderId → User  
  content (text), type (TEXT|IMAGE|FILE|SYSTEM)
  replyToId → ChatMessage (threading)
  isDeleted, deletedAt

ChatParticipant
  roomId → ChatRoom, userId → User
  role: MEMBER | ADMIN | READONLY
  joinedAt

ChatStarredMessage
  userId → User, messageId → ChatMessage
```

---

## API Endpoints

### AI Chat (Customer)

| Method | Path | Auth |
|--------|------|------|
| `POST` | `/api/ai-chat/session` | None (creates anonymous session) |
| `POST` | `/api/ai-chat/send` | SessionToken |
| `POST` | `/api/ai-chat/escalate` | SessionToken |
| `GET` | `/api/ai-chat/history/:token` | SessionToken |

### AI Config (Admin only)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/ai-config/providers` | List providers |
| `POST` | `/api/ai-config/providers` | Add provider |
| `PATCH` | `/api/ai-config/providers/:id/activate` | Activate provider |
| `DELETE` | `/api/ai-config/providers/:id` | Remove provider |
| `GET` | `/api/ai-config/rules` | List bot rules |
| `POST` | `/api/ai-config/rules` | Create rule |
| `PATCH` | `/api/ai-config/rules/:id` | Update rule |
| `DELETE` | `/api/ai-config/rules/:id` | Delete rule |

### Internal Chat (Staff only)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/chat/rooms` | List my rooms |
| `POST` | `/api/chat/rooms` | Create room |
| `GET` | `/api/chat/rooms/:id/messages` | Get messages |
| `POST` | `/api/chat/messages` | Send message |
| `PATCH` | `/api/chat/messages/:id` | Edit message |
| `DELETE` | `/api/chat/messages/:id` | Delete message |

---

## Admin UI Pages

| File | Route | Description |
|------|-------|-------------|
| `AiChatManagementAdmin.tsx` | `ai_chat` | Provider config, bot rules, session history |
| `InternalChatAdmin.tsx` | `internal_chat` | Real-time internal messaging UI |

---

## Local Development

No API keys needed for local development. The rules engine runs automatically.

```bash
# Start API + Admin + Web
.\setup.ps1 start

# Seed some bot rules
pnpm prisma db seed
```

## Production Configuration

1. Admin logs into admin portal
2. Goes to **Chat & AI → AI Chat Management → Providers**
3. Adds OpenAI API key (or Gemini, etc.)
4. Clicks **Activate**
5. Chat widget on website immediately uses real AI

All configuration is admin-panel-driven — no code deployment needed.
