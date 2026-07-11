'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from './AiChatWidget.module.css';

/* ── Types ─────────────────────────────────────────────────────────────────── */
interface ChatMessage {
  id: string;
  role: 'USER' | 'BOT';
  content: string;
  intent?: string;
  suggestedReplies?: string[];
  createdAt: string;
  isTyping?: boolean;
}

/* ── Helpers ───────────────────────────────────────────────────────────────── */
function fmt(iso: string) {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

/* ── Main Widget ───────────────────────────────────────────────────────────── */
export default function AiChatWidget() {
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState<{ id: string; shortToken?: string } | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [starting, setStarting] = useState(false);
  const [escalated, setEscalated] = useState(false);
  const [showSatisfaction, setShowSatisfaction] = useState(false);
  const [satisfaction, setSatisfaction] = useState<number | null>(null);
  const [unread, setUnread] = useState(0);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [botName, setBotName] = useState('OCK Assistant');
  const [botAvatar, setBotAvatar] = useState('🍽️');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Restore session from storage
  useEffect(() => {
    const saved = sessionStorage.getItem('ock_ai_session');
    if (saved) {
      try {
        const s = JSON.parse(saved);
        setSession(s);
        loadHistory(s.id, s.shortToken);
      } catch { sessionStorage.removeItem('ock_ai_session'); }
    }
  }, []);

  const loadHistory = async (sessionId: string, shortToken?: string) => {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      const token = localStorage.getItem('web_token') || shortToken;
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const r = await fetch(`/api/ai-chat/sessions/${sessionId}/messages`, { headers });
      if (r.ok) { const d = await r.json(); setMessages(d.data || []); }
    } catch { /* no-op: will start fresh */ }
  };

  const startSession = async () => {
    if (session || starting) return;
    setStarting(true);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      const token = localStorage.getItem('web_token');
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const r = await fetch('/api/ai-chat/sessions', {
        method: 'POST', headers,
        body: JSON.stringify({ channel: 'WEB' }),
      });
      if (!r.ok) throw new Error('Failed to start session');
      const d = await r.json();
      const s = { id: d.session.id, shortToken: d.session.shortToken };
      setSession(s);
      sessionStorage.setItem('ock_ai_session', JSON.stringify(s));
      // Welcome message
      setMessages([{
        id: 'welcome',
        role: 'BOT',
        content: `👋 Hi! I'm **${botName}**, your OneChoiceKitchen assistant.\n\nI can help you with:\n• 📦 Track your orders\n• 🍱 Tiffin subscriptions\n• 💳 Payments & refunds\n• 🍽️ Menu & reservations\n• 🎁 Offers & rewards\n\nHow can I help you today?`,
        suggestedReplies: ['Track my order', 'View today\'s menu', 'My subscriptions', 'Talk to support'],
        createdAt: new Date().toISOString(),
      }]);
    } catch {
      setMessages([{
        id: 'err',
        role: 'BOT',
        content: 'Sorry, I couldn\'t start a chat session. Please try again!',
        createdAt: new Date().toISOString(),
      }]);
    }
    setStarting(false);
  };

  const handleOpen = () => {
    setOpen(true);
    setUnread(0);
    if (!session) startSession();
    setTimeout(() => inputRef.current?.focus(), 200);
  };

  const sendMessage = useCallback(async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || !session || loading) return;
    setInput('');

    // Optimistically add user message
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: 'USER', content: msg, createdAt: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setIsBotTyping(true);
    setLoading(true);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      const token = localStorage.getItem('web_token') || session.shortToken;
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const r = await fetch(`/api/ai-chat/sessions/${session.id}/message`, {
        method: 'POST', headers,
        body: JSON.stringify({ message: msg }),
      });
      if (!r.ok) throw new Error('API error');
      const d = await r.json();
      setIsBotTyping(false);
      const botMsg: ChatMessage = {
        id: d.message?.id || `b-${Date.now()}`,
        role: 'BOT',
        content: d.message?.content || 'I couldn\'t process that. Please try again.',
        intent: d.message?.intent,
        suggestedReplies: d.message?.suggestedReplies,
        createdAt: d.message?.createdAt || new Date().toISOString(),
      };
      setMessages(prev => [...prev, botMsg]);
      if (!open) setUnread(u => u + 1);
    } catch {
      setIsBotTyping(false);
      setMessages(prev => [...prev, {
        id: `e-${Date.now()}`, role: 'BOT',
        content: 'I\'m having trouble connecting. Please try again in a moment.',
        createdAt: new Date().toISOString(),
      }]);
    }
    setLoading(false);
  }, [input, session, loading, open]);

  const requestHuman = async () => {
    if (!session) return;
    setLoading(true);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      const token = localStorage.getItem('web_token') || session.shortToken;
      if (token) headers['Authorization'] = `Bearer ${token}`;
      await fetch(`/api/ai-chat/sessions/${session.id}/request-human`, {
        method: 'POST', headers,
        body: JSON.stringify({ reason: 'Customer requested human support' }),
      });
      setEscalated(true);
      setMessages(prev => [...prev, {
        id: `esc-${Date.now()}`, role: 'BOT',
        content: '✅ Your request has been sent to our support team. A team member will reach out to you soon!\n\nIn the meantime, is there anything else I can help you with?',
        createdAt: new Date().toISOString(),
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: `esc-err-${Date.now()}`, role: 'BOT',
        content: 'Unable to connect to support right now. Please try the support page or call us.',
        createdAt: new Date().toISOString(),
      }]);
    }
    setLoading(false);
  };

  const endSession = async () => {
    if (!session) { setOpen(false); return; }
    setShowSatisfaction(true);
  };

  const submitSatisfaction = async (rating: number) => {
    setSatisfaction(rating);
    setShowSatisfaction(false);
    if (session) {
      try {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        const token = localStorage.getItem('web_token') || session.shortToken;
        if (token) headers['Authorization'] = `Bearer ${token}`;
        await fetch(`/api/ai-chat/sessions/${session.id}/end`, {
          method: 'POST', headers,
          body: JSON.stringify({ satisfactionRating: rating }),
        });
      } catch { /* silent */ }
    }
    setMessages(prev => [...prev, {
      id: `ty-${Date.now()}`, role: 'BOT',
      content: `⭐ Thank you for rating us ${rating}/5! Your feedback helps us improve.\n\nHave a delicious day! 🍽️`,
      createdAt: new Date().toISOString(),
    }]);
    setSession(null);
    sessionStorage.removeItem('ock_ai_session');
    setTimeout(() => setOpen(false), 2000);
  };

  // Auto-scroll
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isBotTyping]);

  // Format bot message content (basic markdown → HTML)
  function renderContent(content: string) {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br/>');
  }

  const QUICK_ACTIONS = [
    { label: '📦 Track Order', msg: 'Track my order' },
    { label: '🍱 Tiffin Plans', msg: 'Tell me about tiffin subscriptions' },
    { label: '💳 Refund Status', msg: 'Check my refund status' },
    { label: '🤝 Talk to Human', action: requestHuman },
  ];

  return (
    <>
      {/* FAB Button */}
      <button
        id="ai-chat-fab"
        className={`${styles.fab} ${open ? styles.fabOpen : ''}`}
        onClick={open ? () => setOpen(false) : handleOpen}
        aria-label="Chat with OCK Assistant"
      >
        {open ? '✕' : (
          <>
            <span className={styles.fabIcon}>💬</span>
            {unread > 0 && <span className={styles.fabBadge}>{unread}</span>}
          </>
        )}
      </button>

      {/* Chat Window */}
      {open && (
        <div className={styles.window} role="dialog" aria-label="AI Chat Assistant">
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <div className={styles.botAvatar}>{botAvatar}</div>
              <div>
                <div className={styles.botName}>{botName}</div>
                <div className={styles.botStatus}>
                  <span className={styles.statusDot} />
                  Always here to help
                </div>
              </div>
            </div>
            <div className={styles.headerActions}>
              {!escalated && (
                <button className={styles.headerBtn} onClick={requestHuman} title="Talk to human">🧑‍💼</button>
              )}
              <button className={styles.headerBtn} onClick={endSession} title="End chat">✕</button>
            </div>
          </div>

          {/* Messages area */}
          <div className={styles.messages}>
            {messages.map(msg => (
              <div key={msg.id} className={`${styles.msgWrap} ${msg.role === 'USER' ? styles.msgWrapUser : ''}`}>
                {msg.role === 'BOT' && <div className={styles.msgAvatar}>{botAvatar}</div>}
                <div className={`${styles.bubble} ${msg.role === 'USER' ? styles.bubbleUser : styles.bubbleBot}`}>
                  <div
                    className={styles.msgContent}
                    dangerouslySetInnerHTML={{ __html: renderContent(msg.content) }}
                  />
                  <div className={styles.msgTime}>{fmt(msg.createdAt)}</div>
                  {msg.suggestedReplies && msg.suggestedReplies.length > 0 && (
                    <div className={styles.suggestions}>
                      {msg.suggestedReplies.map((s, i) => (
                        <button key={i} className={styles.suggestionBtn} onClick={() => sendMessage(s)}>
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isBotTyping && (
              <div className={styles.msgWrap}>
                <div className={styles.msgAvatar}>{botAvatar}</div>
                <div className={`${styles.bubble} ${styles.bubbleBot} ${styles.typingBubble}`}>
                  <div className={styles.typingDots}>
                    <span /><span /><span />
                  </div>
                </div>
              </div>
            )}

            {/* Satisfaction rating */}
            {showSatisfaction && (
              <div className={styles.satisfaction}>
                <p>How was your experience?</p>
                <div className={styles.stars}>
                  {[1, 2, 3, 4, 5].map(n => (
                    <button key={n} onClick={() => submitSatisfaction(n)} className={styles.starBtn}>
                      ⭐
                    </button>
                  ))}
                </div>
                <button className={styles.skipBtn} onClick={() => submitSatisfaction(0)}>Skip</button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length <= 1 && (
            <div className={styles.quickActions}>
              {QUICK_ACTIONS.map((a, i) => (
                <button key={i} className={styles.qaBtn}
                  onClick={() => a.action ? a.action() : sendMessage(a.msg)}
                  disabled={loading}>
                  {a.label}
                </button>
              ))}
            </div>
          )}

          {/* Input area */}
          <div className={styles.inputArea}>
            {starting ? (
              <div className={styles.starting}>Starting chat…</div>
            ) : (
              <>
                <input
                  ref={inputRef}
                  className={styles.input}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  placeholder="Type your message…"
                  disabled={loading || !session}
                  maxLength={500}
                />
                <button
                  className={styles.sendBtn}
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || loading || !session}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                </button>
              </>
            )}
          </div>

          {/* Footer */}
          <div className={styles.footer}>
            <span>Powered by OneChoiceKitchen AI</span>
            {session && (
              <button className={styles.humanBtn} onClick={requestHuman} disabled={escalated || loading}>
                {escalated ? '✅ Support requested' : '🧑‍💼 Talk to human'}
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
