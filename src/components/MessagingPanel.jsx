import { useEffect, useRef, useState } from 'react';
import { getConversations, getMessages, sendMessage, markMessagesRead, uploadChatAttachment } from '../api/chat.api';
import { useAuth } from '../context/AuthContext';

export default function MessagingPanel({ open, onClose, product, preselectedChatId }) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [activeChatId, setActiveChatId] = useState(preselectedChatId || null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [attachment, setAttachment] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const loadConversations = async () => {
    if (!open) return;
    setLoadingConversations(true);
    setError('');
    try {
      const response = await getConversations();
      setConversations(response?.data?.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load conversations');
    } finally {
      setLoadingConversations(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadConversations();
    }
  }, [open]);

  useEffect(() => {
    if (preselectedChatId && open) {
      setActiveChatId(preselectedChatId);
    }
  }, [preselectedChatId, open]);

  const loadMessages = async (chatId) => {
    setLoadingMessages(true);
    setError('');
    try {
      const response = await getMessages(chatId);
      setMessages(response?.data?.data || []);
      await markMessagesRead(chatId);
      setConversations((current) =>
        current.map((chat) =>
          chat._id === chatId ? { ...chat, messages: response?.data?.data || [] } : chat
        )
      );
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load messages');
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (activeChatId) {
      loadMessages(activeChatId);
    }
  }, [activeChatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (event) => {
    event.preventDefault();
    if ((!text.trim() && !attachment) || !activeChatId) return;

    setSending(true);
    setError('');
    try {
      let attachmentPayload = null;
      if (attachment) {
        const uploadResponse = await uploadChatAttachment(attachment);
        const uploadData = uploadResponse?.data?.data || uploadResponse?.data;
        if (uploadData?.url) {
          attachmentPayload = {
            url: uploadData.url,
            type: uploadData.type,
            name: uploadData.name,
            size: uploadData.size,
          };
        }
      }

      const response = await sendMessage(activeChatId, text.trim(), attachmentPayload);
      setMessages((current) => [...current, response?.data?.data]);
      setText('');
      setAttachment(null);
      setConversations((current) =>
        current.map((chat) =>
          chat._id === activeChatId ? { ...chat, lastMessage: text.trim() || "Sent an attachment", lastMessageAt: new Date() } : chat
        )
      );
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to send message');
    } finally {
      setSending(false);
    }
  };

  const handleAttachmentSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setAttachment(file);
  };

  const getOtherParticipant = (chat) => {
    if (!chat?.participants?.length) return null;
    return chat.participants.find((p) => p._id && p._id !== user?._id) || chat.participants[0];
  };

  if (!open) return null;

  const activeChat = conversations.find((c) => c._id === activeChatId);
  const other = activeChat ? getOtherParticipant(activeChat) : null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)' }} onClick={onClose} />
      <div style={{ position: 'relative', width: '100%', maxWidth: 780, height: '520px', maxHeight: '90vh', background: '#fff', borderRadius: 8, boxShadow: '0 20px 50px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '0.65rem 1rem', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1rem', color: '#111827' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </span>
            <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#111827' }}>Messages</span>
          </div>
          <button type="button" onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#64748b', lineHeight: 1 }}>×</button>
        </div>

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <div style={{ width: 280, borderRight: '1px solid #e5e7eb', background: '#f8fafc', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
            {loadingConversations ? (
              <div style={{ padding: '1rem', color: '#64748b', fontSize: '0.875rem' }}>Loading conversations...</div>
            ) : conversations.length === 0 ? (
              <div style={{ padding: '1rem', color: '#64748b', fontSize: '0.875rem' }}>No conversations yet.</div>
            ) : (
              <div style={{ overflowY: 'auto', flex: 1 }}>
                {conversations.map((chat) => {
                  const otherUser = getOtherParticipant(chat);
                  const isActive = chat._id === activeChatId;
                  return (
                    <button
                      key={chat._id}
                      type="button"
                      onClick={() => setActiveChatId(chat._id)}
                      style={{
                        width: '100%',
                        padding: '0.75rem 0.85rem',
                        border: 'none',
                        borderBottom: '1px solid #e5e7eb',
                        background: isActive ? '#fff' : 'transparent',
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        gap: '0.65rem',
                        alignItems: 'center',
                      }}
                    >
                      <div style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        background: '#e2e8f0',
                        color: '#475569',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        textTransform: 'uppercase',
                      }}>
                        {(otherUser?.name || otherUser?.email || 'U').charAt(0)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.15rem' }}>
                          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {otherUser?.name || otherUser?.email || 'User'}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: '#94a3b8', flexShrink: 0, marginLeft: '0.5rem' }}>
                            {chat.lastMessageAt ? new Date(chat.lastMessageAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : ''}
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {chat.lastMessage || 'No messages yet'}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff', minWidth: 0 }}>
            {!activeChatId ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.875rem' }}>
                Select a conversation to start messaging
              </div>
            ) : (
              <>
                <div style={{ padding: '0.6rem 1rem', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#fff' }}>
                  <button type="button" onClick={() => setActiveChatId(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', padding: 0, display: 'flex', alignItems: 'center' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                  </button>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#e2e8f0', color: '#475569', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, textTransform: 'uppercase' }}>
                    {(other?.name || other?.email || 'U').charAt(0)}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {other?.name || other?.email || 'Chat'}
                    </div>
                    {activeChat?.product?.name && (
                      <div style={{ fontSize: '0.72rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {activeChat.product.name}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem 0.85rem', background: '#fff' }}>
                  {loadingMessages ? (
                    <div style={{ color: '#64748b', fontSize: '0.875rem' }}>Loading messages...</div>
                  ) : messages.length === 0 ? (
                    <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>No messages yet. Say hello!</div>
                  ) : (
                    messages.map((message, index) => {
                      const isMine = message.sender === user?._id;
                      return (
                        <div key={index} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start', marginBottom: '0.65rem' }}>
                          <div style={{
                            maxWidth: '72%',
                            padding: '0.45rem 0.7rem',
                            borderRadius: 10,
                            fontSize: '0.85rem',
                            lineHeight: 1.4,
                            background: isMine ? '#111827' : '#fff',
                            color: isMine ? '#fff' : '#17211e',
                            border: isMine ? 'none' : '1px solid #e5e7eb',
                            wordBreak: 'break-word',
                          }}>
                            {message.attachment?.type === 'image' && message.attachment?.url ? (
                              <img src={message.attachment.url} alt={message.attachment.name || 'attachment'} style={{ maxWidth: '100%', borderRadius: 6, display: 'block', marginBottom: message.text ? '0.5rem' : 0 }} />
                            ) : message.attachment?.type === 'video' && message.attachment?.url ? (
                              <video src={message.attachment.url} controls style={{ maxWidth: '100%', borderRadius: 6, display: 'block', marginBottom: message.text ? '0.5rem' : 0 }} />
                            ) : message.attachment?.type === 'file' && message.attachment?.url ? (
                              <a href={message.attachment.url} target="_blank" rel="noreferrer" style={{ color: '#93c5fd', textDecoration: 'underline', wordBreak: 'break-word', display: 'block', marginBottom: message.text ? '0.5rem' : 0 }}>{message.attachment.name || 'Download file'}</a>
                            ) : null}
                            {message.text ? <p style={{ margin: 0 }}>{message.text}</p> : null}
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.5rem', padding: '0.6rem 0.75rem', borderTop: '1px solid #e5e7eb', background: '#fff', alignItems: 'center' }}>
                  <button type="button" onClick={() => fileInputRef.current?.click()} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', padding: 0, display: 'flex', alignItems: 'center' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                    onChange={handleAttachmentSelect}
                    style={{ display: 'none' }}
                  />
                  <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Write your message..."
                    style={{ flex: 1, padding: '0.55rem 0.75rem', border: '1px solid #e5e7eb', borderRadius: 20, fontSize: '0.875rem', outline: 'none', background: '#fff' }}
                  />
                  <button type="submit" disabled={sending || (!text.trim() && !attachment)} style={{ background: sending || (!text.trim() && !attachment) ? '#e2e8f0' : '#111827', color: '#fff', border: 'none', padding: '0.45rem 0.85rem', borderRadius: 20, cursor: sending || (!text.trim() && !attachment) ? 'not-allowed' : 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
                    {sending ? '...' : 'Send'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
