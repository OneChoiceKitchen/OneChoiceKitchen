/**
 * InternalChatPanel — Shared internal chat component for Partner & Rider portals.
 * Compact single-panel version with full feature set (same as admin but single-panel).
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';

interface Message {
  id: string; conversationId: string; senderId: string; senderName: string;
  content: string; type: string; fileUrl?: string; fileName?: string;
  replyToId?: string; replyTo?: { id: string; content: string; senderName: string };
  isEdited: boolean; isDeleted: boolean; isPinned: boolean;
  reactions: Record<string, string[]>; createdAt: string;
}
interface Conversation {
  id: string; type: string; name?: string; priority: string;
  isLocked: boolean; isArchived: boolean; unreadCount: number;
  participants: { user: { id: string; name: string; role: { name: string }; profilePhoto?: string } }[];
  messages: Message[]; updatedAt: string;
}

const API = '/api/chat';
function authH(tokenKey: string) { return { Authorization: `Bearer ${localStorage.getItem(tokenKey)}`, 'Content-Type': 'application/json' }; }
function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}
function getConvName(conv: Conversation, myId: string) {
  if (conv.name) return conv.name;
  const other = conv.participants.find(p => p.user.id !== myId);
  return other?.user.name || 'Unknown';
}
function getConvAvatar(conv: Conversation, myId: string) {
  if (conv.type === 'GROUP') return '👥';
  const other = conv.participants.find(p => p.user.id !== myId);
  return other?.user.name?.charAt(0).toUpperCase() || '?';
}

interface Props {
  tokenKey?: string;       // localStorage key for auth token
  userIdKey?: string;      // localStorage key for userId
  userNameKey?: string;    // localStorage key for user name
  socketUrl?: string;      // WebSocket server URL
  hideIfNotInternal?: boolean; // hide if CUSTOMER role
}

export default function InternalChatPanel({
  tokenKey = 'partner_token',
  userIdKey = 'partner_user_id',
  userNameKey = 'partner_name',
  socketUrl,
  hideIfNotInternal = true,
}: Props) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [editingMsg, setEditingMsg] = useState<Message | null>(null);
  const [searchQ, setSearchQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [msgLoading, setMsgLoading] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [userSearchQ, setUserSearchQ] = useState('');
  const [userResults, setUserResults] = useState<any[]>([]);
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  const socketRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimerRef = useRef<any>(null);

  const myId = localStorage.getItem(userIdKey) || '';
  const token = localStorage.getItem(tokenKey) || '';
  const SOCKET_URL = socketUrl || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

  const loadConversations = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/conversations`, { headers: authH(tokenKey) });
      const d = await r.json();
      setConversations(Array.isArray(d) ? d : []);
    } catch { setConversations([]); }
    setLoading(false);
  }, [tokenKey]);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  // Socket.IO
  useEffect(() => {
    if (!token) return;
    let socket: any;
    import('socket.io-client').then(({ io }) => {
      socket = io(`${SOCKET_URL}/chat`, {
        path: '/socket.io',
        auth: { token },
        transports: ['websocket', 'polling'],
      });
      socketRef.current = socket;

      socket.on('newMessage', (msg: Message) => {
        setMessages(prev => [...prev, msg]);
        setConversations(prev => prev.map(c => c.id === msg.conversationId ? { ...c, messages: [msg], updatedAt: msg.createdAt } : c).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
      });
      socket.on('messageEdited', (msg: Message) => setMessages(prev => prev.map(m => m.id === msg.id ? msg : m)));
      socket.on('messageDeleted', ({ messageId }: any) => setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isDeleted: true, content: '[Deleted]' } : m)));
      socket.on('reactionUpdated', ({ messageId, reactions }: any) => setMessages(prev => prev.map(m => m.id === messageId ? { ...m, reactions: JSON.parse(reactions) } : m)));
      socket.on('userTyping', ({ userId, conversationId, isTyping }: any) => {
        if (userId === myId) return;
        setTypingUsers(prev => ({ ...prev, [`${conversationId}:${userId}`]: isTyping }));
        if (isTyping) setTimeout(() => setTypingUsers(prev => { const n = { ...prev }; delete n[`${conversationId}:${userId}`]; return n; }), 3000);
      });
      socket.on('userOnline', ({ userId }: any) => setOnlineUsers(prev => new Set([...prev, userId])));
      socket.on('userOffline', ({ userId }: any) => setOnlineUsers(prev => { const s = new Set(prev); s.delete(userId); return s; }));
    });
    return () => socket?.disconnect();
  }, [token, SOCKET_URL, myId]);

  useEffect(() => {
    if (!activeConv) return;
    setMsgLoading(true);
    setMessages([]);
    socketRef.current?.emit('joinConversation', { conversationId: activeConv.id });
    fetch(`${API}/conversations/${activeConv.id}/messages`, { headers: authH(tokenKey) })
      .then(r => r.json()).then(d => setMessages(d.data || []))
      .catch(() => {}).finally(() => setMsgLoading(false));
    socketRef.current?.emit('markRead', { conversationId: activeConv.id });
  }, [activeConv?.id, tokenKey]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !activeConv) return;
    if (editingMsg) {
      socketRef.current?.emit('editMessage', { messageId: editingMsg.id, content: input, conversationId: activeConv.id });
      setEditingMsg(null);
    } else {
      socketRef.current?.emit('sendMessage', {
        conversationId: activeConv.id, content: input, type: 'TEXT', replyToId: replyTo?.id,
      });
      setReplyTo(null);
    }
    setInput('');
    clearTyping();
    inputRef.current?.focus();
  };

  const handleTyping = () => {
    if (!activeConv) return;
    socketRef.current?.emit('typing', { conversationId: activeConv.id, isTyping: true });
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => socketRef.current?.emit('typing', { conversationId: activeConv.id, isTyping: false }), 2000);
  };
  const clearTyping = () => {
    clearTimeout(typingTimerRef.current);
    socketRef.current?.emit('typing', { conversationId: activeConv?.id, isTyping: false });
  };

  const searchUsers = useCallback(async (q: string) => {
    if (!q.trim()) { setUserResults([]); return; }
    try {
      const r = await fetch(`${API}/users/search?q=${encodeURIComponent(q)}`, { headers: authH(tokenKey) });
      const d = await r.json();
      setUserResults(d.data || []);
    } catch { setUserResults([]); }
  }, [tokenKey]);

  useEffect(() => { const t = setTimeout(() => searchUsers(userSearchQ), 300); return () => clearTimeout(t); }, [userSearchQ, searchUsers]);

  const startDirectChat = async (targetUser: any) => {
    try {
      const r = await fetch(`${API}/conversations`, {
        method: 'POST', headers: authH(tokenKey),
        body: JSON.stringify({ type: 'DIRECT', participantIds: [targetUser.id] }),
      });
      const conv = await r.json();
      setShowSearch(false);
      setUserSearchQ('');
      await loadConversations();
      setActiveConv(conv);
    } catch { alert('Cannot start chat with this user.'); }
  };

  const filteredConvs = searchQ
    ? conversations.filter(c => getConvName(c, myId).toLowerCase().includes(searchQ.toLowerCase()))
    : conversations;

  const typingInConv = activeConv ? Object.entries(typingUsers)
    .filter(([k, v]) => k.startsWith(activeConv.id) && v).length > 0 : false;

  const PRIORITY_COLORS: Record<string, string> = { NORMAL: '#64748b', HIGH: '#d97706', URGENT: '#ea580c', CRITICAL: '#dc2626' };

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '280px 1fr', height: 'calc(100vh - 200px)', minHeight: 500,
      border: '1px solid var(--bdr, #e2e8f0)', borderRadius: 12, overflow: 'hidden', background: 'var(--bg, #f3f4f8)',
    }}>
      {/* Left: Conversation list */}
      <div style={{ display: 'flex', flexDirection: 'column', background: '#fff', borderRight: '1px solid #e2e8f0' }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>💬 Messages</span>
          <button
            onClick={() => setShowSearch(v => !v)}
            style={{ background: '#2563EB', color: '#fff', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}
          >+</button>
        </div>

        {showSearch && (
          <div style={{ padding: '0.5rem', borderBottom: '1px solid #e2e8f0' }}>
            <input
              value={userSearchQ} onChange={e => setUserSearchQ(e.target.value)}
              placeholder="Search team members…" autoFocus
              style={{ width: '100%', padding: '.5rem', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: '0.8rem', boxSizing: 'border-box' }}
            />
            {userResults.slice(0, 6).map(u => (
              <div key={u.id} onClick={() => startDirectChat(u)}
                style={{ display: 'flex', alignItems: 'center', gap: '.5rem', padding: '.4rem .25rem', cursor: 'pointer', borderRadius: 6, transition: 'background .1s' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#f1f5f9')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#2563EB', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0 }}>{u.name.charAt(0)}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.8rem', color: '#0f172a' }}>{u.name}</div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{u.role?.name}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ padding: '0.5rem', borderBottom: '1px solid #e2e8f0' }}>
          <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="🔍 Search…"
            style={{ width: '100%', padding: '.4rem .7rem', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: '0.8rem', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading && <div style={{ padding: '1rem', textAlign: 'center', color: '#64748b', fontSize: '0.8rem' }}>Loading…</div>}
          {filteredConvs.map(conv => {
            const name = getConvName(conv, myId);
            const avatar = getConvAvatar(conv, myId);
            const lastMsg = conv.messages?.[0];
            const other = conv.participants.find(p => p.user.id !== myId);
            const isOnline = other ? onlineUsers.has(other.user.id) : false;
            const pc = PRIORITY_COLORS[conv.priority];
            return (
              <div key={conv.id} onClick={() => setActiveConv(conv)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '.6rem', padding: '.6rem .75rem',
                  cursor: 'pointer', borderBottom: '1px solid #f1f5f9',
                  background: activeConv?.id === conv.id ? '#eff6ff' : 'transparent',
                  borderLeft: activeConv?.id === conv.id ? '3px solid #2563EB' : '3px solid transparent',
                  transition: 'background .12s',
                }}
                onMouseEnter={e => { if (activeConv?.id !== conv.id) e.currentTarget.style.background = '#f8fafc'; }}
                onMouseLeave={e => { if (activeConv?.id !== conv.id) e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#2563EB', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem' }}>{avatar}</div>
                  {isOnline && <div style={{ position: 'absolute', bottom: 1, right: 1, width: 9, height: 9, borderRadius: '50%', background: '#16a34a', border: '2px solid #fff' }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.8rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 110 }}>{name}</span>
                    <span style={{ fontSize: '0.65rem', color: '#64748b', flexShrink: 0 }}>{lastMsg ? formatTime(lastMsg.createdAt || conv.updatedAt) : ''}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 110 }}>
                      {lastMsg ? (lastMsg.isDeleted ? '🚫 Deleted' : lastMsg.content.substring(0, 35)) : 'No messages'}
                    </span>
                    <div style={{ display: 'flex', gap: 3, alignItems: 'center', flexShrink: 0 }}>
                      {conv.priority !== 'NORMAL' && <div style={{ width: 6, height: 6, borderRadius: '50%', background: pc }} />}
                      {conv.unreadCount > 0 && <span style={{ background: '#2563EB', color: '#fff', borderRadius: 10, padding: '0 4px', fontSize: 10, fontWeight: 700, minWidth: 16, textAlign: 'center' }}>{conv.unreadCount}</span>}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {!loading && filteredConvs.length === 0 && (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#64748b' }}>
              <div style={{ fontSize: '2rem', marginBottom: '.5rem' }}>💬</div>
              <p style={{ fontSize: '0.8rem', margin: '0 0 .75rem' }}>No conversations yet</p>
              <button onClick={() => setShowSearch(true)} style={{ background: '#2563EB', color: '#fff', border: 'none', padding: '.4rem .9rem', borderRadius: 8, cursor: 'pointer', fontSize: '0.8rem' }}>+ Start Chat</button>
            </div>
          )}
        </div>
      </div>

      {/* Right: Chat area */}
      <div style={{ display: 'flex', flexDirection: 'column', background: '#f3f4f8' }}>
        {!activeConv ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: '#64748b', gap: '.75rem' }}>
            <div style={{ fontSize: '3rem' }}>💬</div>
            <h3 style={{ color: '#0f172a', margin: 0, fontSize: '1rem' }}>Team Communication</h3>
            <p style={{ fontSize: '0.8rem', margin: 0 }}>Select a conversation to start messaging</p>
            <button onClick={() => setShowSearch(true)} style={{ background: '#2563EB', color: '#fff', border: 'none', padding: '.5rem 1.25rem', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>+ New Chat</button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ padding: '.7rem 1rem', background: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '.6rem' }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#2563EB', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{getConvAvatar(activeConv, myId)}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>{getConvName(activeConv, myId)}</div>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                  {typingInConv ? <span style={{ color: '#2563EB', fontStyle: 'italic' }}>Typing…</span> : `${activeConv.participants.length} members`}
                </div>
              </div>
              {activeConv.priority !== 'NORMAL' && (
                <span style={{ fontSize: '0.7rem', color: PRIORITY_COLORS[activeConv.priority], fontWeight: 700 }}>
                  🔴 {activeConv.priority}
                </span>
              )}
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '.25rem' }}>
              {msgLoading && <div style={{ textAlign: 'center', color: '#64748b', fontSize: '0.8rem' }}>Loading…</div>}
              {messages.map(msg => {
                const isMine = msg.senderId === myId;
                return (
                  <div key={msg.id} style={{ display: 'flex', flexDirection: isMine ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: '.4rem', marginBottom: '.15rem' }}>
                    {!isMine && (
                      <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#e2e8f0', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0 }}>
                        {msg.senderName?.charAt(0)}
                      </div>
                    )}
                    <div style={{ maxWidth: '65%' }}>
                      {!isMine && <div style={{ fontSize: '0.65rem', fontWeight: 600, color: '#475569', marginBottom: '0.15rem' }}>{msg.senderName}</div>}
                      {msg.replyTo && (
                        <div style={{ background: 'rgba(0,0,0,.06)', borderLeft: `3px solid ${isMine ? '#fff' : '#2563EB'}`, padding: '.25rem .5rem', borderRadius: 6, marginBottom: '.15rem', fontSize: '0.7rem' }}>
                          <strong>{msg.replyTo.senderName}</strong>: {msg.replyTo.content.substring(0, 60)}
                        </div>
                      )}
                      <div style={{
                        background: isMine ? '#2563EB' : '#fff', color: isMine ? '#fff' : '#0f172a',
                        padding: '.5rem .75rem', borderRadius: isMine ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                        boxShadow: isMine ? 'none' : '0 1px 3px rgba(0,0,0,.08)',
                        wordBreak: 'break-word',
                      }}>
                        {msg.isDeleted
                          ? <span style={{ fontStyle: 'italic', opacity: .7, fontSize: '0.8rem' }}>🚫 Message deleted</span>
                          : <span style={{ fontSize: '0.85rem', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{msg.content}</span>
                        }
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '.2rem', gap: '.25rem' }}>
                          {msg.isPinned && <span style={{ fontSize: '0.6rem', opacity: .7 }}>📌</span>}
                          {msg.isEdited && <span style={{ fontSize: '0.6rem', opacity: .7, fontStyle: 'italic' }}>edited</span>}
                          <span style={{ fontSize: '0.62rem', opacity: .65 }}>{formatTime(msg.createdAt)}</span>
                        </div>
                      </div>
                      {Object.keys(msg.reactions || {}).length > 0 && (
                        <div style={{ display: 'flex', gap: '3px', marginTop: '2px', flexWrap: 'wrap' }}>
                          {Object.entries(msg.reactions).map(([emoji, users]) => users.length > 0 && (
                            <span key={emoji} onClick={() => socketRef.current?.emit('reactToMessage', { messageId: msg.id, emoji, conversationId: activeConv.id })}
                              style={{ background: users.includes(myId) ? '#dbeafe' : '#f1f5f9', borderRadius: 10, padding: '1px 5px', fontSize: '0.7rem', cursor: 'pointer', border: users.includes(myId) ? '1px solid #93c5fd' : '1px solid #e2e8f0' }}>
                              {emoji} {users.length}
                            </span>
                          ))}
                        </div>
                      )}
                      {/* Quick actions */}
                      <div style={{ display: 'flex', gap: '3px', marginTop: '2px', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                        <button onClick={() => setReplyTo(msg)} style={actionBtnStyle} title="Reply">↩</button>
                        {['👍','❤️','😂','😮'].map(e => (
                          <button key={e} onClick={() => socketRef.current?.emit('reactToMessage', { messageId: msg.id, emoji: e, conversationId: activeConv.id })}
                            style={actionBtnStyle}>{e}</button>
                        ))}
                        {isMine && !msg.isDeleted && <button onClick={() => { setEditingMsg(msg); setInput(msg.content); inputRef.current?.focus(); }} style={actionBtnStyle} title="Edit">✏️</button>}
                        {!msg.isDeleted && <button onClick={() => { if (confirm('Delete?')) socketRef.current?.emit('deleteMessage', { messageId: msg.id, conversationId: activeConv.id }); }} style={{ ...actionBtnStyle, color: '#dc2626' }} title="Delete">🗑️</button>}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {typingInConv && (
              <div style={{ padding: '.25rem 1rem', fontSize: '0.72rem', color: '#64748b', background: '#f3f4f8', display: 'flex', alignItems: 'center', gap: '.35rem' }}>
                <TypingDots /> Someone is typing…
              </div>
            )}

            {/* Reply bar */}
            {replyTo && (
              <div style={{ padding: '.4rem 1rem', background: '#fff', borderTop: '2px solid #2563EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#2563EB', fontWeight: 600 }}>↩ Replying to {replyTo.senderName}</div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{replyTo.content.substring(0, 60)}</div>
                </div>
                <button onClick={() => setReplyTo(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b' }}>✕</button>
              </div>
            )}

            {/* Edit bar */}
            {editingMsg && (
              <div style={{ padding: '.4rem 1rem', background: '#fff', borderTop: '2px solid #d97706', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#d97706', fontWeight: 600 }}>✏️ Editing message</div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{editingMsg.content.substring(0, 60)}</div>
                </div>
                <button onClick={() => { setEditingMsg(null); setInput(''); }} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b' }}>✕</button>
              </div>
            )}

            {/* Input */}
            {!activeConv.isLocked ? (
              <div style={{ padding: '.65rem 1rem', background: '#fff', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '.5rem', alignItems: 'center' }}>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => { setInput(e.target.value); handleTyping(); }}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  placeholder={editingMsg ? 'Edit message…' : 'Type a message…'}
                  style={{ flex: 1, padding: '.55rem .85rem', border: '1px solid #e2e8f0', borderRadius: 20, fontSize: '0.85rem', outline: 'none', background: '#f8fafc', transition: 'border-color .15s' }}
                  onFocus={e => e.target.style.borderColor = '#2563EB'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim()}
                  style={{ width: 36, height: 36, borderRadius: '50%', background: input.trim() ? '#2563EB' : '#cbd5e1', color: '#fff', border: 'none', cursor: input.trim() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .15s', flexShrink: 0 }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                </button>
              </div>
            ) : (
              <div style={{ padding: '.6rem 1rem', background: '#fef2f2', color: '#dc2626', borderTop: '1px solid #fecaca', fontSize: '0.8rem', textAlign: 'center' }}>
                🔒 This conversation is locked
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const actionBtnStyle: React.CSSProperties = {
  border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.7rem',
  padding: '1px 3px', borderRadius: 4, opacity: 0.7, transition: 'opacity .1s',
};

function TypingDots() {
  return (
    <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
      {[0, 0.2, 0.4].map((d, i) => (
        <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: '#94a3b8', animation: `typingBounce 1.2s ${d}s infinite` }} />
      ))}
      <style>{`@keyframes typingBounce { 0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-5px)} }`}</style>
    </div>
  );
}
