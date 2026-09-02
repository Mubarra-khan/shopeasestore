import { useEffect, useState, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getMessages, sendMessage } from '../../api/chat.api';
import { useAuth } from '../../context/AuthContext';

export default function ChatDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);

  const loadMessages = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getMessages(id);
      setMessages(response?.data?.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadMessages();
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (event) => {
    event.preventDefault();
    if (!text.trim()) return;

    setSending(true);
    setError('');

    try {
      const response = await sendMessage(id, text.trim());
      setMessages((current) => [...current, response?.data?.data]);
      setText('');
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to send message');
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div>Loading messages...</div>;
  if (error) return <div style={{ color: 'crimson' }}>{error}</div>;

  return (
    <div>
      <Link to="/conversations">← Back to conversations</Link>
      <h2>Chat</h2>
      <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: '1rem', height: 400, overflowY: 'auto', background: '#f8fafc' }}>
        {messages.length === 0 ? (
          <p style={{ color: '#64748b' }}>No messages yet.</p>
        ) : (
          messages.map((message, index) => {
            const isMine = message.sender === user?._id;
            return (
              <div key={index} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start', marginBottom: '0.75rem' }}>
                <div style={{ background: isMine ? '#111827' : '#fff', color: isMine ? '#fff' : '#17211e', padding: '0.6rem 0.9rem', borderRadius: 12, maxWidth: '70%', border: isMine ? 'none' : '1px solid #e2e8f0' }}>
                  <p style={{ margin: 0 }}>{message.text}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message..." style={{ flex: 1, padding: '0.6rem 0.9rem', border: '1px solid #d8e2dc', borderRadius: 8 }} />
        <button type="submit" disabled={sending || !text.trim()} style={{ background: '#111827', color: '#fff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: 8, cursor: sending ? 'not-allowed' : 'pointer' }}>
          {sending ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
}
