import { useEffect, useState } from 'react';
import { getReturns, approveReturn, rejectReturn, refundReturn } from '../../api/return.api';

const statusStyles = {
  pending: { background: '#fff3d6', color: '#7d5b00' },
  approved: { background: '#dff6e8', color: '#1c6f4c' },
  rejected: { background: '#fee4df', color: '#9a2a22' },
  refunded: { background: '#dff6e8', color: '#1c6f4c' },
};

export default function Returns() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionId, setActionId] = useState(null);

  const loadReturns = async () => {
    setLoading(true);
    try {
      const response = await getReturns();
      setReturns(response?.data?.data || []);
      setError('');
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load returns');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReturns();
  }, []);

  const handleAction = async (returnId, action, refundStatus = null) => {
    setActionId(returnId);
    setError('');

    try {
      if (action === 'approve') await approveReturn(returnId);
      else if (action === 'reject') await rejectReturn(returnId);
      else if (action === 'refund') await refundReturn(returnId, refundStatus);
      await loadReturns();
    } catch (err) {
      setError(err?.response?.data?.message || `Unable to ${action} return`);
    } finally {
      setActionId(null);
    }
  };

  if (loading) return <div className="admin-state">Loading returns...</div>;

  return <div className="admin-page">
    <div className="admin-page-heading">
      <div>
        <p className="admin-kicker">Returns</p>
        <h1>Return requests</h1>
        <p className="admin-muted">Review and process customer return requests.</p>
      </div>
    </div>
    {error ? <div className="admin-error admin-inline-error">{error}</div> : null}
    <section className="admin-panel table-panel">
      {returns.length === 0 ? <p className="admin-empty">No return requests found.</p> : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Refund</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {returns.map((returnRequest) => (
                <tr key={returnRequest._id}>
                  <td><strong>#{String(returnRequest.order?._id || returnRequest.order).slice(-8)}</strong></td>
                  <td>{returnRequest.user?.name || returnRequest.user?.email || 'Customer'}</td>
                  <td>{returnRequest.reason}</td>
                  <td><span className={`status ${statusStyles[returnRequest.status] ? 'status-' + returnRequest.status : 'status'}`} style={statusStyles[returnRequest.status] || {}}>{returnRequest.status}</span></td>
                  <td>{returnRequest.refundStatus}</td>
                  <td>
                    {returnRequest.status === 'pending' ? (
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button type="button" className="button-primary" disabled={actionId === returnRequest._id} onClick={() => handleAction(returnRequest._id, 'approve')} style={{ padding: '0.35rem 0.75rem', fontSize: '0.875rem' }}>
                          {actionId === returnRequest._id ? 'Working...' : 'Approve'}
                        </button>
                        <button type="button" className="button-quiet" disabled={actionId === returnRequest._id} onClick={() => handleAction(returnRequest._id, 'reject')} style={{ padding: '0.35rem 0.75rem', fontSize: '0.875rem', border: '1px solid #f7c6c2', color: '#9a2a22' }}>
                          Reject
                        </button>
                      </div>
                    ) : returnRequest.status === 'approved' && returnRequest.refundStatus === 'pending' ? (
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button type="button" className="button-primary" disabled={actionId === returnRequest._id} onClick={() => handleAction(returnRequest._id, 'refund', 'completed')} style={{ padding: '0.35rem 0.75rem', fontSize: '0.875rem' }}>
                          Mark refunded
                        </button>
                        <button type="button" className="button-quiet" disabled={actionId === returnRequest._id} onClick={() => handleAction(returnRequest._id, 'refund', 'failed')} style={{ padding: '0.35rem 0.75rem', fontSize: '0.875rem', border: '1px solid #f7c6c2', color: '#9a2a22' }}>
                          Mark failed
                        </button>
                      </div>
                    ) : (
                      <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  </div>;
}