import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { api } from './api';
import LoadingSpinner from './components/LoadingSpinner';

export default function InviteLanding() {
  const { token } = useParams();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Try to fetch group info by invite token
    (async () => {
      try {
        const groups = await api.listGroups();
        const found = groups.find(g => g.inviteToken === token);
        if (found) setGroup(found);
        else setError('Invalid or expired invite link.');
      } catch (err) {
        setError('Failed to fetch group info.');
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  if (loading) return <LoadingSpinner message="Loading invite..." />;
  if (error) return <div className="p-12 text-center text-red-500">{error}</div>;

  return (
    <div className="max-w-lg mx-auto bg-white rounded-xl shadow-md p-8 mt-12 text-center">
      <h2 className="text-2xl font-bold mb-2">Join Group: {group?.name}</h2>
      <p className="text-gray-600 mb-6">{group?.description}</p>
      <div className="mb-4">
        <span className="inline-block bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium">
          Target: GHS {group?.targetAmount}
        </span>
        <span className="inline-block bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium ml-2">
          Monthly: GHS {group?.monthlyContribution}
        </span>
      </div>
      <div className="mb-6 text-gray-500 text-sm">To join this group, please sign up or log in.</div>
      <div className="flex gap-4 justify-center">
        <Link
          className="bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700"
          to={`/signup?inviteToken=${token}&redirectGroupId=${group?._id}`}
        >
          Sign Up
        </Link>
        <Link
          className="bg-gray-200 text-gray-700 px-6 py-2 rounded font-semibold hover:bg-gray-300"
          to={`/login?inviteToken=${token}&redirectGroupId=${group?._id}`}
        >
          Log In
        </Link>
      </div>
    </div>
  );
}
