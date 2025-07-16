import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Header from './Header';
import { api } from './api';

export default function Register() {
  const location = useLocation();
  // Get inviteToken from query string
  const searchParams = new URLSearchParams(location.search);
  const inviteToken = searchParams.get('inviteToken');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState('individual');
  const [ghanaCard, setGhanaCard] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (!email) {
      setError('Please enter your email.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }
    if (!confirmPassword) {
      setError('Please confirm your password.');
      return;
    }
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    // Ghana Card validation for Susu Collector
    if (userType === 'susu_collector' && !ghanaCard) {
      setError('Ghana Card number is required for Susu Collectors.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.register({ email, password, name: email, userType, ghanaCard }); // userType and ghanaCard added
      // Immediately log in after registration
      const loginRes = await api.login({ email, password });
      localStorage.setItem('token', loginRes.token);
      localStorage.setItem('user', JSON.stringify(loginRes.user));
      // If inviteToken is present, join group via invite
      if (inviteToken) {
        try {
          if (api.joinGroupByInviteToken) {
            await api.joinGroupByInviteToken(inviteToken);
          } else {
            await fetch(`/api/groups/invite/${inviteToken}/join`, {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${loginRes.token}` }
            });
          }
        } catch (err) {
          // Optionally show error, but continue
        }
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to sign up. Please try again.');
    } finally {
      setLoading(false);
    }
  };





  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-teal-50 to-white overflow-hidden font-sans">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-r from-teal-400/20 to-green-400/20 rounded-full blur-3xl animate-pulse"></div>
      </div>


      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-112px)] px-6">
        {/* Decorative Icon */}
        <div className="mb-6 animate-bounce">
          <span className="inline-block text-5xl md:text-7xl bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">📝</span>
        </div>
        <div className="w-full max-w-md bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-8 transform transition-all duration-500">
          <h2 className="text-3xl font-extrabold text-center bg-gradient-to-r from-blue-700 to-purple-600 bg-clip-text text-transparent mb-6">
            Sign Up for KraLoan
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Create your account to start saving with your community.
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          {/* Email/Password Form */}
          <form onSubmit={handleEmailSignUp} className="space-y-6">
            {/* User Type Selector */}
            <div>
              <label htmlFor="userType" className="block text-sm font-medium text-gray-700 mb-1">
                Register as
              </label>
              <select
                id="userType"
                name="userType"
                value={userType}
                onChange={e => setUserType(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-300"
              >
                <option value="individual">Individual</option>
                <option value="group_member">Group Member</option>
                <option value="susu_collector">Susu Collector</option>
              </select>
            </div>
            {/* Email field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-300"
                placeholder="Enter your email"
              />
            </div>
            {/* Ghana Card field (conditional) */}
            {(userType === 'susu_collector' || userType === 'group_member' || userType === 'individual') && (
              <div>
                <label htmlFor="ghanaCard" className="block text-sm font-medium text-gray-700 mb-1">
                  Ghana Card Number {userType === 'susu_collector' ? <span className="text-red-500">*</span> : <span className="text-gray-400">(optional)</span>}
                </label>
                <input
                  id="ghanaCard"
                  name="ghanaCard"
                  type="text"
                  value={ghanaCard}
                  onChange={e => setGhanaCard(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-300"
                  placeholder="Ghana Card Number"
                  required={userType === 'susu_collector'}
                />
              </div>
            )}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 pr-12"
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600 focus:outline-none"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-5-10-5s2.273-3.272 6.067-4.771M15 12a3 3 0 11-6 0 3 3 0 016 0zm6.732-1.732A9.956 9.956 0 0022 12s-2.273 3.272-6.067 4.771" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm-7.732-1.732A9.956 9.956 0 002 12s2.273 3.272 6.067 4.771M9.879 9.879l4.242 4.242" /></svg>
                  )}
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 pr-12"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600 focus:outline-none"
                  onClick={() => setShowConfirmPassword(v => !v)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-5-10-5s2.273-3.272 6.067-4.771M15 12a3 3 0 11-6 0 3 3 0 016 0zm6.732-1.732A9.956 9.956 0 0022 12s-2.273 3.272-6.067 4.771" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm-7.732-1.732A9.956 9.956 0 002 12s2.273 3.272 6.067 4.771M9.879 9.879l4.242 4.242" /></svg>
                  )}
                </button>
              </div>
            </div>
            <button
              type="submit"
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
              disabled={loading || !email || !password || !confirmPassword}
            >
              {loading ? 'Signing up...' : 'Sign Up'}
            </button>
          </form>

          {/* Login Link */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium">
              Log in
            </Link>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-8 text-center text-gray-600 text-sm bg-white/80 backdrop-blur-sm">
        <p className="font-medium">© 2025 KraLoan. Empowering communities through transparent savings.</p>
      </footer>
    </div>
  );
}