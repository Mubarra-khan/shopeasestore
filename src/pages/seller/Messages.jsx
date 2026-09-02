import { useEffect, useRef, useState } from 'react';
import { getConversations, getMessages, sendMessage, markMessagesRead, uploadChatAttachment } from '../../api/chat.api';
import { useAuth } from '../../context/AuthContext';

export default function SellerMessages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [attachment, setAttachment] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const loadConversations = async () => {
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
    loadConversations();
  }, []);

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

  if (loadingConversations) return <div className="seller-state">Loading conversations...</div>;
  if (error && !activeChatId) return <div className="seller-error">{error}</div>;

  return (
    <div className="seller-page">
      <div className="seller-page-heading">
        <div>
          <p className="seller-kicker">Inbox</p>
          <h1>Messages</h1>
          <p className="seller-muted">Customer conversations</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: activeChatId ? '280px 1fr' : '280px', gap: 0, border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden', background: '#fff', minHeight: 520 }}>
        <div style={{ borderRight: activeChatId ? '1px solid #e2e8f0' : 'none', overflowY: 'auto', background: '#f8fafc' }}>
          {conversations.length === 0 ? (
            <p style={{ color: '#64748b', padding: '1rem' }}>No conversations yet.</p>
          ) : (
            <div style={{ display: 'grid', gap: '0.5rem', padding: '0.5rem' }}>
              {conversations.map((chat) => {
                const other = getOtherParticipant(chat);
                const isActive = chat._id === activeChatId;
                return (
                  <button
                    key={chat._id}
                    type="button"
                    onClick={() => setActiveChatId(chat._id)}
                    style={{ background: isActive ? '#fff' : 'transparent', border: isActive ? '1px solid #e2e8f0' : '1px solid transparent', borderRadius: 10, padding: '0.75rem', cursor: 'pointer', textAlign: 'left', width: '100%', boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.05)' : 'none' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                      <strong style={{ fontSize: '0.875rem' }}>{other?.name || other?.email || 'User'}</strong>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {chat.lastMessageAt ? new Date(chat.lastMessageAt).toLocaleDateString() : ''}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#475569', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {chat.lastMessage || 'No messages yet'}
                    </p>
                    {chat.product?.name && (
                      <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#64748b' }}>
                        Product: {chat.product.name}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {activeChatId && (
          <div style={{ display: 'flex', flexDirection: 'column', background: '#fff' }}>
            <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button type="button" onClick={() => setActiveChatId(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1rem', color: '#64748b' }}>
                ←
              </button>
              <div>
                <strong style={{ fontSize: '0.875rem' }}>
                  {conversations.find((c) => c._id === activeChatId) ? getOtherParticipant(conversations.find((c) => c._id === activeChatId))?.name || 'Chat' : 'Chat'}
                </strong>
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', background: '#f8fafc' }}>
              {loadingMessages ? (
                <p style={{ color: '#64748b' }}>Loading messages...</p>
              ) : messages.length === 0 ? (
                <p style={{ color: '#64748b' }}>No messages yet.</p>
              ) : (
                messages.map((message, index) => {
                  const isMine = message.sender === user?._id;
                  return (
                    <div key={index} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start', marginBottom: '0.75rem' }}>
                      <div style={{ background: isMine ? '#111827' : '#fff', color: isMine ? '#fff' : '#17211e', padding: '0.6rem 0.9rem', borderRadius: 12, maxWidth: '75%', border: isMine ? 'none' : '1px solid #e2e8f0' }}>
                        {message.attachment?.type === 'image' && message.attachment?.url ? (
                          <img src={message.attachment.url} alt={message.attachment.name || 'attachment'} style={{ maxWidth: '100%', borderRadius: 6, display: 'block', marginBottom: message.text ? '0.5rem' : 0 }} />
                        ) : message.attachment?.type === 'video' && message.attachment?.url ? (
                          <video src={message.attachment.url} controls style={{ maxWidth: '100%', borderRadius: 6, display: 'block', marginBottom: message.text ? '0.5rem' : 0 }} />
                        ) : message.attachment?.type === 'file' && message.attachment?.url ? (
                          <a href={message.attachment.url} target="_blank" rel="noreferrer" style={{ color: '#93c5fd', textDecoration: 'underline', wordBreak: 'break-word', display: 'block', marginBottom: message.text ? '0.5rem' : 0 }}>{message.attachment.name || 'Download file'}</a>
                        ) : null}
                        {message.text ? <p style={{ margin: 0, fontSize: '0.875rem' }}>{message.text}</p> : null}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.75rem', padding: '0.75rem', borderTop: '1px solid #e2e8f0', background: '#fff', alignItems: 'center' }}>
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
                placeholder="Type a message..."
                style={{ flex: 1, padding: '0.6rem 0.9rem', border: '1px solid #d8e2dc', borderRadius: 8, fontSize: '0.875rem' }}
              />
              <button type="submit" disabled={sending || (!text.trim() && !attachment)} style={{ background: sending || (!text.trim() && !attachment) ? '#e2e8f0' : '#111827', color: '#fff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: 8, cursor: sending || (!text.trim() && !attachment) ? 'not-allowed' : 'pointer', fontSize: '0.875rem' }}>
                {sending ? 'Sending...' : 'Send'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
