import React, { useState } from 'react';
import { api } from '../api';

const PROVIDERS = [
  { value: 'MTN', label: 'MTN Mobile Money' },
  { value: 'Vodafone', label: 'Vodafone Cash' },
  { value: 'AirtelTigo', label: 'AirtelTigo Money' },
];

export default function PayoutModal({ open, onClose, group, user, onSuccess }) {
  const [memberId, setMemberId] = useState('');
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');
  const [provider, setProvider] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  React.useEffect(() => {
    if (!open) {
      setMemberId('');
      setAmount('');
      setPhone('');
      setProvider('');
      setReason('');
      setError('');
      setSuccess('');
      setLoading(false);
    }
  }, [open]);

  // Pre-fill phone when member is selected
  React.useEffect(() => {
    if (memberId && group && Array.isArray(group.members)) {
      const m = group.members.find(m => m._id === memberId || m.id === memberId);
      setPhone(m?.phone || '');
    }
  }, [memberId, group]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    if (!memberId || !amount || !phone || !provider) {
      setError('All fields are required.');
      setLoading(false);
      return;
    }
    if (isNaN(Number(amount)) || Number(amount) <= 0) {
      setError('Amount must be a positive number.');
      setLoading(false);
      return;
    }
    try {
      const res = await apiRequest(`/groups/${group._id || group.id}/payouts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          recipientId: memberId,
          amount: Number(amount),
          phoneNumber: phone,
          mobileMoneyProvider: provider,
          reason,
        }),
      });
      setSuccess('Payout initiated successfully!');
      setLoading(false);
      setMemberId('');
      setAmount('');
      setPhone('');
      setProvider('');
      setReason('');
      onSuccess && onSuccess(res.group);
      setTimeout(() => {
        setSuccess('');
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to initiate payout.');
      setLoading(false);
    }
  };

  // Use fetch directly for this modal to avoid api.js changes
  async function apiRequest(path, options) {
    const API_BASE = 'http://localhost:5000/api';
    const res = await fetch(`${API_BASE}${path}`, options);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(err.message || 'API error');
    }
    return res.json();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
          onClick={onClose}
          aria-label="Close payout modal"
        >
          ×
        </button>
        <h3 className="text-xl font-bold mb-4">Payout to Member</h3>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Member</label>
            <select
              value={memberId}
              onChange={e => setMemberId(e.target.value)}
              className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition"
              required
              disabled={loading}
            >
              <option value="">Select a member</option>
              {Array.isArray(group.members) && group.members.map(m => (
                <option key={m._id || m.id} value={m._id || m.id}>
                  {m.name || m.email} {m.phone ? `(${m.phone})` : ''}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (GHS)</label>
            <input
              type="number"
              min="1"
              step="0.01"
              placeholder="e.g. 100"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Money Number</label>
            <input
              type="tel"
              placeholder="e.g. 024XXXXXXX"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
            <select
              value={provider}
              onChange={e => setProvider(e.target.value)}
              className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition"
              required
              disabled={loading}
            >
              <option value="">Select provider</option>
              {PROVIDERS.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason (optional)</label>
            <input
              type="text"
              placeholder="e.g. Group payout, loan, etc."
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition"
              disabled={loading}
            />
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-3">
            <div>
              <div className="text-sm text-gray-700">You are about to pay</div>
              <div className="font-bold text-lg text-blue-700">GHS {amount || 0}</div>
              <div className="text-xs text-gray-500">To: {memberId ? (group.members.find(m => m._id === memberId || m.id === memberId)?.name || 'Member') : '-'}</div>
              <div className="text-xs text-gray-500">Number: {phone || '-'}</div>
              <div className="text-xs text-gray-500">Provider: {provider || '-'}</div>
            </div>
          </div>
          {error && (
            <div className="text-red-600 text-sm flex items-center">{error}</div>
          )}
          {success && (
            <div className="text-green-700 text-sm flex items-center">{success}</div>
          )}
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-lg bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300 transition"
              aria-label="Cancel payout"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!memberId || !amount || !phone || !provider || loading}
              className={`px-5 py-2 rounded-lg font-semibold transition ${
                !memberId || !amount || !phone || !provider || loading
                  ? 'bg-green-300 text-white cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700 hover:scale-105 shadow-sm'
              }`}
              aria-label="Submit payout"
            >
              {loading ? 'Processing...' : 'Submit Payout'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 