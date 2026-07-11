# AI Chat Management Architecture

## Overview
The AI Chat Management module provides a unified chatbot interface for customers and an administrative configuration panel for system operators. It is designed to run locally using a robust rules-based engine and optionally scale to production using configurable LLM providers (e.g., OpenAI, Gemini, Claude).

## Features
- **Configurable LLM Providers**: Admins can securely store API keys, configure model preferences, and toggle providers directly from the Admin Portal.
- **Rules-Based Engine (Fallback & Local)**: If no LLM provider is active or if the LLM call fails, the system automatically falls back to a deterministic, regex-based mock engine.
- **Provider Precedence**: Admins can mark a specific provider as "primary". The backend dynamically resolves the active provider on each request.
- **Human Escalation**: Users can request human support. Support requests are routed to the Admin Helpdesk queue.

## Database Design (Prisma)
- `AiProviderConfig`: Stores provider details (name, API key, model, settings).
- `AiChatSession`: Manages the state of an ongoing chat session (tokens, language, timestamps).
- `AiChatMessage`: Logs individual messages (role: user/assistant, content, tokens used).
- `AiSupportRequest`: Stores escalation requests for human intervention.

## Configuration Flow
1. **Admin Portal**: Admin navigates to `Dashboards > Chat & AI > AI Chat Management`.
2. **Provider Setup**: Admin adds a new provider (e.g., `openai`, `gemini`), inputs the API key, and sets it to Active/Primary.
3. **Backend Service**: `AiChatService.sendMessage` checks the `AiProviderConfig` table.
4. **Execution**: If a valid primary provider exists, the backend makes an HTTP request to the respective LLM API. If it fails or no provider is active, it routes to `fallbackRulesEngine`.

## Security
- API keys are securely managed and never exposed to the frontend.
- Provider endpoints are validated server-side.
- The `ai-chat` admin routes are protected by `@ApiBearerAuth()` and require administrative roles.
