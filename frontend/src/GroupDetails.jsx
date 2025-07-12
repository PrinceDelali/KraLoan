import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from './api';

export default function GroupDetails() {
  const { groupId } = useParams();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  if (loading) return <div className="p-12 text-center">Loading group details...</div>;
  if (error) return <div className="p-12 text-center text-red-500">{error}</div>;

  return (
    <div className="max-w-lg mx-auto bg-white rounded-xl shadow-md p-8 mt-12 text-center">
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
      <div className="mb-6">
        <h3 className="font-semibold text-lg mb-2">Members</h3>
        <ul className="text-gray-700 text-sm">
          {group?.members.map(m => (
            <li key={m._id || m.id}>{m.name || m.email}</li>
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
    </div>
  );
}
