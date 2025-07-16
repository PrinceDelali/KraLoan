import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from './api';

export default function CreateGroup() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [contribution, setContribution] = useState('');
  const [frequency, setFrequency] = useState('monthly');
  const [numMembers, setNumMembers] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!name || !contribution || !numMembers) {
      setError('Please fill in all required fields.');
      return;
    }
    if (Number(contribution) <= 0 || Number(numMembers) <= 0) {
      setError('Contribution and number of members must be positive numbers.');
      return;
    }
    setLoading(true);
    try {
      const groupData = {
        name,
        description,
        monthlyContribution: Number(contribution),
        targetAmount: Number(contribution) * Number(numMembers),
        frequency,
        maxMembers: Number(numMembers)
      };
      await api.createGroup(groupData);
      setSuccess('Group created successfully! Redirecting...');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      setError(err.message || 'Failed to create group.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-center text-blue-900">Create a Susu Group</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Group Name*"
            className="mb-3 w-full px-4 py-2 border rounded"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
          <textarea
            placeholder="Group Description (optional)"
            className="mb-3 w-full px-4 py-2 border rounded"
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={2}
          />
          <input
            type="number"
            placeholder="Contribution Amount (GHS)*"
            className="mb-3 w-full px-4 py-2 border rounded"
            value={contribution}
            onChange={e => setContribution(e.target.value)}
            min={1}
            required
          />
          <select
            className="mb-3 w-full px-4 py-2 border rounded"
            value={frequency}
            onChange={e => setFrequency(e.target.value)}
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
          <input
            type="number"
            placeholder="Number of Members*"
            className="mb-3 w-full px-4 py-2 border rounded"
            value={numMembers}
            onChange={e => setNumMembers(e.target.value)}
            min={1}
            required
          />
          {error && <div className="mb-3 text-red-600 text-sm">{error}</div>}
          {success && <div className="mb-3 text-green-600 text-sm">{success}</div>}
          <button
            type="submit"
            className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Group'}
          </button>
        </form>
      </div>
    </div>
  );
}
