import React, { useEffect, useState } from 'react';
import { api } from '../api';

export default function PendingRequestsPanel({ groupId, isAdmin }) {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      setLoading(true);
      try {
        const res = await api.getPendingRequests(groupId);
        setPendingRequests(res.pendingRequests || []);
      } catch (err) {
        setError('Failed to load pending requests');
      } finally {
        setLoading(false);
      }
    })();
  }, [groupId, isAdmin]);

  const handleApprove = async (userId) => {
    setActionLoading(userId + '-approve');
    try {
      await api.approveJoinRequest(groupId, userId);
      setPendingRequests(pr => pr.filter(u => u._id !== userId && u.id !== userId));
    } catch (err) {
      alert('Failed to approve: ' + (err.message || 'Unknown error'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleDecline = async (userId) => {
    setActionLoading(userId + '-decline');
    try {
      await api.declineJoinRequest(groupId, userId);
      setPendingRequests(pr => pr.filter(u => u._id !== userId && u.id !== userId));
    } catch (err) {
      alert('Failed to decline: ' + (err.message || 'Unknown error'));
    } finally {
      setActionLoading(null);
    }
  };

  if (!isAdmin) return null;
  if (loading) return <div className="my-4 text-center">Loading pending requests...</div>;
  if (error) return <div className="my-4 text-center text-red-500">{error}</div>;
  if (!pendingRequests.length) return <div className="my-4 text-center text-gray-500">No pending requests.</div>;

  return (
    <div className="my-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <h4 className="font-semibold text-yellow-800 mb-2">Pending Join Requests</h4>
      <ul>
        {pendingRequests.map(u => (
          <li key={u._id || u.id} className="flex items-center justify-between mb-2">
            <span>{u.name || u.email}</span>
            <div className="flex gap-2">
              <button
                className="px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 text-xs"
                onClick={() => handleApprove(u._id || u.id)}
                disabled={actionLoading === (u._id || u.id) + '-approve'}
              >
                {actionLoading === (u._id || u.id) + '-approve' ? 'Approving...' : 'Approve'}
              </button>
              <button
                className="px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-xs"
                onClick={() => handleDecline(u._id || u.id)}
                disabled={actionLoading === (u._id || u.id) + '-decline'}
              >
                {actionLoading === (u._id || u.id) + '-decline' ? 'Declining...' : 'Decline'}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
