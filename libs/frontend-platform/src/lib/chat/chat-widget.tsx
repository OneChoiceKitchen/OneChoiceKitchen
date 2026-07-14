'use client';

import { MessageCircle, Send, X } from 'lucide-react';
import { useState } from 'react';
import type { CSSProperties } from 'react';

import {
  useChatWebSocket,
  type UseChatWebSocketOptions,
} from './use-chat-websocket';

export interface ChatWidgetProps extends UseChatWebSocketOptions {
  title?: string;
  variant?: 'floating' | 'inline';
  placeholder?: string;
}

const panelStyle: CSSProperties = {
  background: 'var(--surf)',
  border: '1px solid var(--bdr)',
  borderRadius: 'var(--r-md)',
  boxShadow: 'var(--shadow-md)',
  display: 'flex',
  flexDirection: 'column',
  maxHeight: 520,
  minHeight: 360,
  overflow: 'hidden',
  width: 'min(100%, 380px)',
};

const floatingPanelStyle: CSSProperties = {
  ...panelStyle,
  bottom: 'var(--sp-5)',
  position: 'fixed',
  right: 'var(--sp-5)',
  zIndex: 50,
};

const headerStyle: CSSProperties = {
  alignItems: 'center',
  background: 'var(--brand-blue)',
  color: 'var(--surf)',
  display: 'flex',
  justifyContent: 'space-between',
  padding: 'var(--sp-3) var(--sp-4)',
};

const messagesStyle: CSSProperties = {
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  gap: 'var(--sp-2)',
  overflowY: 'auto',
  padding: 'var(--sp-4)',
};

const inputRowStyle: CSSProperties = {
  borderTop: '1px solid var(--bdr)',
  display: 'flex',
  gap: 'var(--sp-2)',
  padding: 'var(--sp-3)',
};

const buttonStyle: CSSProperties = {
  alignItems: 'center',
  border: 0,
  borderRadius: 'var(--r-sm)',
  cursor: 'pointer',
  display: 'inline-flex',
  font: 'inherit',
  fontWeight: 700,
  gap: '0.4rem',
  justifyContent: 'center',
  minHeight: 40,
  padding: '0.5rem 0.75rem',
};

const floatingButtonStyle: CSSProperties = {
  ...buttonStyle,
  background: 'var(--brand-blue)',
  bottom: 'var(--sp-5)',
  boxShadow: 'var(--shadow-md)',
  color: 'var(--surf)',
  position: 'fixed',
  right: 'var(--sp-5)',
  zIndex: 50,
};

function MessageBubble({
  message,
}: {
  message: {
    content: string;
    senderName?: string | null;
    pending?: boolean;
    failed?: boolean;
  };
}) {
  return (
    <article
      aria-label={
        message.senderName ? `Message from ${message.senderName}` : 'Message'
      }
      style={{
        alignSelf: message.senderName ? 'flex-start' : 'flex-end',
        background: message.failed
          ? 'var(--brand-red-lt)'
          : 'var(--brand-blue-lt)',
        border: '1px solid var(--bdr)',
        borderRadius: 'var(--r-md)',
        maxWidth: '85%',
        padding: '0.6rem 0.75rem',
      }}
    >
      {message.senderName ? <strong>{message.senderName}</strong> : null}
      <div>{message.content}</div>
      {message.pending ? <small>Sending...</small> : null}
      {message.failed ? <small>Failed to send</small> : null}
    </article>
  );
}

export function ChatWidget({
  title = 'Support Chat',
  variant = 'floating',
  placeholder = 'Type a message',
  ...hookOptions
}: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(variant === 'inline');
  const [draft, setDraft] = useState('');
  const { messages, isConnected, isLoadingHistory, error, sendMessage } =
    useChatWebSocket({
      ...hookOptions,
      enabled: isOpen && hookOptions.enabled !== false,
    });

  const handleSend = async () => {
    const nextMessage = draft.trim();
    if (!nextMessage) return;
    setDraft('');
    await sendMessage(nextMessage);
  };

  if (!isOpen && variant === 'floating') {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        style={floatingButtonStyle}
      >
        <MessageCircle size={18} aria-hidden="true" /> Open Chat
      </button>
    );
  }

  return (
    <section
      aria-label={title}
      style={variant === 'floating' ? floatingPanelStyle : panelStyle}
    >
      <div style={headerStyle}>
        <div>
          <strong>{title}</strong>
          <div>{isConnected ? 'Connected' : 'Connecting'}</div>
        </div>
        {variant === 'floating' ? (
          <button
            type="button"
            aria-label="Close chat"
            onClick={() => setIsOpen(false)}
            style={{
              ...buttonStyle,
              background: 'transparent',
              color: 'var(--surf)',
            }}
          >
            <X size={18} aria-hidden="true" /> Close
          </button>
        ) : null}
      </div>

      {error ? <div role="alert">{error}</div> : null}
      {isLoadingHistory ? (
        <div role="status">Loading chat history...</div>
      ) : null}

      <div role="log" aria-live="polite" style={messagesStyle}>
        {!isLoadingHistory && messages.length === 0 ? (
          <p>No messages yet.</p>
        ) : null}
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
      </div>

      <form
        style={inputRowStyle}
        onSubmit={(event) => {
          event.preventDefault();
          void handleSend();
        }}
      >
        <label style={{ flex: 1 }}>
          <span style={{ display: 'block' }}>Message</span>
          <input
            aria-label="Message"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={placeholder}
            style={{
              border: '1px solid var(--bdr)',
              borderRadius: 'var(--r-sm)',
              boxSizing: 'border-box',
              minHeight: 40,
              padding: '0.5rem 0.65rem',
              width: '100%',
            }}
          />
        </label>
        <button
          type="submit"
          disabled={!draft.trim()}
          style={{
            ...buttonStyle,
            alignSelf: 'end',
            background: 'var(--brand-blue)',
            color: 'var(--surf)',
          }}
        >
          <Send size={16} aria-hidden="true" /> Send Message
        </button>
      </form>
    </section>
  );
}
