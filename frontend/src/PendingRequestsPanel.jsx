import React, { useEffect, useState } from 'react';
import { api } from './api';

export default function PendingRequestsPanel({ group, currentUser, onAction }) {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!group?._id) return;
    setLoading(true);
    api.getPendingRequests(group._id)
      .then(res => setPending(res.pendingRequests || []))
      .catch(err => setError(err.message || 'Failed to fetch pending requests.'))
      .finally(() => setLoading(false));
  }, [group?._id]);

  const handleApprove = async (userId) => {
    setLoading(true);
    setError('');
    try {
      await api.approveJoinRequest(group._id, userId);
      setPending(pending.filter(u => u._id !== userId));
      if (onAction) onAction();
    } catch (err) {
      setError(err.message || 'Failed to approve request.');
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async (userId) => {
    setLoading(true);
    setError('');
    try {
      await api.declineJoinRequest(group._id, userId);
      setPending(pending.filter(u => u._id !== userId));
      if (onAction) onAction();
    } catch (err) {
      setError(err.message || 'Failed to decline request.');
    } finally {
      setLoading(false);
    }
  };

  if (!group.admins?.includes(currentUser?._id)) return null;

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6">
      <h3 className="text-lg font-bold mb-2 text-blue-700">Pending Join Requests for {group.name}</h3>
      {loading && <div className="text-gray-500">Loading...</div>}
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {pending.length === 0 && !loading ? (
        <div className="text-gray-500">No pending requests.</div>
      ) : (
        <ul className="space-y-2">
          {pending.map(user => (
            <li key={user._id} className="flex items-center justify-between border-b pb-2">
              <span>{user.name || user.email}</span>
              <div className="flex gap-2">
                <button
                  className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                  onClick={() => handleApprove(user._id)}
                  disabled={loading}
                >Approve</button>
                <button
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                  onClick={() => handleDecline(user._id)}
                  disabled={loading}
                >Decline</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
