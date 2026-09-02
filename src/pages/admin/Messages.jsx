import { useEffect, useRef, useState } from 'react';
import { getAllConversations, getMessages } from '../../api/chat.api';

export default function AdminMessages() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef(null);

  const loadConversations = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getAllConversations();
      setConversations(response?.data?.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load conversations');
    } finally {
      setLoading(false);
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

  if (loading) return <div className="admin-state">Loading conversations...</div>;
  if (error && !activeChatId) return <div className="admin-state admin-error">{error}</div>;

  return (
    <div className="admin-page">
      <div className="admin-page-heading">
        <div>
          <p className="admin-kicker">Oversight</p>
          <h1>Messages</h1>
          <p className="admin-muted">All customer-seller conversations</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: activeChatId ? '300px 1fr' : '300px', gap: 0, border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden', background: '#fff', minHeight: 520 }}>
        <div style={{ borderRight: activeChatId ? '1px solid #e2e8f0' : 'none', overflowY: 'auto', background: '#f8fafc' }}>
          {conversations.length === 0 ? (
            <p style={{ color: '#64748b', padding: '1rem' }}>No conversations yet.</p>
          ) : (
            <div style={{ display: 'grid', gap: '0.5rem', padding: '0.5rem' }}>
              {conversations.map((chat) => {
                const participants = chat.participants || [];
                const customer = participants.find((p) => p.role === 'customer');
                const seller = participants.find((p) => p.role === 'seller');
                const isActive = chat._id === activeChatId;
                return (
                  <button
                    key={chat._id}
                    type="button"
                    onClick={() => setActiveChatId(chat._id)}
                    style={{ background: isActive ? '#fff' : 'transparent', border: isActive ? '1px solid #e2e8f0' : '1px solid transparent', borderRadius: 10, padding: '0.75rem', cursor: 'pointer', textAlign: 'left', width: '100%', boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.05)' : 'none' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                      <strong style={{ fontSize: '0.875rem' }}>{customer?.name || customer?.email || 'Customer'}</strong>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {chat.lastMessageAt ? new Date(chat.lastMessageAt).toLocaleDateString() : ''}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#475569' }}>
                      Seller: {seller?.name || seller?.email || 'Unknown'}
                    </p>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
            <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #e2e8f0' }}>
              <strong style={{ fontSize: '0.875rem' }}>Conversation</strong>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', background: '#f8fafc' }}>
              {loadingMessages ? (
                <p style={{ color: '#64748b' }}>Loading messages...</p>
              ) : messages.length === 0 ? (
                <p style={{ color: '#64748b' }}>No messages yet.</p>
              ) : (
                messages.map((message, index) => {
                  const participants = conversations.find((c) => c._id === activeChatId)?.participants || [];
                  const isCustomer = message.sender === participants.find((p) => p.role === 'customer')?._id;
                  const isSeller = message.sender === participants.find((p) => p.role === 'seller')?._id;
                  const label = isCustomer ? 'Customer' : isSeller ? 'Seller' : 'User';
                  return (
                    <div key={index} style={{ marginBottom: '0.75rem' }}>
                      <div style={{ background: '#fff', padding: '0.6rem 0.9rem', borderRadius: 12, border: '1px solid #e2e8f0', maxWidth: '85%' }}>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>{label}</p>
                        <p style={{ margin: 0, fontSize: '0.875rem' }}>{message.text}</p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
