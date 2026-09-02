import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getConversations } from '../../api/chat.api';

export default function Conversations() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadConversations = async () => {
    setLoading(true);
    try {
      const response = await getConversations();
      setConversations(response?.data?.data || []);
      setError('');
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load conversations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  if (loading) return <div className="admin-state">Loading conversations...</div>;
  if (error) return <div className="admin-state admin-error">{error}</div>;

  return (
    <div>
      <h2>Conversations</h2>
      {!conversations.length ? (
        <p>No conversations yet.</p>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {conversations.map((chat) => {
            const other = chat.participants?.find((p) => p._id && p._id !== chat.participants[0]?._id) || chat.participants?.[1] || chat.participants?.[0];
            return (
              <div key={chat._id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                  <div>
                    <strong>{other?.name || other?.email || 'User'}</strong>
                    <div style={{ color: '#64748b', fontSize: '0.875rem' }}>
                      {chat.product?.name ? `Product: ${chat.product.name}` : ''}
                      {chat.order?._id ? `Order #${String(chat.order._id).slice(-8)}` : ''}
                    </div>
                  </div>
                  <div style={{ color: '#64748b', fontSize: '0.875rem' }}>
                    {new Date(chat.updatedAt).toLocaleDateString()}
                  </div>
                </div>
                <Link to={`/conversations/${chat._id}`} style={{ display: 'inline-block', marginTop: '0.75rem' }}>
                  Open chat
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
