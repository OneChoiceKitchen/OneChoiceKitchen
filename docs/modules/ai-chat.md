# AI Chatbot Module - Technical Documentation

## 1. Overview
The AI Chatbot module in OneChoiceKitchen provides an intelligent, automated conversational interface for customers to interact with the platform. It handles common queries, support requests, order tracking, and general FAQs seamlessly, transitioning to human agents only when necessary. The module is fully configurable via the Admin Panel, supporting both an internal rules-based engine and external real AI providers (OpenAI, Gemini, Claude, etc.).

## 2. Architecture
The Chatbot module employs a hybrid processing architecture:
1.  **AI Provider Tier (Primary Engine):** 
    - If configured and marked active by the admin, external LLMs (e.g., OpenAI, Gemini, Claude) are invoked first to generate natural, conversational responses based on the knowledge base and user prompt.
2.  **Rules-Based / Mock Engine (Fallback/Secondary Engine):**
    - Acts as a fallback if the AI Provider tier is unavailable, misconfigured, or if no API keys are provided.
    - Processes incoming messages against predefined regex patterns (Intents) and executes specific handlers (e.g., `handleOrderStatus`, `handleDeliveryArea`).
3.  **Human Escalation:** 
    - If both engines fail to resolve the query, or if the user explicitly requests human assistance, the chat session is escalated to the `AiSupportRequest` queue for admin intervention.

## 3. Database Design (Prisma Schema)

The core data models are located in `prisma/schema.prisma` under the "AI Chat & Support Models" section:

### `AiProviderConfig`
Stores external AI provider credentials and configurations.
- `id` (String)
- `provider` (String) - Enum representation (e.g., 'OPENAI', 'GEMINI', 'CLAUDE')
- `displayName` (String)
- `model` (String) - AI Model variant (e.g., 'gpt-4o', 'gemini-1.5-pro')
- `apiKey` (String) - Encrypted/Secure API token for the provider.
- `isActive` (Boolean) - Toggle for enabling/disabling the provider.
- `isPrimary` (Boolean) - Indicates which active provider is currently used.
- `usageCount` (Int) - Tracks total number of LLM invocations.
- `lastUsedAt` (DateTime) - Timestamp of last usage.

### `AiChatSession`
Represents an ongoing chat conversation with a user.
- `id` (String)
- `sessionToken` (String) - Unique session identifier.
- `userId` (String?) - Linked to a specific customer if logged in.
- `channel` (String) - Channel origin (e.g., 'WEB', 'MOBILE_APP', 'WHATSAPP').
- `language` (String) - ISO language code.
- `status` (String) - Status of the session ('ACTIVE', 'ESCALATED', 'CLOSED').
- `messages` (Relation) - One-to-many relationship with `AiChatMessage`.
- `supportRequest` (Relation) - One-to-one relationship with `AiSupportRequest`.

### `AiChatMessage`
Stores individual messages within a session.
- `id` (String)
- `sessionId` (String)
- `role` (String) - Sender role ('USER', 'ASSISTANT', 'SYSTEM').
- `content` (String) - Message body.
- `intent` (String?) - Identified user intent.
- `confidence` (Float?) - Confidence score of the identified intent.
- `metadata` (String?) - JSON string containing additional UI elements like quick replies.

### `AiKnowledgeBase`
Stores the FAQ and automated knowledge entries used by the rules-based engine and the AI context.
- `id` (String)
- `category` (String)
- `question` (String) - Trigger phrase or question.
- `answer` (String) - Prepared response.
- `keywords` (String) - JSON array of trigger keywords.
- `priority` (Int) - Matching priority weight.
- `isActive` (Boolean) - Enable/disable flag.
- `usageCount` (Int) - Usage tracking metric.

### `AiCannedResponse`
Pre-defined templates used by human agents when responding to escalated requests.
- `id` (String)
- `title` (String)
- `shortCode` (String) - Quick-type shortcut.
- `content` (String)
- `category` (String?)

### `AiSupportRequest`
Represents an escalated chat session awaiting human support.
- `id` (String)
- `sessionId` (String) - Linked Chat Session.
- `customerId` (String?)
- `status` (String) - Lifecycle status ('PENDING', 'ACCEPTED', 'ASSIGNED', 'CLOSED', 'REJECTED').
- `reason` (String?) - Auto-summarized reason for escalation.
- `assignedToId` (String?) - Admin/Agent handling the request.

## 4. Functionality & Workflows

### 4.1 Message Processing Flow
1. A user sends a message via the frontend Chat Widget.
2. The `AiChatGateway` (WebSocket) or `AiChatController` (REST API) receives the message.
3. The system checks `AiProviderConfig` for an active, primary AI Provider.
    - **Scenario A (Real AI Active):** The system passes the user message, session history, and active `AiKnowledgeBase` context to the selected LLM (e.g., via OpenAI SDK). The LLM formulates a response, determining the intent and next steps.
    - **Scenario B (Mock/Rules Engine Active):** The system evaluates the user message against predefined regex `INTENT_PATTERNS` (e.g., `ORDER_STATUS`, `MENU_INFO`). It executes the corresponding handler to fetch real-time data from the DB and formats a response.
4. The response is saved to `AiChatMessage` and emitted back to the frontend.

### 4.2 Admin Configuration
The entire system is managed via the **Admin Portal -> Explore Workspace -> AI Chat Management**:
- **Providers Tab:** Admins can input API keys for OpenAI, Gemini, or Claude. They can toggle providers as "Active" or "Primary". If no provider is active, the system automatically runs locally using the Mock/Rules-Based Engine.
- **Knowledge Base Tab:** Admins can define custom trigger questions, answers, and keywords to train the rules engine and provide context to the LLM.
- **Analytics Tab:** Provides usage statistics, top intents, resolution rates, and escalation metrics.
- **Support Requests Tab:** Admins can intercept and respond to chats that the AI was unable to resolve.

## 5. Extensibility
To add a new intent to the rules-based engine:
1. Open `apps/api/src/chat/ai-chat.service.ts`.
2. Add a new object to the `INTENT_PATTERNS` array with the `intent` name, an array of `patterns` (regex), and a `handler` function.
3. Implement the `handler` function within `AiChatService` to retrieve relevant data and return an `AiResponse`.
