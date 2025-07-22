import React, { useState, useEffect } from 'react';
import { api } from '../api';

const PAYSTACK_PUBLIC_KEY = 'pk_live_1e438d1597ef92d47f06638eb6b04b4a60f0801d';

export default function ContributionModal({ open, onClose, group, user, onSuccess, defaultAmount = '' }) {
  const [amount, setAmount] = useState(defaultAmount);
  const [method, setMethod] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(user || {});
  const [successInfo, setSuccessInfo] = useState(null);

  // Fetch current user profile if phone number is missing
  useEffect(() => {
    if (open && (!currentUser.phone || !currentUser.email)) {
      const fetchUserProfile = async () => {
        try {
          const userProfile = await api.getCurrentUser();
          setCurrentUser(userProfile);
          // Update localStorage with complete user data
          localStorage.setItem('user', JSON.stringify(userProfile));
        } catch (err) {
          console.error('Failed to fetch user profile:', err);
        }
      };
      fetchUserProfile();
    }
  }, [open, currentUser.phone, currentUser.email]);

  if (!open) return null;

  if (successInfo) {
    return (
      <div className="p-6 text-center">
        <div className="text-green-600 text-2xl font-bold mb-2">Contribution Successful!</div>
        <div className="mb-2">You contributed <span className="font-bold">GHS {successInfo.contributed}</span></div>
        <div className="mb-2">New group total: <span className="font-bold">GHS {successInfo.total}</span></div>
        <div className="text-gray-500 text-sm">This will be visible to all group members.</div>
      </div>
    );
  }

  const handlePaystackCallback = async (response) => {
    try {
      const res = await fetch(`/api/group/${group._id || group.id}/contribute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          amount: Number(amount),
          paystackReference: response.reference,
          method,
        }),
      });
      if (!res.ok) throw new Error('Failed to record contribution');
      const data = await res.json();
      setAmount('');
      setMethod('');
      setError('');
      setLoading(false);
      setSuccessInfo({
        contributed: data.group.contributions[data.group.contributions.length - 1].amount,
        total: data.group.totalSavings
      });
      onSuccess && onSuccess(data.group || data);
      // Optionally close modal after a delay
      setTimeout(() => {
        setSuccessInfo(null);
        onClose();
      }, 2500);
    } catch (err) {
      setError(err.message || 'Payment succeeded but failed to record contribution.');
      setLoading(false);
    }
  };

  const handlePaystackPayment = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const amt = Number(amount);
    if (isNaN(amt) || amt <= 0) {
      setError('Contribution amount must be a valid positive number.');
      setLoading(false);
      return;
    }
    if (!method) {
      setError('Please select a payment method.');
      setLoading(false);
      return;
    }
    // Use current user data
    let email = currentUser.email;
    let phone = currentUser.phone;
    console.log('DEBUG email:', email, 'phone:', phone);
    if (!email) {
      setError('Your email is required for payment. Please update your profile.');
      setLoading(false);
      return;
    }
    if (!phone) {
      setError('Your phone number is required for payment. Please update your profile with a valid phone number.');
      setLoading(false);
      return;
    }
    if (!window.PaystackPop) {
      setError('Paystack is not loaded. Please refresh the page.');
      setLoading(false);
      return;
    }
    try {
      const paystack = window.PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email,
        amount: amt * 100,
        currency: 'GHS',
        ref: 'KRA-' + Math.floor(Math.random() * 1000000000),
        metadata: {
          custom_fields: [
            {
              display_name: 'Phone Number',
              variable_name: 'phone',
              value: phone,
            },
            {
              display_name: 'Payment Method',
              variable_name: 'method',
              value: method,
            }
          ]
        },
        callback: function(response) {
          handlePaystackCallback(response);
        },
        onClose: function() {
          setError('Payment window closed. No charge was made.');
          setLoading(false);
        }
      });
      paystack.openIframe();
    } catch (err) {
      setError('An unexpected error occurred. See console for details.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
          onClick={onClose}
          aria-label="Close contribution modal"
        >
          ×
        </button>
        <h3 className="text-xl font-bold mb-4">Make Contribution</h3>
        
        {/* Phone number warning */}
        {!currentUser.phone && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <div className="text-yellow-800 text-sm">
              <div className="font-medium mb-1">⚠️ Phone Number Required</div>
              <div>You need to add a phone number to your profile to make payments.</div>
              <a href="/dashboard/profile" className="text-blue-600 underline hover:text-blue-800 font-medium mt-1 inline-block">
                Update Profile
              </a>
            </div>
          </div>
        )}
        
        <form className="space-y-5" onSubmit={handlePaystackPayment}>
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
              aria-required="true"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">Enter the amount you wish to contribute.</p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <img src="https://assets.paystack.com/assets/img/logos/paystack-logo-primary.svg" alt="Paystack Logo" className="h-5" />
              <span className="text-xs text-green-700 font-semibold bg-green-50 rounded px-2 py-1">Paystack Secured</span>
            </div>
            <p className="text-xs text-gray-700 mb-2">
              You can pay securely with <span className="font-medium">Mobile Money</span>, <span className="font-medium">Card</span>, or <span className="font-medium">Bank</span> via Paystack.<br/>
              <span className="text-green-600">All payments are processed securely and instantly.</span>
            </p>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
            <select
              value={method}
              onChange={e => setMethod(e.target.value)}
              className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition"
              required
              aria-required="true"
              aria-label="Select payment method"
              disabled={loading}
            >
              <option value="">Select a method</option>
              <option value="Mobile Money">Mobile Money</option>
              <option value="Card">Card</option>
              <option value="Bank">Bank</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Choose your preferred payment method for this contribution.<br/>
              <span className="text-blue-600">Need help? <a href="https://paystack.com/help" target="_blank" rel="noopener noreferrer" className="underline">Learn more about Paystack payments</a></span>
            </p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-3">
            <div>
              <div className="text-sm text-gray-700">You are about to contribute</div>
              <div className="font-bold text-lg text-blue-700">GHS {amount || 0}</div>
              <div className="text-xs text-gray-500">Method: {method || '-'}</div>
            </div>
          </div>
          {error && (
            <div className="text-red-600 text-sm">
              <div className="flex items-center mb-2">
                {error}
              </div>
              {error.includes('phone number') && (
                <div className="text-xs text-blue-600 space-y-1">
                  <div>To make a contribution, you need to add a phone number to your profile.</div>
                  <a href="/dashboard/profile" className="underline hover:text-blue-800 font-medium">
                    Click here to update your profile
                  </a>
                </div>
              )}
            </div>
          )}
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-lg bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300 transition"
              aria-label="Cancel contribution"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!amount || !method || Number(amount) <= 0 || loading || !currentUser.phone}
              className={`px-5 py-2 rounded-lg font-semibold transition ${
                !amount || !method || Number(amount) <= 0 || loading || !currentUser.phone
                  ? 'bg-green-300 text-white cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700 hover:scale-105 shadow-sm'
              }`}
              aria-label="Submit contribution"
            >
              {loading ? 'Processing...' : !currentUser.phone ? 'Phone Number Required' : 'Submit Contribution'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 