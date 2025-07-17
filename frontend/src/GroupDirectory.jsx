import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Users, Search, Plus } from 'lucide-react';

export default function GroupDirectory({ allGroups, currentUser, onJoin, joinStatus, joinLoading, joinError }) {
  const [search, setSearch] = useState('');

  // Filter groups by search query (name or description)
  const filteredGroups = useMemo(() => {
    if (!search) return allGroups;
    return allGroups.filter(
      g =>
        g.name.toLowerCase().includes(search.toLowerCase()) ||
        (g.description && g.description.toLowerCase().includes(search.toLowerCase()))
    );
  }, [allGroups, search]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-4">
        <Users className="h-7 w-7 text-blue-600" />
        <h2 className="text-3xl font-bold text-gray-800 flex-1">Group Directory</h2>
        <Link
          to="/create-group"
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg shadow"
        >
          + Create Group
        </Link>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-2.5 text-gray-400 h-5 w-5" />
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search groups..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredGroups.length > 0 ? (
          filteredGroups.map(group => {
            // Robust membership check: handle string or object
            const isMember = Array.isArray(group.members) && group.members.some(m =>
              typeof m === 'string' ? m === currentUser._id : (m._id === currentUser._id || m.id === currentUser._id)
            );
            const isAdmin = Array.isArray(group.admins) && group.admins.some(a =>
              typeof a === 'string' ? a === currentUser._id : (a._id === currentUser._id || a.id === currentUser._id)
            );
            const isPending = Array.isArray(group.pendingRequests) && group.pendingRequests.some(p =>
              typeof p === 'string' ? p === currentUser._id : (p._id === currentUser._id || p.id === currentUser._id)
            );
            return (
              <div key={group._id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300 flex flex-col justify-between">
                <div>
                  <div className="font-bold text-lg mb-1">{group.name}</div>
                  <div className="text-gray-600 mb-2">{group.description}</div>
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <div className="text-xs text-gray-500">Target</div>
                      <div className="font-medium">GHS {group.targetAmount}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Monthly</div>
                      <div className="font-medium">GHS {group.monthlyContribution}</div>
                    </div>
                  </div>
                  {/* Show user role if member */}
                  {isMember && (
                    <div className="text-xs text-blue-700 font-semibold mb-1">
                      Role: {isAdmin ? 'Admin' : 'Member'}
                    </div>
                  )}
                </div>
                {/* Join status logic & actions */}
                {isMember ? (
                  <div className="flex flex-col gap-2 mt-4">
                    <Link
                      to={`/group-dashboard/${group._id}`}
                      className="w-full py-2 bg-blue-600 text-white rounded font-semibold text-center hover:bg-blue-700"
                    >
                      View Group
                    </Link>
                    {/* Copy Invite Link for Admins */}
                    {isAdmin && group.inviteToken && (
                      <button
                        className="w-full py-2 bg-gray-200 text-gray-800 rounded font-semibold text-center hover:bg-gray-300"
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/register?inviteToken=${group.inviteToken}`);
                          alert('Invite link copied!');
                        }}
                      >
                        Copy Invite Link
                      </button>
                    )}
                  </div>
                ) : isPending ? (
                  <button
                    className="mt-4 w-full py-2 bg-yellow-500 text-white rounded font-semibold opacity-70 cursor-not-allowed"
                    disabled
                  >
                    Pending Approval
                  </button>
                ) : (
                  <button
                    className="mt-4 w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center gap-2 font-semibold disabled:opacity-60"
                    onClick={() => onJoin(group._id)}
                    disabled={joinLoading === group._id}
                  >
                    {joinLoading === group._id ? 'Joining...' : (<><Plus className="h-5 w-5" /> Join Group</>)}
                  </button>
                )}
                {/* Feedback */}
                {joinStatus && joinStatus[group._id] && (
                  <div className={`mt-2 text-sm ${joinStatus[group._id].success ? 'text-green-700' : 'text-red-600'}`}>{joinStatus[group._id].message}</div>
                )}
                {joinError && joinError[group._id] && (
                  <div className="mt-2 text-sm text-red-600">{joinError[group._id]}</div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-gray-400 py-8 col-span-2 text-center">No groups found.</div>
        )}
      </div>
    </div>
  );
}
