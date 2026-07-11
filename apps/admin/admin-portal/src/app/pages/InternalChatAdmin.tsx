import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from './InternalChatAdmin.module.css';

// ─── Types ────────────────────────────────────────────────────────────────────
interface User { id: string; name: string; role: string; profilePhoto?: string; isOnline?: boolean; }
interface Message {
  id: string; conversationId: string; senderId: string; senderName: string; content: string;
  type: string; fileUrl?: string; fileName?: string; replyToId?: string;
  replyTo?: { id: string; content: string; senderName: string };
  isEdited: boolean; isDeleted: boolean; isPinned: boolean;
  reactions: Record<string, string[]>; createdAt: string;
}
interface Conversation {
  id: string; type: string; name?: string; priority: string;
  isLocked: boolean; isArchived: boolean; unreadCount: number;
  participants: { user: User }[];
  messages: Message[];
  updatedAt: string;
}

const PRIORITY_COLORS: Record<string, string> = {
  NORMAL: '#64748b', HIGH: '#d97706', URGENT: '#ea580c', CRITICAL: '#dc2626',
};
const PRIORITY_LABELS: Record<string, string> = {
  NORMAL: 'Normal', HIGH: 'High Priority', URGENT: 'Urgent', CRITICAL: '🚨 Critical',
};
const EMOJI_LIST = ['👍', '❤️', '😂', '😮', '😢', '🙏', '🔥', '✅'];

const API = '/api/chat';
const SOCKET_URL = (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
const authH = () => ({ Authorization: `Bearer ${localStorage.getItem('admin_token')}`, 'Content-Type': 'application/json' });
const myId = () => localStorage.getItem('admin_user_id') || '';
const myName = () => localStorage.getItem('admin_name') || 'Admin';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getConvName(conv: Conversation, currentUserId: string) {
  if (conv.name) return conv.name;
  const other = conv.participants.find(p => p.user.id !== currentUserId);
  return other?.user.name || 'Unknown';
}
function getConvAvatar(conv: Conversation, currentUserId: string) {
  if (conv.type === 'GROUP') return '👥';
  const other = conv.participants.find(p => p.user.id !== currentUserId);
  return other?.user.name?.charAt(0).toUpperCase() || '?';
}
function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}
function groupMessagesByDate(messages: Message[]) {
  const groups: { date: string; messages: Message[] }[] = [];
  let lastDate = '';
  messages.forEach(m => {
    const date = new Date(m.createdAt).toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
    if (date !== lastDate) { groups.push({ date, messages: [] }); lastDate = date; }
    groups[groups.length - 1].messages.push(m);
  });
  return groups;
}

// ─── UserSearchModal ──────────────────────────────────────────────────────────
function UserSearchModal({ onSelect, onClose }: { onSelect: (users: User[]) => void; onClose: () => void }) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [selected, setSelected] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<'DIRECT' | 'GROUP'>('DIRECT');
  const [groupName, setGroupName] = useState('');

  const search = useCallback(async (query: string) => {
    if (!query.trim()) { setResults([]); return; }
    setLoading(true);
    try {
      const r = await fetch(`${API}/users/search?q=${encodeURIComponent(query)}`, { headers: authH() });
      const d = await r.json();
      setResults(d.data || []);
    } catch { setResults([]); }
    setLoading(false);
  }, []);

  useEffect(() => { const t = setTimeout(() => search(q), 300); return () => clearTimeout(t); }, [q, search]);

  const toggle = (u: User) => {
    setSelected(prev =>
      prev.some(s => s.id === u.id) ? prev.filter(s => s.id !== u.id) : (type === 'DIRECT' ? [u] : [...prev, u])
    );
  };

  const handleCreate = async () => {
    if (selected.length === 0) return;
    try {
      const body = {
        type,
        participantIds: selected.map(s => s.id),
        ...(type === 'GROUP' ? { name: groupName || `Group (${selected.length + 1})` } : {}),
      };
      const r = await fetch(`${API}/conversations`, { method: 'POST', headers: authH(), body: JSON.stringify(body) });
      const conv = await r.json();
      onSelect([...selected]);
    } catch { /* Gracefully ignore conversation creation errors */ }
    onClose();
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>New Conversation</h3>
          <button className={styles.iconBtn} onClick={onClose}>✕</button>
        </div>
        <div className={styles.typeToggle}>
          <button className={`${styles.typeBtn} ${type === 'DIRECT' ? styles.typeBtnActive : ''}`} onClick={() => setType('DIRECT')}>💬 Direct</button>
          <button className={`${styles.typeBtn} ${type === 'GROUP' ? styles.typeBtnActive : ''}`} onClick={() => setType('GROUP')}>👥 Group</button>
        </div>
        {type === 'GROUP' && (
          <input className={styles.groupNameInput} placeholder="Group name (optional)" value={groupName} onChange={e => setGroupName(e.target.value)} />
        )}
        <div className={styles.searchRow}>
          <input className={styles.searchInput} placeholder="Search by name, role, email…" value={q} onChange={e => setQ(e.target.value)} autoFocus />
        </div>
        {selected.length > 0 && (
          <div className={styles.selectedChips}>
            {selected.map(u => (
              <span key={u.id} className={styles.chip}>{u.name} <button onClick={() => toggle(u)}>×</button></span>
            ))}
          </div>
        )}
        <div className={styles.resultList}>
          {loading && <div className={styles.loadingText}>Searching…</div>}
          {results.map(u => (
            <div key={u.id} className={`${styles.resultRow} ${selected.some(s => s.id === u.id) ? styles.resultSelected : ''}`} onClick={() => toggle(u)}>
              <div className={styles.resultAvatar}>{u.name.charAt(0).toUpperCase()}</div>
              <div className={styles.resultInfo}>
                <div className={styles.resultName}>{u.name}</div>
                <div className={styles.resultRole}>{u.role}</div>
              </div>
              {selected.some(s => s.id === u.id) && <span className={styles.checkmark}>✓</span>}
            </div>
          ))}
          {!loading && q && results.length === 0 && <div className={styles.emptyText}>No users found</div>}
        </div>
        <div className={styles.modalFooter}>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary btn-sm" onClick={handleCreate} disabled={selected.length === 0}>
            {type === 'GROUP' ? 'Create Group' : 'Start Chat'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MessageBubble ────────────────────────────────────────────────────────────
function MessageBubble({ msg, isMine, onReply, onReact, onEdit, onDelete, onPin, onStar }: {
  msg: Message; isMine: boolean;
  onReply: (m: Message) => void; onReact: (id: string, emoji: string) => void;
  onEdit: (m: Message) => void; onDelete: (id: string) => void;
  onPin: (id: string) => void; onStar: (id: string) => void;
}) {
  const [showActions, setShowActions] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);

  if (msg.isDeleted) {
    return (
      <div className={`${styles.bubble} ${isMine ? styles.bubbleMine : styles.bubbleOther}`}>
        <p className={styles.deletedMsg}>🚫 Message deleted</p>
      </div>
    );
  }

  return (
    <div
      className={`${styles.bubbleWrap} ${isMine ? styles.bubbleWrapMine : ''}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => { setShowActions(false); setShowEmoji(false); }}
    >
      {!isMine && <div className={styles.bubbleAvatar}>{msg.senderName.charAt(0)}</div>}
      <div>
        {!isMine && <div className={styles.bubbleSender}>{msg.senderName}</div>}
        {msg.replyTo && (
          <div className={styles.replyPreview}>
            <span className={styles.replyName}>{msg.replyTo.senderName}</span>
            <span className={styles.replyContent}>{msg.replyTo.content.substring(0, 80)}…</span>
          </div>
        )}
        <div className={`${styles.bubble} ${isMine ? styles.bubbleMine : styles.bubbleOther}`}>
          {msg.type === 'IMAGE' && msg.fileUrl && (
            <img src={msg.fileUrl} alt={msg.fileName || 'image'} className={styles.msgImage} />
          )}
          {msg.type === 'FILE' && msg.fileUrl && (
            <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" className={styles.fileLink}>
              📎 {msg.fileName || 'File'}
            </a>
          )}
          {(msg.type === 'TEXT' || !msg.type) && (
            <p className={styles.bubbleText}>{msg.content}</p>
          )}
          {msg.isEdited && <span className={styles.editedTag}>edited</span>}
          {msg.isPinned && <span className={styles.pinnedTag}>📌</span>}
          <div className={styles.bubbleMeta}>
            <span className={styles.bubbleTime}>{formatTime(msg.createdAt)}</span>
          </div>
        </div>
        {Object.keys(msg.reactions || {}).length > 0 && (
          <div className={styles.reactions}>
            {Object.entries(msg.reactions).map(([emoji, users]) =>
              users.length > 0 ? (
                <span key={emoji} className={`${styles.reaction} ${users.includes(myId()) ? styles.reactionMine : ''}`} onClick={() => onReact(msg.id, emoji)}>
                  {emoji} {users.length}
                </span>
              ) : null
            )}
          </div>
        )}
      </div>
      {showActions && (
        <div className={`${styles.msgActions} ${isMine ? styles.msgActionsMine : ''}`}>
          <button title="Reply" onClick={() => onReply(msg)}>↩</button>
          <button title="React" onClick={() => setShowEmoji(v => !v)}>😊</button>
          <button title="Star" onClick={() => onStar(msg.id)}>⭐</button>
          <button title="Pin" onClick={() => onPin(msg.id)}>📌</button>
          {isMine && <button title="Edit" onClick={() => onEdit(msg)}>✏️</button>}
          <button title="Delete" onClick={() => onDelete(msg.id)}>🗑️</button>
          {showEmoji && (
            <div className={styles.emojiPicker}>
              {EMOJI_LIST.map(e => (
                <button key={e} onClick={() => { onReact(msg.id, e); setShowEmoji(false); }}>{e}</button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function InternalChatAdmin() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [editingMsg, setEditingMsg] = useState<Message | null>(null);
  const [searchQ, setSearchQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [msgLoading, setMsgLoading] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [showInfo, setShowInfo] = useState(false);
  const [pinnedMessages, setPinnedMessages] = useState<Message[]>([]);
  const [msgSearch, setMsgSearch] = useState('');
  const [showPriority, setShowPriority] = useState(false);
  const [fileUploading, setFileUploading] = useState(false);

  const socketRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimerRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentUserId = myId();

  // ── Load conversations ────────────────────────────────────────────────────
  const loadConversations = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/conversations`, { headers: authH() });
      const data = await r.json();
      setConversations(Array.isArray(data) ? data : []);
    } catch { setConversations([]); }
    setLoading(false);
  }, []);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  // ── Socket.IO ─────────────────────────────────────────────────────────────
  useEffect(() => {
    let socket: any;
    import('socket.io-client').then(({ io }) => {
      socket = io(`${SOCKET_URL}/chat`, {
        path: '/socket.io',
        auth: { token: localStorage.getItem('admin_token') },
        transports: ['websocket', 'polling'],
      });

      socketRef.current = socket;

      socket.on('newMessage', (msg: Message) => {
        setMessages(prev => [...prev, msg]);
        setConversations(prev => prev.map(c =>
          c.id === msg.conversationId ? { ...c, messages: [msg], updatedAt: msg.createdAt } : c
        ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
      });

      socket.on('messageEdited', (msg: Message) => {
        setMessages(prev => prev.map(m => m.id === msg.id ? msg : m));
      });

      socket.on('messageDeleted', ({ messageId }: { messageId: string }) => {
        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isDeleted: true, content: '[Message deleted]' } : m));
      });

      socket.on('reactionUpdated', ({ messageId, reactions }: any) => {
        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, reactions: JSON.parse(reactions) } : m));
      });

      socket.on('userTyping', ({ userId, userName, conversationId, isTyping }: any) => {
        if (userId === currentUserId) return;
        setTypingUsers(prev => ({ ...prev, [`${conversationId}:${userId}`]: isTyping }));
        if (isTyping) {
          setTimeout(() => setTypingUsers(prev => { const n = { ...prev }; delete n[`${conversationId}:${userId}`]; return n; }), 3000);
        }
      });

      socket.on('userOnline', ({ userId }: any) => setOnlineUsers(prev => new Set([...prev, userId])));
      socket.on('userOffline', ({ userId }: any) => setOnlineUsers(prev => { const s = new Set(prev); s.delete(userId); return s; }));

      socket.on('urgentMessage', ({ conversationId, priority, senderName }: any) => {
        if (priority === 'CRITICAL') {
          // Could integrate with browser notifications here
        }
      });
    });

    return () => socket?.disconnect();
  }, [currentUserId]);

  // ── Load messages for active conversation ─────────────────────────────────
  useEffect(() => {
    if (!activeConv) return;
    setMsgLoading(true);
    setMessages([]);

    // Join room
    socketRef.current?.emit('joinConversation', { conversationId: activeConv.id });

    fetch(`${API}/conversations/${activeConv.id}/messages`, { headers: authH() })
      .then(r => r.json())
      .then(d => { setMessages(d.data || []); })
      .catch(() => { /* Ignore message fetch errors */ })
      .finally(() => setMsgLoading(false));

    // Mark as read
    socketRef.current?.emit('markRead', { conversationId: activeConv.id });
    fetch(`${API}/conversations/${activeConv.id}/messages`, { headers: authH() });

    // Load pinned
    fetch(`${API}/conversations/${activeConv.id}/pinned`, { headers: authH() })
      .then(r => r.json())
      .then(d => setPinnedMessages(Array.isArray(d) ? d : []))
      .catch(() => { /* Ignore pinned message fetch errors */ });
  }, [activeConv?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Send message ──────────────────────────────────────────────────────────
  const sendMessage = async () => {
    if (!input.trim() || !activeConv) return;
    const content = editingMsg ? input : input;

    if (editingMsg) {
      socketRef.current?.emit('editMessage', { messageId: editingMsg.id, content, conversationId: activeConv.id });
      setEditingMsg(null);
    } else {
      socketRef.current?.emit('sendMessage', {
        conversationId: activeConv.id,
        content,
        type: 'TEXT',
        replyToId: replyTo?.id,
      });
      setReplyTo(null);
    }
    setInput('');
    clearTyping();
    inputRef.current?.focus();
  };

  const handleTyping = () => {
    if (!activeConv || !socketRef.current) return;
    socketRef.current.emit('typing', { conversationId: activeConv.id, isTyping: true });
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      socketRef.current?.emit('typing', { conversationId: activeConv.id, isTyping: false });
    }, 2000);
  };

  const clearTyping = () => {
    clearTimeout(typingTimerRef.current);
    socketRef.current?.emit('typing', { conversationId: activeConv?.id, isTyping: false });
  };

  // ── File upload ───────────────────────────────────────────────────────────
  const handleFileUpload = async (file: File) => {
    if (!activeConv) return;
    setFileUploading(true);
    try {
      // Check for configured storage — try server upload first
      const formData = new FormData();
      formData.append('file', file);
      const r = await fetch('/api/storage/upload', { method: 'POST', headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` }, body: formData });

      let fileUrl: string;
      const fileName = file.name;

      if (r.ok) {
        const d = await r.json();
        fileUrl = d.url;
      } else {
        // Local fallback: base64
        fileUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = e => resolve(e.target?.result as string);
          reader.readAsDataURL(file);
        });
      }

      const isImage = file.type.startsWith('image/');
      socketRef.current?.emit('sendMessage', {
        conversationId: activeConv.id,
        content: isImage ? '📷 Image' : `📎 ${fileName}`,
        type: isImage ? 'IMAGE' : 'FILE',
        fileUrl,
        fileName,
        fileSize: file.size,
        fileMime: file.type,
      });
    } catch { alert('Failed to upload file. Please try again.'); }
    setFileUploading(false);
  };

  // ── Message actions ───────────────────────────────────────────────────────
  const handleReact = (messageId: string, emoji: string) => {
    socketRef.current?.emit('reactToMessage', { messageId, emoji, conversationId: activeConv?.id });
  };
  const handleDelete = (messageId: string) => {
    if (!confirm('Delete this message?')) return;
    socketRef.current?.emit('deleteMessage', { messageId, conversationId: activeConv?.id });
  };
  const handlePin = async (messageId: string) => {
    await fetch(`${API}/messages/${messageId}/pin`, { method: 'POST', headers: authH() });
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isPinned: true } : m));
  };
  const handleStar = async (messageId: string) => {
    await fetch(`${API}/messages/${messageId}/star`, { method: 'POST', headers: authH() });
  };
  const handleSetPriority = async (priority: string) => {
    if (!activeConv) return;
    await fetch(`${API}/conversations/${activeConv.id}/priority`, { method: 'PATCH', headers: authH(), body: JSON.stringify({ priority }) });
    setActiveConv(prev => prev ? { ...prev, priority } : null);
    setConversations(prev => prev.map(c => c.id === activeConv.id ? { ...c, priority } : c));
    setShowPriority(false);
  };

  // ── Search messages ───────────────────────────────────────────────────────
  const filteredMsgs = msgSearch
    ? messages.filter(m => m.content.toLowerCase().includes(msgSearch.toLowerCase()))
    : messages;

  const typingInConv = activeConv ? Object.entries(typingUsers)
    .filter(([k, v]) => k.startsWith(activeConv.id) && v)
    .map(([k]) => k.split(':')[1]) : [];

  const filteredConvs = searchQ
    ? conversations.filter(c => {
        const name = getConvName(c, currentUserId);
        return name.toLowerCase().includes(searchQ.toLowerCase());
      })
    : conversations;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className={styles.container}>
      {/* ── LEFT PANEL: Conversation List ─────────────────────────────── */}
      <aside className={styles.leftPanel}>
        <div className={styles.leftHeader}>
          <h2 className={styles.leftTitle}>💬 Messages</h2>
          <button className={styles.newChatBtn} onClick={() => setShowNewChat(true)} title="New conversation">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"/></svg>
          </button>
        </div>
        <div className={styles.leftSearch}>
          <input placeholder="🔍 Search conversations…" value={searchQ} onChange={e => setSearchQ(e.target.value)} />
        </div>
        <div className={styles.convList}>
          {loading && <div className={styles.loadingText}>Loading…</div>}
          {filteredConvs.map(conv => {
            const name = getConvName(conv, currentUserId);
            const avatar = getConvAvatar(conv, currentUserId);
            const lastMsg = conv.messages?.[0];
            const otherUser = conv.participants.find(p => p.user.id !== currentUserId);
            const isOnline = otherUser ? onlineUsers.has(otherUser.user.id) : false;
            const priorityColor = PRIORITY_COLORS[conv.priority];
            return (
              <div
                key={conv.id}
                className={`${styles.convItem} ${activeConv?.id === conv.id ? styles.convItemActive : ''}`}
                onClick={() => setActiveConv(conv)}
              >
                <div className={styles.convAvatarWrap}>
                  <div className={styles.convAvatar}>{avatar}</div>
                  {isOnline && <div className={styles.onlineDot} />}
                </div>
                <div className={styles.convInfo}>
                  <div className={styles.convTopRow}>
                    <span className={styles.convName}>{name}</span>
                    <span className={styles.convTime}>{lastMsg ? formatTime(lastMsg.createdAt || conv.updatedAt) : formatTime(conv.updatedAt)}</span>
                  </div>
                  <div className={styles.convBotRow}>
                    <span className={styles.convPreview}>
                      {lastMsg ? (lastMsg.isDeleted ? '🚫 Deleted' : lastMsg.content.substring(0, 40)) : 'No messages yet'}
                    </span>
                    <div className={styles.convBadges}>
                      {conv.priority !== 'NORMAL' && <span className={styles.priorityDot} style={{ background: priorityColor }} title={PRIORITY_LABELS[conv.priority]} />}
                      {conv.unreadCount > 0 && <span className={styles.unreadBadge}>{conv.unreadCount}</span>}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {!loading && filteredConvs.length === 0 && (
            <div className={styles.emptyConvs}>
              <div className={styles.emptyIcon}>💬</div>
              <p>No conversations yet</p>
              <button className="btn btn-primary btn-sm" onClick={() => setShowNewChat(true)}>Start Chatting</button>
            </div>
          )}
        </div>
      </aside>

      {/* ── CENTER PANEL: Chat Area ────────────────────────────────────── */}
      <main className={styles.centerPanel}>
        {!activeConv ? (
          <div className={styles.noChatSelected}>
            <div className={styles.noChatIcon}>💬</div>
            <h3>Internal Communication Hub</h3>
            <p>Select a conversation or start a new chat with your team</p>
            <button className="btn btn-primary" onClick={() => setShowNewChat(true)}>+ New Conversation</button>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className={styles.chatHeader}>
              <div className={styles.chatHeaderLeft}>
                <div className={styles.chatAvatar}>{getConvAvatar(activeConv, currentUserId)}</div>
                <div>
                  <div className={styles.chatName}>{getConvName(activeConv, currentUserId)}</div>
                  <div className={styles.chatStatus}>
                    {typingInConv.length > 0
                      ? <span className={styles.typingIndicator}>typing…</span>
                      : <span>{activeConv.participants.length} members</span>
                    }
                  </div>
                </div>
              </div>
              <div className={styles.chatHeaderRight}>
                {/* Priority */}
                <div style={{ position: 'relative' }}>
                  <button
                    className={styles.priorityBtn}
                    style={{ color: PRIORITY_COLORS[activeConv.priority] }}
                    onClick={() => setShowPriority(v => !v)}
                    title="Set priority"
                  >
                    🔴 {PRIORITY_LABELS[activeConv.priority]}
                  </button>
                  {showPriority && (
                    <div className={styles.priorityMenu}>
                      {Object.entries(PRIORITY_LABELS).map(([p, l]) => (
                        <button key={p} className={styles.priorityMenuItem} style={{ color: PRIORITY_COLORS[p] }} onClick={() => handleSetPriority(p)}>{l}</button>
                      ))}
                    </div>
                  )}
                </div>
                <button className={styles.iconBtn} onClick={() => setShowInfo(v => !v)} title="Conversation info">ℹ️</button>
                <input
                  type="text"
                  placeholder="🔍 Search in chat"
                  className={styles.msgSearchInput}
                  value={msgSearch}
                  onChange={e => setMsgSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Pinned messages banner */}
            {pinnedMessages.length > 0 && (
              <div className={styles.pinnedBanner}>
                📌 {pinnedMessages.length} pinned message{pinnedMessages.length > 1 ? 's' : ''} — <span>{pinnedMessages[0].content.substring(0, 60)}</span>
              </div>
            )}

            {/* Messages */}
            <div className={styles.messagesArea}>
              {msgLoading && <div className={styles.loadingText}>Loading messages…</div>}
              {groupMessagesByDate(filteredMsgs).map(group => (
                <div key={group.date}>
                  <div className={styles.dateSeparator}><span>{group.date}</span></div>
                  {group.messages.map(msg => (
                    <MessageBubble
                      key={msg.id}
                      msg={msg}
                      isMine={msg.senderId === currentUserId}
                      onReply={setReplyTo}
                      onReact={handleReact}
                      onEdit={m => { setEditingMsg(m); setInput(m.content); inputRef.current?.focus(); }}
                      onDelete={handleDelete}
                      onPin={handlePin}
                      onStar={handleStar}
                    />
                  ))}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Typing indicator */}
            {typingInConv.length > 0 && (
              <div className={styles.typingBar}>
                <div className={styles.typingDots}><span/><span/><span/></div>
                <span>Someone is typing…</span>
              </div>
            )}

            {/* Reply preview */}
            {replyTo && (
              <div className={styles.replyBar}>
                <div>
                  <div className={styles.replyBarName}>↩ Replying to {replyTo.senderName}</div>
                  <div className={styles.replyBarContent}>{replyTo.content.substring(0, 80)}</div>
                </div>
                <button onClick={() => setReplyTo(null)}>✕</button>
              </div>
            )}

            {/* Edit indicator */}
            {editingMsg && (
              <div className={styles.replyBar} style={{ borderColor: '#d97706' }}>
                <div>
                  <div className={styles.replyBarName}>✏️ Editing message</div>
                  <div className={styles.replyBarContent}>{editingMsg.content.substring(0, 80)}</div>
                </div>
                <button onClick={() => { setEditingMsg(null); setInput(''); }}>✕</button>
              </div>
            )}

            {/* Input Area */}
            {!activeConv.isLocked ? (
              <div className={styles.inputArea}>
                <input
                  ref={fileInputRef}
                  type="file"
                  style={{ display: 'none' }}
                  onChange={e => { if (e.target.files?.[0]) handleFileUpload(e.target.files[0]); e.target.value = ''; }}
                  accept="image/*,.pdf,.doc,.docx,.xlsx,.xls,.csv,.txt"
                />
                <button className={styles.attachBtn} onClick={() => fileInputRef.current?.click()} disabled={fileUploading} title="Attach file">
                  {fileUploading ? '⏳' : '📎'}
                </button>
                <input
                  ref={inputRef}
                  className={styles.msgInput}
                  placeholder={editingMsg ? 'Edit message…' : 'Type a message…'}
                  value={input}
                  onChange={e => { setInput(e.target.value); handleTyping(); }}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                />
                <button className={styles.sendBtn} onClick={sendMessage} disabled={!input.trim()}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                </button>
              </div>
            ) : (
              <div className={styles.lockedBanner}>🔒 This conversation has been locked by an administrator</div>
            )}
          </>
        )}
      </main>

      {/* ── RIGHT PANEL: Info ──────────────────────────────────────────── */}
      {showInfo && activeConv && (
        <aside className={styles.rightPanel}>
          <div className={styles.rightHeader}>
            <h3>Conversation Info</h3>
            <button className={styles.iconBtn} onClick={() => setShowInfo(false)}>✕</button>
          </div>
          <div className={styles.infoSection}>
            <div className={styles.infoLabel}>MEMBERS ({activeConv.participants.length})</div>
            {activeConv.participants.map(p => (
              <div key={p.user.id} className={styles.memberRow}>
                <div className={styles.memberAvatar}>
                  {p.user.name.charAt(0)}
                  {onlineUsers.has(p.user.id) && <div className={styles.onlineDotSm} />}
                </div>
                <div>
                  <div className={styles.memberName}>{p.user.name} {p.user.id === currentUserId ? '(You)' : ''}</div>
                  <div className={styles.memberRole}>{p.user.role}</div>
                </div>
              </div>
            ))}
          </div>
          {pinnedMessages.length > 0 && (
            <div className={styles.infoSection}>
              <div className={styles.infoLabel}>PINNED MESSAGES</div>
              {pinnedMessages.map(m => (
                <div key={m.id} className={styles.pinnedItem}>
                  <div className={styles.pinnedContent}>{m.content.substring(0, 100)}</div>
                  <div className={styles.pinnedMeta}>{formatTime(m.createdAt)}</div>
                </div>
              ))}
            </div>
          )}
          <div className={styles.infoActions}>
            <button className="btn btn-secondary btn-sm btn-icon" onClick={async () => { await fetch(`${API}/conversations/${activeConv.id}/archive`, { method: 'POST', headers: authH() }); loadConversations(); setActiveConv(null); setShowInfo(false); }}>
              📂 Archive
            </button>
            <a className="btn btn-secondary btn-sm btn-icon" href={`${API}/admin/export/${activeConv.id}`} target="_blank" rel="noopener noreferrer">
              📥 Export
            </a>
            <button className="btn btn-danger btn-sm btn-icon" onClick={async () => { if (!confirm('Lock this conversation? No new messages can be sent.')) return; await fetch(`${API}/conversations/${activeConv.id}/lock`, { method: 'POST', headers: authH() }); setActiveConv(prev => prev ? { ...prev, isLocked: true } : null); }}>
              🔒 Lock
            </button>
          </div>
        </aside>
      )}

      {showNewChat && <UserSearchModal onSelect={() => loadConversations()} onClose={() => { setShowNewChat(false); loadConversations(); }} />}
    </div>
  );
}
