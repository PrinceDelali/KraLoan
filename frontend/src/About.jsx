import React from 'react';

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-blue-800 mb-4">About KraLoan</h2>
        <p className="text-gray-700 mb-6">
          KraLoan is built to empower communities by making susu savings simple, transparent, and secure. We believe in the power of collective savings and want to make it accessible to everyone—no matter your tech skills.
        </p>
        <ul className="list-disc pl-6 text-gray-600 mb-6">
          <li>Easy group creation and joining</li>
          <li>Automated contribution tracking</li>
          <li>Fair, transparent payouts</li>
          <li>Mobile-first, user-friendly design</li>
        </ul>
        <p className="text-gray-700">Join us in building trust and financial empowerment in your community!</p>
      </div>
    </div>
  );
}
