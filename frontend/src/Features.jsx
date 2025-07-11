import React from 'react';

export default function Features() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold text-blue-800 mb-4">Features</h2>
        <ul className="space-y-6 mt-8">
          <li className="bg-white p-6 rounded-lg shadow flex items-center gap-4">
            <span className="text-3xl">👥</span>
            <div>
              <h3 className="font-semibold text-lg">Community Savings</h3>
              <p className="text-gray-600">Foster trust with transparent group savings and easy management.</p>
            </div>
          </li>
          <li className="bg-white p-6 rounded-lg shadow flex items-center gap-4">
            <span className="text-3xl">💰</span>
            <div>
              <h3 className="font-semibold text-lg">Smart Payouts</h3>
              <p className="text-gray-600">Automated, fair fund distribution to all group members.</p>
            </div>
          </li>
          <li className="bg-white p-6 rounded-lg shadow flex items-center gap-4">
            <span className="text-3xl">📊</span>
            <div>
              <h3 className="font-semibold text-lg">Real-time Tracking</h3>
              <p className="text-gray-600">Instantly monitor contributions, payouts, and group progress.</p>
            </div>
          </li>
          <li className="bg-white p-6 rounded-lg shadow flex items-center gap-4">
            <span className="text-3xl">🔔</span>
            <div>
              <h3 className="font-semibold text-lg">Notifications</h3>
              <p className="text-gray-600">Get reminders for due payments, confirmations, and payout turns.</p>
            </div>
          </li>
          <li className="bg-white p-6 rounded-lg shadow flex items-center gap-4">
            <span className="text-3xl">🔒</span>
            <div>
              <h3 className="font-semibold text-lg">Secure & Trusted</h3>
              <p className="text-gray-600">Bank-level security for your data and transactions.</p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
}
