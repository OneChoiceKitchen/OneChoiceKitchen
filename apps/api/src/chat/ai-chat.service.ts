import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface AiResponse {
  content: string;
  intent: string;
  confidence: number;
  quickReplies?: string[];
  metadata?: Record<string, any>;
}

// ── Intent patterns (rules-based engine) ──────────────────────────────────────
const INTENT_PATTERNS: Array<{
  intent: string;
  patterns: RegExp[];
  handler: (service: AiChatService, sessionUserId: string | null, message: string) => Promise<AiResponse>;
}> = [
  {
    intent: 'ORDER_STATUS',
    patterns: [/order status|where is my order|track.*order|order.*track|my order/i],
    handler: async (s, uid, msg) => s.handleOrderStatus(uid),
  },
  {
    intent: 'DELIVERY_STATUS',
    patterns: [/delivery|rider|when.*arrive|delivery.*time|eta/i],
    handler: async (s, uid, msg) => s.handleDeliveryStatus(uid),
  },
  {
    intent: 'BOOKING_STATUS',
    patterns: [/booking|hall|catering|party.*booking|event.*booking/i],
    handler: async (s, uid, msg) => s.handleBookingStatus(uid),
  },
  {
    intent: 'SUBSCRIPTION_STATUS',
    patterns: [/subscription|tiffin.*plan|meal plan|pause.*subscription|cancel.*subscription/i],
    handler: async (s, uid, msg) => s.handleSubscriptionStatus(uid),
  },
  {
    intent: 'REFUND_STATUS',
    patterns: [/refund|money back|cancelled.*payment|payment.*refund/i],
    handler: async (s, uid, msg) => s.handleRefundStatus(uid),
  },
  {
    intent: 'PAYMENT',
    patterns: [/payment|pay|wallet|upi|net banking|card|cod/i],
    handler: async (s, uid, msg) => s.handlePaymentQuery(),
  },
  {
    intent: 'RAISE_TICKET',
    patterns: [/raise.*ticket|create.*ticket|complaint|issue|problem|report/i],
    handler: async (s, uid, msg) => s.handleRaiseTicket(uid),
  },
  {
    intent: 'TICKET_STATUS',
    patterns: [/ticket status|my ticket|ticket.*update|support ticket/i],
    handler: async (s, uid, msg) => s.handleTicketStatus(uid),
  },
  {
    intent: 'HUMAN_AGENT',
    patterns: [/human|agent|person|talk.*someone|speak.*someone|customer.*care|live.*chat/i],
    handler: async (s, uid, msg) => s.handleHumanRequest(),
  },
  {
    intent: 'MENU_INFO',
    patterns: [/menu|food|what.*serve|available|item|dish|veg|non-veg/i],
    handler: async (s, uid, msg) => s.handleMenuInfo(),
  },
  {
    intent: 'OFFERS',
    patterns: [/offer|discount|coupon|promo|deal|cashback/i],
    handler: async (s, uid, msg) => s.handleOffers(),
  },
  {
    intent: 'DELIVERY_AREA',
    patterns: [/delivery area|service area|do you deliver|pin code|pincode|serviceable/i],
    handler: async (s, uid, msg) => s.handleDeliveryArea(),
  },
  {
    intent: 'CONTACT',
    patterns: [/contact|phone|email|address|reach|customer support number/i],
    handler: async (s, uid, msg) => s.handleContactInfo(),
  },
  {
    intent: 'GREETING',
    patterns: [/^(hi|hello|hey|good morning|good afternoon|good evening|namaste|hii|helo)$/i],
    handler: async (s, uid, msg) => s.handleGreeting(uid !== null),
  },
  {
    intent: 'FAREWELL',
    patterns: [/bye|goodbye|thank you|thanks|ok bye|see you|take care/i],
    handler: async (s, uid, msg) => s.handleFarewell(),
  },
];

@Injectable()
export class AiChatService {
  private readonly logger = new Logger(AiChatService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ── Session Management ────────────────────────────────────────────────────

  async createSession(userId?: string, channel = 'WEB', language = 'en') {
    const session = await this.prisma.aiChatSession.create({
      data: { userId, channel, language, status: 'ACTIVE' },
    });

    // Send welcome message
    const welcome = await this.getWelcomeMessage(userId !== null && userId !== undefined);
    await this.prisma.aiChatMessage.create({
      data: {
        sessionId: session.id,
        role: 'ASSISTANT',
        content: welcome.content,
        intent: 'WELCOME',
        confidence: 1,
        metadata: JSON.stringify({ quickReplies: welcome.quickReplies }),
      },
    });

    return { session, welcomeMessage: welcome };
  }

  async getSession(sessionToken: string) {
    return this.prisma.aiChatSession.findUnique({
      where: { sessionToken },
      include: { messages: { orderBy: { createdAt: 'asc' }, take: 100 } },
    });
  }

  async getSessionHistory(sessionId: string) {
    return this.prisma.aiChatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
    });
  }

  // ── Main message processing ────────────────────────────────────────────────

  async processMessage(sessionId: string, userMessage: string, userId?: string): Promise<AiResponse> {
    const session = await this.prisma.aiChatSession.findUnique({ where: { id: sessionId } });
    if (!session) throw new Error('Session not found');

    // Store user message
    await this.prisma.aiChatMessage.create({
      data: { sessionId, role: 'USER', content: userMessage },
    });

    // Lookup active AI provider
    const primaryProvider = await this.prisma.aiProviderConfig.findFirst({
      where: { isActive: true, isPrimary: true },
    });

    let response: AiResponse;

    if (primaryProvider?.apiKey && primaryProvider.isActive) {
      // Try real LLM first, fall back to rules engine on failure
      try {
        response = await this.callLLM(primaryProvider, userMessage, sessionId, userId);
        // Update usage stats
        await this.prisma.aiProviderConfig.update({
          where: { id: primaryProvider.id },
          data: { usageCount: { increment: 1 }, lastUsedAt: new Date() },
        });
      } catch (err) {
        this.logger.warn(`LLM call failed (${primaryProvider.provider}): ${(err as Error).message} — falling back to rules engine`);
        response = await this.classifyAndRespond(userMessage, userId || null);
      }
    } else {
      // Rules-based engine
      response = await this.classifyAndRespond(userMessage, userId || null);
    }

    // Store assistant response
    await this.prisma.aiChatMessage.create({
      data: {
        sessionId,
        role: 'ASSISTANT',
        content: response.content,
        intent: response.intent,
        confidence: response.confidence,
        metadata: JSON.stringify({ quickReplies: response.quickReplies }),
      },
    });

    // Update knowledge base usage count
    if (response.intent && response.intent !== 'UNKNOWN') {
      await this.updateKnowledgeBaseUsage(response.intent).catch(() => {});
    }

    return response;
  }

  // ── LLM Integration ───────────────────────────────────────────────────────

  private async callLLM(
    provider: any,
    userMessage: string,
    sessionId: string,
    userId?: string,
  ): Promise<AiResponse> {
    const settings = JSON.parse(provider.settings || '{}');
    const history = await this.prisma.aiChatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
      take: 20,
    });

    const systemPrompt = settings.systemPrompt || `You are a helpful customer support assistant for OneChoiceKitchen, 
an enterprise food delivery platform in India. You help customers with orders, tiffin subscriptions, 
catering, party bookings, refunds, and general inquiries. 
Be friendly, concise, and helpful. Respond in the same language the user uses.
IMPORTANT: Never expose internal staff details, other customers' data, or pricing strategies.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.map((m) => ({ role: m.role.toLowerCase(), content: m.content })),
      { role: 'user', content: userMessage },
    ];

    const maxTokens = settings.maxTokens || 500;
    const temperature = settings.temperature ?? 0.7;

    switch (provider.provider) {
      case 'OPENAI': {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${provider.apiKey}` },
          body: JSON.stringify({ model: provider.model || 'gpt-4o-mini', messages, max_tokens: maxTokens, temperature }),
        });
        const data: any = await res.json();
        if (!res.ok) throw new Error(data.error?.message || 'OpenAI API error');
        return {
          content: data.choices[0].message.content,
          intent: 'LLM_RESPONSE',
          confidence: 0.95,
          quickReplies: this.extractQuickReplies(data.choices[0].message.content),
        };
      }

      case 'GEMINI': {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${provider.model || 'gemini-1.5-flash'}:generateContent?key=${provider.apiKey}`;
        const body = {
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: history
            .filter((m) => m.role !== 'SYSTEM')
            .map((m) => ({ role: m.role === 'ASSISTANT' ? 'model' : 'user', parts: [{ text: m.content }] }))
            .concat([{ role: 'user', parts: [{ text: userMessage }] }]),
          generationConfig: { maxOutputTokens: maxTokens, temperature },
        };
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const data: any = await res.json();
        if (!res.ok) throw new Error(data.error?.message || 'Gemini API error');
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        return { content: text, intent: 'LLM_RESPONSE', confidence: 0.95, quickReplies: this.extractQuickReplies(text) };
      }

      case 'ANTHROPIC': {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': provider.apiKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: provider.model || 'claude-3-haiku-20240307',
            system: systemPrompt,
            messages: messages.filter((m) => m.role !== 'system'),
            max_tokens: maxTokens,
          }),
        });
        const data: any = await res.json();
        if (!res.ok) throw new Error(data.error?.message || 'Anthropic API error');
        const text = data.content?.[0]?.text || '';
        return { content: text, intent: 'LLM_RESPONSE', confidence: 0.95, quickReplies: this.extractQuickReplies(text) };
      }

      case 'CUSTOM': {
        const res = await fetch(provider.apiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${provider.apiKey}` },
          body: JSON.stringify({ messages, max_tokens: maxTokens, temperature }),
        });
        const data: any = await res.json();
        if (!res.ok) throw new Error('Custom API error');
        const text = data.choices?.[0]?.message?.content || data.text || data.response || '';
        return { content: text, intent: 'LLM_RESPONSE', confidence: 0.9, quickReplies: [] };
      }

      default:
        throw new Error(`Unsupported provider: ${provider.provider}`);
    }
  }

  private extractQuickReplies(text: string): string[] {
    // No obvious pattern — return standard follow-ups
    return [];
  }

  // ── Rules Engine ──────────────────────────────────────────────────────────

  async classifyAndRespond(message: string, userId: string | null): Promise<AiResponse> {
    // First check knowledge base for matching FAQ
    const kbMatch = await this.searchKnowledgeBase(message);
    if (kbMatch) {
      return {
        content: kbMatch.answer,
        intent: kbMatch.category,
        confidence: 0.85,
        quickReplies: ['Ask another question', 'Raise a ticket', 'Talk to human'],
      };
    }

    // Match intent patterns
    for (const { intent, patterns, handler } of INTENT_PATTERNS) {
      if (patterns.some((p) => p.test(message))) {
        const result = await handler(this, userId, message);
        return { ...result, intent };
      }
    }

    // Fallback
    return this.handleFallback();
  }

  private async searchKnowledgeBase(message: string) {
    const entries = await this.prisma.chatbotKnowledge.findMany({
      where: { isActive: true },
      orderBy: { priority: 'desc' },
    });

    const lowerMsg = message.toLowerCase();
    for (const entry of entries) {
      const keywords: string[] = JSON.parse(entry.keywords || '[]');
      if (keywords.some((kw) => lowerMsg.includes(kw.toLowerCase()))) {
        await this.prisma.chatbotKnowledge.update({
          where: { id: entry.id },
          data: { usageCount: { increment: 1 } },
        });
        return entry;
      }
    }
    return null;
  }

  private async updateKnowledgeBaseUsage(intent: string) {
    // placeholder — track per-intent analytics
  }

  // ── Intent Handlers ───────────────────────────────────────────────────────

  async handleGreeting(isLoggedIn: boolean): Promise<AiResponse> {
    return {
      content: isLoggedIn
        ? "Hello! 👋 Welcome back! How can I help you today? You can ask me about your orders, deliveries, bookings, or subscriptions."
        : "Hello! 👋 Welcome to OneChoiceKitchen! I'm your virtual assistant. How can I help you today?",
      intent: 'GREETING',
      confidence: 1,
      quickReplies: ['Track my order', 'My bookings', 'Raise a ticket', 'View offers', 'Talk to human'],
    };
  }

  async handleFarewell(): Promise<AiResponse> {
    return {
      content: "Thank you for reaching out! 😊 Have a great day! Feel free to come back anytime if you need help.",
      intent: 'FAREWELL',
      confidence: 1,
    };
  }

  async handleOrderStatus(userId: string | null): Promise<AiResponse> {
    if (!userId) {
      return {
        content: "To check your order status, please log in to your account first. Once logged in, I can show you real-time updates for all your orders.",
        intent: 'ORDER_STATUS',
        confidence: 0.9,
        quickReplies: ['Log in', 'Track without account', 'Talk to human'],
      };
    }

    try {
      const orders = await this.prisma.order.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 3,
        include: { items: { include: { menuItem: { select: { name: true } } } } },
      });

      if (orders.length === 0) {
        return {
          content: "You don't have any recent orders. Browse our menu to place your first order! 🍽️",
          intent: 'ORDER_STATUS',
          confidence: 0.9,
          quickReplies: ['View menu', 'View offers'],
        };
      }

      const latest = orders[0];
      const statusEmoji: Record<string, string> = {
        PENDING: '🕐', CONFIRMED: '✅', PREPARING: '👨‍🍳',
        READY: '📦', PICKED_UP: '🛵', DELIVERED: '🎉', CANCELLED: '❌',
      };
      const emoji = statusEmoji[latest.status] || '📋';

      const lines = orders.map((o) =>
        `${statusEmoji[o.status] || '📋'} **Order #${o.id.slice(-6).toUpperCase()}** — ₹${o.totalAmount} — ${o.status}`,
      );

      return {
        content: `Here are your recent orders:\n\n${lines.join('\n')}\n\nLatest order ${emoji} is **${latest.status}**.`,
        intent: 'ORDER_STATUS',
        confidence: 0.95,
        quickReplies: ['Track delivery', 'Raise issue', 'View all orders'],
      };
    } catch {
      return {
        content: "I'm having trouble fetching your order details right now. Please try again in a moment.",
        intent: 'ORDER_STATUS',
        confidence: 0.5,
        quickReplies: ['Try again', 'Talk to human'],
      };
    }
  }

  async handleDeliveryStatus(userId: string | null): Promise<AiResponse> {
    if (!userId) {
      return {
        content: "Please log in to track your delivery in real-time. Our riders are equipped with GPS tracking so you can see exactly where your order is!",
        intent: 'DELIVERY_STATUS',
        confidence: 0.9,
        quickReplies: ['Log in', 'Talk to human'],
      };
    }

    const activeOrder = await this.prisma.order.findFirst({
      where: { userId, status: { in: ['PICKED_UP', 'READY', 'PREPARING'] } },
      include: { items: { take: 1, include: { menuItem: { select: { name: true } } } } },
      orderBy: { createdAt: 'desc' },
    }).catch(() => null);

    if (!activeOrder) {
      return {
        content: "You don't have any active deliveries right now. Your most recent order may have already been delivered! 🎉",
        intent: 'DELIVERY_STATUS',
        confidence: 0.9,
        quickReplies: ['Check order history', 'Place new order'],
      };
    }

    return {
      content: `🛵 Your order is **${activeOrder.status}**! Our rider is on the way. Estimated delivery time is approximately 20-30 minutes. You'll receive updates via SMS/notification.`,
      intent: 'DELIVERY_STATUS',
      confidence: 0.95,
      quickReplies: ['Contact rider support', 'Report issue'],
    };
  }

  async handleBookingStatus(userId: string | null): Promise<AiResponse> {
    if (!userId) {
      return {
        content: "Please log in to view your booking status. We offer catering, hall bookings, and party arrangements!",
        intent: 'BOOKING_STATUS',
        confidence: 0.9,
        quickReplies: ['Log in', 'Learn about bookings'],
      };
    }

    const bookings = await this.prisma.hallBooking.findMany({
      where: { customerId: userId },
      orderBy: { createdAt: 'desc' },
      take: 3,
    }).catch(() => []);

    if (bookings.length === 0) {
      return {
        content: "You don't have any hall or catering bookings yet. We offer:\n• Hall bookings for events & parties\n• Catering for corporate events\n• Custom party arrangements\n\nWould you like to make a booking?",
        intent: 'BOOKING_STATUS',
        confidence: 0.9,
        quickReplies: ['Explore hall bookings', 'Catering inquiry', 'Talk to human'],
      };
    }

    const lines = bookings.map((b) => `📅 **Booking #${b.id.slice(-6).toUpperCase()}** — ${b.eventDate ? new Date(b.eventDate).toLocaleDateString() : 'TBD'} — ${b.status || 'PENDING'}`);
    return {
      content: `Here are your recent bookings:\n\n${lines.join('\n')}`,
      intent: 'BOOKING_STATUS',
      confidence: 0.95,
      quickReplies: ['Make new booking', 'Cancel booking', 'Talk to human'],
    };
  }

  async handleSubscriptionStatus(userId: string | null): Promise<AiResponse> {
    if (!userId) {
      return {
        content: "Log in to manage your meal plan subscriptions. We offer daily tiffin plans and custom meal subscriptions!",
        intent: 'SUBSCRIPTION_STATUS',
        confidence: 0.9,
        quickReplies: ['Log in', 'View subscription plans'],
      };
    }

    const subs = await this.prisma.customerSubscription.findMany({
      where: { userId },
      take: 3,
      orderBy: { createdAt: 'desc' },
    }).catch(() => []);

    if (subs.length === 0) {
      return {
        content: "You don't have any active subscriptions. Our tiffin plans start from just ₹99/day! 🍱",
        intent: 'SUBSCRIPTION_STATUS',
        confidence: 0.9,
        quickReplies: ['View plans', 'Subscribe now'],
      };
    }

    const active = subs.filter((s) => s.status === 'ACTIVE');
    return {
      content: `You have ${active.length} active subscription(s). Status: **${active[0]?.status || 'N/A'}**.`,
      intent: 'SUBSCRIPTION_STATUS',
      confidence: 0.95,
      quickReplies: ['Pause subscription', 'Cancel subscription', 'Upgrade plan'],
    };
  }

  async handleRefundStatus(userId: string | null): Promise<AiResponse> {
    if (!userId) {
      return {
        content: "Log in to check your refund status. Refunds typically process within 5-7 business days.",
        intent: 'REFUND_STATUS',
        confidence: 0.9,
        quickReplies: ['Log in', 'Talk to human'],
      };
    }

    const refunds = await this.prisma.refund.findMany({
      where: { userId },
      take: 3,
      orderBy: { createdAt: 'desc' },
    }).catch(() => []);

    if (refunds.length === 0) {
      return {
        content: "You don't have any pending refunds. If you believe you're owed a refund, please raise a support ticket and our team will assist you.",
        intent: 'REFUND_STATUS',
        confidence: 0.9,
        quickReplies: ['Raise ticket', 'Talk to human'],
      };
    }

    const lines = refunds.map((r) => `💰 **Refund #${r.id.slice(-6).toUpperCase()}** — ₹${r.amount} — ${r.status}`);
    return {
      content: `Your refund requests:\n\n${lines.join('\n')}\n\nRefunds process within 5-7 business days.`,
      intent: 'REFUND_STATUS',
      confidence: 0.95,
      quickReplies: ['Contact support', 'Raise ticket'],
    };
  }

  async handlePaymentQuery(): Promise<AiResponse> {
    return {
      content: "We accept all major payment methods:\n\n💳 Credit/Debit Cards\n📱 UPI (GPay, PhonePe, Paytm)\n🏦 Net Banking\n💵 Cash on Delivery (COD)\n👛 OneChoiceKitchen Wallet\n\nAll payments are secured by Razorpay with end-to-end encryption.",
      intent: 'PAYMENT',
      confidence: 0.95,
      quickReplies: ['Payment failed?', 'Refund query', 'Add money to wallet'],
    };
  }

  async handleRaiseTicket(userId: string | null): Promise<AiResponse> {
    return {
      content: userId
        ? "I'll help you raise a support ticket. Please describe your issue and I'll log it for our team:\n\n📝 **What's the issue?** (e.g., 'Wrong item delivered', 'Didn't receive order', 'Payment issue')"
        : "To raise a ticket, please log in first so we can track your issue and notify you when it's resolved.",
      intent: 'RAISE_TICKET',
      confidence: 0.95,
      quickReplies: userId
        ? ['Wrong item delivered', 'Order not received', 'Payment issue', 'Other']
        : ['Log in', 'Talk to human'],
    };
  }

  async handleTicketStatus(userId: string | null): Promise<AiResponse> {
    if (!userId) {
      return {
        content: "Log in to view the status of your support tickets.",
        intent: 'TICKET_STATUS',
        confidence: 0.9,
        quickReplies: ['Log in'],
      };
    }

    const tickets = await this.prisma.supportTicket.findMany({
      where: { userId },
      take: 3,
      orderBy: { createdAt: 'desc' },
    }).catch(() => []);

    if (tickets.length === 0) {
      return {
        content: "You don't have any support tickets yet. If you have an issue, I can help you raise one!",
        intent: 'TICKET_STATUS',
        confidence: 0.9,
        quickReplies: ['Raise a ticket', 'Talk to human'],
      };
    }

    const lines = tickets.map((t) => `🎫 **#${t.id.slice(-6).toUpperCase()}** — ${t.subject || 'Support Request'} — **${t.status}**`);
    return {
      content: `Your recent tickets:\n\n${lines.join('\n')}`,
      intent: 'TICKET_STATUS',
      confidence: 0.95,
      quickReplies: ['Raise new ticket', 'Talk to human'],
    };
  }

  async handleHumanRequest(): Promise<AiResponse> {
    return {
      content: "I understand you'd like to speak with a human agent. 👤\n\nI'll submit a **Human Support Request** for you. Our team typically responds within:\n• 🔴 High priority: < 15 minutes\n• 🟡 Normal: < 2 hours\n\nWould you like to proceed?",
      intent: 'HUMAN_AGENT',
      confidence: 1,
      quickReplies: ['Yes, request human support', 'No, continue with bot'],
    };
  }

  async handleMenuInfo(): Promise<AiResponse> {
    return {
      content: "We serve a wide variety of delicious options:\n\n🍱 **Tiffin Plans** — Daily home-style meals\n🍕 **A la Carte** — Individual dishes & combos\n🎂 **Catering** — Bulk orders for events\n🏛️ **Hall Bookings** — For parties & celebrations\n\nAll our food is freshly prepared with quality ingredients!",
      intent: 'MENU_INFO',
      confidence: 0.9,
      quickReplies: ['View full menu', 'Tiffin plans', 'Catering', 'Order now'],
    };
  }

  async handleOffers(): Promise<AiResponse> {
    await this.prisma.menuItem.count({ where: {} }).catch(() => 0);
    return {
      content: "🎉 Check out our latest offers!\n\n🏷️ **New Users**: Get ₹50 off on first order (code: WELCOME)\n🔄 **Subscription**: Up to 20% off on monthly tiffin plans\n👥 **Referral**: Earn ₹100 for every friend you refer\n📱 **App-Only**: Exclusive deals on our mobile app\n\nVisit our Offers page for all current promotions!",
      intent: 'OFFERS',
      confidence: 0.9,
      quickReplies: ['View all offers', 'Apply coupon', 'Subscribe & save'],
    };
  }

  async handleDeliveryArea(): Promise<AiResponse> {
    return {
      content: "We currently deliver across multiple areas! 📍\n\nTo check if we deliver to your location:\n1. Enter your pincode on our website\n2. Or provide your address during checkout\n\nDelivery is available 7 days a week from **8 AM to 10 PM**.\nDelivery charges vary by distance and order value.",
      intent: 'DELIVERY_AREA',
      confidence: 0.9,
      quickReplies: ['Check my pincode', 'Delivery charges', 'Talk to human'],
    };
  }

  async handleContactInfo(): Promise<AiResponse> {
    await this.prisma.menuItem.count().catch(() => null);
    return {
      content: "📞 **OneChoiceKitchen Support**\n\n• **Email**: support@onechoicekitchen.com\n• **Phone**: Available on our website\n• **WhatsApp**: Tap the WhatsApp icon on our site\n• **Hours**: 9 AM – 9 PM, 7 days a week\n\nOr I can connect you with a live agent right now!",
      intent: 'CONTACT',
      confidence: 0.9,
      quickReplies: ['Talk to human', 'Raise a ticket', 'WhatsApp'],
    };
  }

  async handleFallback(): Promise<AiResponse> {
    return {
      content: "I'm sorry, I didn't quite understand that. 🤔 I can help you with:\n\n• 📦 Order & delivery tracking\n• 📅 Booking status\n• 🍱 Subscription plans\n• 💰 Payments & refunds\n• 🎫 Support tickets\n• 💬 Talk to a human agent\n\nWhat would you like help with?",
      intent: 'FALLBACK',
      confidence: 0.3,
      quickReplies: ['Track my order', 'My bookings', 'Raise ticket', 'Talk to human'],
    };
  }

  private async getWelcomeMessage(isLoggedIn: boolean): Promise<AiResponse> {
    return {
      content: isLoggedIn
        ? "👋 Hi there! I'm **OneChoiceBot**, your personal assistant. How can I help you today?"
        : "👋 Welcome to **OneChoiceKitchen**! I'm your AI assistant. I can help you with orders, bookings, subscriptions, and more. How can I assist you?",
      intent: 'WELCOME',
      confidence: 1,
      quickReplies: ['Track my order', 'View bookings', 'Offers & deals', 'Raise a ticket', 'Talk to human'],
    };
  }

  // ── Human Support Escalation ───────────────────────────────────────────────

  async requestHumanSupport(sessionId: string, customerId: string | null, reason: string, customerNote?: string) {
    const existing = await this.prisma.humanSupportRequest.findUnique({ where: { aiSessionId: sessionId } });
    if (existing) return existing;

    const req = await this.prisma.humanSupportRequest.create({
      data: { aiSessionId: sessionId, customerId, reason, customerNote, status: 'PENDING' },
    });

    // Update session status
    await this.prisma.aiChatSession.update({ where: { id: sessionId }, data: { status: 'ESCALATED' } });

    return req;
  }

  async getPendingSupportRequests(adminId: string) {
    return this.prisma.humanSupportRequest.findMany({
      where: { status: { in: ['PENDING', 'ACCEPTED', 'ASSIGNED'] } },
      include: {
        aiSession: { include: { messages: { take: 5, orderBy: { createdAt: 'desc' } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateSupportRequest(requestId: string, data: { status: string; adminNote?: string; assignedToId?: string }) {
    return this.prisma.humanSupportRequest.update({
      where: { id: requestId },
      data: { ...data, resolvedAt: data.status === 'CLOSED' ? new Date() : undefined },
    });
  }

  // ── Analytics ─────────────────────────────────────────────────────────────

  async getChatbotAnalytics(days = 7) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [totalSessions, totalMessages, escalations, closedSessions, intentCounts] = await Promise.all([
      this.prisma.aiChatSession.count({ where: { createdAt: { gte: since } } }),
      this.prisma.aiChatMessage.count({ where: { createdAt: { gte: since }, role: 'USER' } }),
      this.prisma.aiChatSession.count({ where: { createdAt: { gte: since }, status: 'ESCALATED' } }),
      this.prisma.aiChatSession.count({ where: { createdAt: { gte: since }, status: 'CLOSED' } }),
      this.prisma.aiChatMessage.groupBy({
        by: ['intent'],
        where: { createdAt: { gte: since }, role: 'ASSISTANT', intent: { not: null } },
        _count: { intent: true },
        orderBy: { _count: { intent: 'desc' } },
        take: 10,
      }),
    ]);

    const resolutionRate = totalSessions > 0 ? Math.round((closedSessions / totalSessions) * 100) : 0;
    const escalationRate = totalSessions > 0 ? Math.round((escalations / totalSessions) * 100) : 0;

    return {
      totalSessions,
      totalMessages,
      escalations,
      closedSessions,
      resolutionRate,
      escalationRate,
      topIntents: intentCounts.map((i) => ({ intent: i.intent, count: i._count.intent })),
      period: `${days} days`,
    };
  }

  // ── AI Provider Config (admin) ────────────────────────────────────────────

  async getProviderConfigs(adminId: string) {
    return this.prisma.aiProviderConfig.findMany({ orderBy: { isPrimary: 'desc' } });
  }

  async upsertProviderConfig(adminId: string, data: {
    provider: string; displayName: string; apiKey?: string; apiEndpoint?: string;
    model?: string; isActive?: boolean; isPrimary?: boolean; settings?: string;
  }) {
    // If setting as primary, clear other primaries
    if (data.isPrimary) {
      await this.prisma.aiProviderConfig.updateMany({ data: { isPrimary: false } });
    }

    return this.prisma.aiProviderConfig.upsert({
      where: { provider: data.provider },
      create: { ...data },
      update: { ...data, updatedAt: new Date() },
    });
  }

  async deleteProviderConfig(adminId: string, provider: string) {
    return this.prisma.aiProviderConfig.delete({ where: { provider } });
  }

  // ── Knowledge Base ────────────────────────────────────────────────────────

  async getKnowledgeBase(page = 1, limit = 20) {
    const [data, total] = await Promise.all([
      this.prisma.chatbotKnowledge.findMany({
        skip: (page - 1) * limit, take: limit, orderBy: { priority: 'desc' },
      }),
      this.prisma.chatbotKnowledge.count(),
    ]);
    return { data, meta: { total, page, pageSize: limit } };
  }

  async upsertKnowledgeEntry(data: any) {
    if (data.id) {
      return this.prisma.chatbotKnowledge.update({ where: { id: data.id }, data });
    }
    return this.prisma.chatbotKnowledge.create({ data });
  }

  async deleteKnowledgeEntry(id: string) {
    return this.prisma.chatbotKnowledge.delete({ where: { id } });
  }

  // ── Canned Responses ──────────────────────────────────────────────────────

  async getCannedResponses() {
    return this.prisma.chatCannedResponse.findMany({ where: { isActive: true }, orderBy: { category: 'asc' } });
  }

  async upsertCannedResponse(data: any) {
    if (data.id) {
      return this.prisma.chatCannedResponse.update({ where: { id: data.id }, data });
    }
    return this.prisma.chatCannedResponse.create({ data });
  }

  async deleteCannedResponse(id: string) {
    return this.prisma.chatCannedResponse.delete({ where: { id } });
  }

  // ── Session End ───────────────────────────────────────────────────────────

  async endSession(sessionId: string, satisfactionRating?: number) {
    try {
      return await this.prisma.aiChatSession.update({
        where: { id: sessionId },
        data: {
          status: 'CLOSED',
          ...(satisfactionRating != null ? { satisfactionRating } : {}),
          updatedAt: new Date(),
        },
      });
    } catch {
      return { message: 'Session ended', sessionId };
    }
  }
}
