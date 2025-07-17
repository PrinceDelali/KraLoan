import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from './api';
import PendingRequestsPanel from './components/PendingRequestsPanel';
import GroupMessagesBoard from './components/GroupMessagesBoard';
import GroupLoansBoard from './components/GroupLoansBoard';

export default function GroupDetails() {
  const { groupId } = useParams();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingCount, setPendingCount] = useState(0);
  const [pendingLoading, setPendingLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const groups = await api.listGroups();
        const found = groups.find(g => g._id === groupId);
        if (found) setGroup(found);
        else setError('Group not found.');
      } catch (err) {
        setError('Failed to fetch group info.');
      } finally {
        setLoading(false);
      }
    })();
  }, [groupId]);

  // Fetch pending requests count for admin
  useEffect(() => {
    if (!group) return;
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const isAdmin = group.admins.some(a => (a._id || a.id) === currentUser._id);
    if (!isAdmin) return;
    setPendingLoading(true);
    api.getPendingRequests(group._id)
      .then(res => setPendingCount((res.pendingRequests || []).length))
      .catch(() => setPendingCount(0))
      .finally(() => setPendingLoading(false));
  }, [group]);

  if (loading) return <div className="p-12 text-center">Loading group details...</div>;
  if (error) return <div className="p-12 text-center text-red-500">{error}</div>;

  // Helper: get role for a member
  function getRole(member) {
    if (group.admins.some(a => (a._id || a.id) === (member._id || member.id))) return 'Admin';
    return 'Member';
  }
  // Assume current user info is in localStorage
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = group.admins.some(a => (a._id || a.id) === currentUser._id);
  const inviteLink = group.inviteToken ? `${window.location.origin}/register?inviteToken=${group.inviteToken}` : '';

  // Handler: remove member (admin only)
  async function handleRemove(memberId) {
    if (!window.confirm('Remove this member from the group?')) return;
    try {
      await api.removeMember(group._id, memberId);
      window.location.reload();
    } catch (err) {
      alert('Failed to remove member: ' + (err.message || 'Unknown error'));
    }
  }

  const [tab, setTab] = React.useState('messages');

  return (
    <div className="max-w-lg mx-auto bg-white rounded-xl shadow-md p-8 mt-12 text-center">
      <button
        className="mb-4 text-blue-600 hover:underline text-sm float-left"
        onClick={() => window.history.back()}
      >
        ← Back to Dashboard
      </button>
      <h2 className="text-2xl font-bold mb-2">Group: {group?.name}</h2>
      <p className="text-gray-600 mb-6">{group?.description}</p>
      <div className="mb-4">
        <span className="inline-block bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium">
          Target: GHS {group?.targetAmount}
        </span>
        <span className="inline-block bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium ml-2">
          Monthly: GHS {group?.monthlyContribution}
        </span>
      </div>
      {/* Invite link for admins */}
      {isAdmin && inviteLink && (
        <div className="mb-6">
          <button
            className="bg-green-100 text-green-700 px-3 py-1 rounded mr-2 text-xs font-semibold"
            onClick={() => {navigator.clipboard.writeText(inviteLink); alert('Invite link copied!')}}
          >
            Copy Invite Link
          </button>
          <span className="text-xs text-gray-500">Share this link to invite new members.</span>
        </div>
      )}
      {/* Pending join requests for admins - highlight if any */}
      {isAdmin && (
        <div className="mb-6">
          {pendingLoading ? (
            <div className="mb-2 text-yellow-700 text-sm">Checking for pending join requests...</div>
          ) : pendingCount > 0 ? (
            <div className="mb-2 bg-yellow-100 border border-yellow-300 text-yellow-800 rounded p-2 font-semibold animate-pulse">
              You have {pendingCount} pending join request{pendingCount > 1 ? 's' : ''} to review!
            </div>
          ) : null}
          <PendingRequestsPanel groupId={group._id} isAdmin={isAdmin} />
        </div>
      )}
      <div className="mb-6">
        <h3 className="font-semibold text-lg mb-2">Members</h3>
        <ul className="text-gray-700 text-sm">
          {group?.members.map(m => (
            <li key={m._id || m.id} className="flex items-center justify-between mb-2">
              <span>{m.name || m.email} <span className="text-xs text-blue-600 ml-2">({getRole(m)})</span></span>
              {isAdmin && getRole(m) !== 'Admin' && (
                <button
                  className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200"
                  onClick={() => handleRemove(m._id || m.id)}
                >
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
      <div className="mb-6">
        <h3 className="font-semibold text-lg mb-2">Admins</h3>
        <ul className="text-gray-700 text-sm">
          {group?.admins.map(a => (
            <li key={a._id || a.id}>{a.name || a.email}</li>
          ))}
        </ul>
      </div>
      {/* Tabbed interface for Messages and Loans */}
      <div className="mb-6">
        <div className="flex justify-center gap-4 mb-2">
          <button
            className={`px-4 py-1 rounded-t ${tab === 'messages' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700'}`}
            onClick={() => setTab('messages')}
          >
            Messages
          </button>
          <button
            className={`px-4 py-1 rounded-t ${tab === 'loans' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700'}`}
            onClick={() => setTab('loans')}
          >
            Loans
          </button>
        </div>
        <div className="bg-white rounded-b shadow-inner">
          {tab === 'messages' && (
            <GroupMessagesBoard groupId={group._id} currentUser={currentUser} />
          )}
          {tab === 'loans' && (
            <GroupLoansBoard groupId={group._id} currentUser={currentUser} isAdmin={isAdmin} />
          )}
        </div>
      </div>
    </div>
  );
}
