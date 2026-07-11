---
name: ai-chat
description: >
  AI Chat & Internal Communication module for OneChoiceKitchen.
  Load when implementing chatbots, AI provider configuration, internal messaging,
  or chat widget integration. Covers provider management, mock/rules engine,
  WebSocket real-time messaging, and admin configuration panel.
---

# AI Chat & Communication Module Skill

## Two Independent Systems

### 1. AI Chat (Customer-Facing)
- Public widget on the OneChoiceKitchen web portal
- AI engine: Mock/Rules-based (always works) + Real AI (when API key active)
- Admin enables AI providers from **Admin → AI Chat Management** page
- Customers NEVER contact Admin/Partner/Rider directly

### 2. Internal Chat (Staff-Only)
- Private messaging between: Admin, Super Admin, Support, Operations, Partner, Rider
- Real-time via WebSocket (Socket.IO gateway in NestJS)
- Role-based room creation and visibility

## AI Provider Configuration (Admin)

```
Admin → AI Chat Management → Providers Tab
  - List providers (OpenAI, Gemini, Anthropic, custom)
  - Paste API key → Click Activate
  - Active provider drives real AI responses
  - When no active provider → fallback to rules engine
```

Stored in `AiProviderConfig` model:
- `provider`, `apiKey` (encrypted), `model`, `isActive`, `temperature`, `maxTokens`

## Routes (NestJS)

| Method | Path | Purpose |
|--------|------|---------|
| GET    | `/api/ai-chat/sessions` | All sessions (admin) |
| POST   | `/api/ai-chat/send` | Send message + get AI response |
| POST   | `/api/ai-chat/escalate` | Escalate to human agent |
| GET    | `/api/ai-config/providers` | List AI providers (admin) |
| POST   | `/api/ai-config/providers` | Add/update provider (admin) |
| PATCH  | `/api/ai-config/providers/:id/activate` | Activate provider (admin) |
| GET    | `/api/chat/rooms` | Internal chat rooms |
| POST   | `/api/chat/rooms` | Create room |
| POST   | `/api/chat/messages` | Send internal message |

## Prisma Models

| Model | Purpose |
|-------|---------|
| `AiChatSession` | Customer AI chat sessions |
| `AiChatMessage` | Messages in AI sessions |
| `AiProviderConfig` | Configured AI providers + keys |
| `AiBotRule` | Rules-based engine rules (keyword → response) |
| `ChatRoom` | Internal chat rooms |
| `ChatMessage` | Internal messages |
| `ChatParticipant` | Room membership |
| `ChatCannedResponse` | Pre-written responses for agents |

## Mock/Rules Engine Fallback

When no AI provider is active, the bot uses `AiBotRule`:
- Matches `keywords` (JSON array) against user message
- Returns `response` for matched rule
- Ordered by `priority` (higher = matched first)
- Default catch-all rule returns a polite "I'll get a human to help" message

## Admin UI Pages

| File | Route |
|------|-------|
| `AiChatManagementAdmin.tsx` | `ai_chat` |
| `InternalChatAdmin.tsx` | `internal_chat` |

## Key Rules

1. **API Key Security**: Keys stored encrypted; never returned to frontend in clear text.
2. **Escalation**: Always provide escalation path to human agent.
3. **Public Isolation**: AI chat widget has no access to internal chat rooms.
4. **Local Dev**: Mock rules engine always available — no external keys needed.
5. **Production**: Admin activates provider from Admin panel; chatbot upgrades automatically.
