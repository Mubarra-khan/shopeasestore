import { useState } from 'react';
import { getAiSupport, createSupportConversation } from '../../api/support.api';
import { useNavigate } from 'react-router-dom';

const suggestions = [
  'How do I track my order?',
  'Can I cancel my order?',
  'How do returns work?',
  'Is Cash on Delivery available?',
  'How do I apply a coupon?',
];

export default function Support() {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'support',
      text: 'Hello! I\'m your AI Support Assistant. How can I help you today?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [escalating, setEscalating] = useState(false);
  const navigate = useNavigate();

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return;

    const userMessage = { id: Date.now().toString(), sender: 'user', text: text.trim() };
    setMessages((current) => [...current, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await getAiSupport(text.trim());
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'support',
        text: response?.data?.data?.message || 'I\'m not sure how to help with that yet. Please try requesting human support.',
      };
      setMessages((current) => [...current, aiMessage]);
    } catch {
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'support',
        text: 'Sorry, I\'m having trouble connecting right now. Please try requesting human support.',
      };
      setMessages((current) => [...current, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage(input);
  };

  const handleEscalate = async () => {
    setEscalating(true);
    try {
      const response = await createSupportConversation('I need human support assistance.');
      const chatId = response?.data?.data?._id;
      if (chatId) {
        navigate(`/conversations/${chatId}`);
      }
    } catch {
      alert('Unable to create support conversation. Please try again.');
    } finally {
      setEscalating(false);
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: '2rem auto', padding: '0 1rem' }}>
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e5e7eb', background: '#f8fafc' }}>
          <h1 style={{ margin: 0, fontSize: '1.25rem' }}>AI Support Assistant</h1>
          <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.875rem' }}>Ask me anything about your orders, products, shipping, returns, or account.</p>
        </div>

        <div style={{ height: 420, overflowY: 'auto', padding: '1.5rem', background: '#f8fafc' }}>
          {messages.length === 0 ? (
            <p style={{ color: '#64748b', textAlign: 'center', marginTop: '3rem' }}>No messages yet. Start a conversation below.</p>
          ) : (
            messages.map((message) => {
              const isUser = message.sender === 'user';
              return (
                <div key={message.id} style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', marginBottom: '0.75rem' }}>
                  <div style={{
                    background: isUser ? '#111827' : '#fff',
                    color: isUser ? '#fff' : '#17211e',
                    padding: '0.75rem 1rem',
                    borderRadius: 12,
                    maxWidth: '80%',
                    border: isUser ? 'none' : '1px solid #e2e8f0',
                    whiteSpace: 'pre-wrap',
                  }}>
                    {message.text}
                  </div>
                </div>
              );
            })
          )}
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '0.75rem' }}>
              <div style={{ background: '#fff', padding: '0.75rem 1rem', borderRadius: 12, border: '1px solid #e2e8f0', color: '#64748b' }}>
                Thinking...
              </div>
            </div>
          )}
        </div>

        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #e5e7eb', background: '#fff' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question..."
              disabled={loading}
              style={{ flex: 1, padding: '0.75rem 1rem', border: '1px solid #d8e2dc', borderRadius: 8, font: 'inherit' }}
            />
            <button type="submit" disabled={loading || !input.trim()} style={{ background: '#111827', color: '#fff', border: 'none', padding: '0.75rem 1.25rem', borderRadius: 8, cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Sending...' : 'Send'}
            </button>
          </form>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => sendMessage(suggestion)}
                disabled={loading}
                style={{
                  background: '#fff',
                  border: '1px solid #cbd5e1',
                  padding: '0.4rem 0.75rem',
                  borderRadius: 999,
                  fontSize: '0.8rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  color: '#334155',
                }}
              >
                {suggestion}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleEscalate}
            disabled={escalating}
            style={{
              background: '#fff',
              color: '#111827',
              border: '1px solid #cbd5e1',
              padding: '0.6rem 1rem',
              borderRadius: 8,
              cursor: escalating ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              width: '100%',
            }}
          >
            {escalating ? 'Creating conversation...' : 'Request Human Support'}
          </button>
        </div>
      </div>
    </div>
  );
}
