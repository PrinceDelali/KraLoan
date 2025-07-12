import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Header from './Header';
import { api } from './api';

export default function LoginPage() {
  const location = useLocation();
  // Helper to get inviteToken from query string
  function getInviteToken() {
    const params = new URLSearchParams(location.search);
    return params.get('inviteToken');
  }
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleEmailLogin = async (e) => {
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
    setError('');
    setLoading(true);
    try {
      const res = await api.login({ email, password });
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
      // Check for inviteToken in URL
      const inviteToken = getInviteToken();
      const params = new URLSearchParams(location.search);
      const redirectGroupId = params.get('redirectGroupId');
      if (inviteToken) {
        try {
          if (api.joinGroupByInviteToken) {
            await api.joinGroupByInviteToken(inviteToken);
          } else {
            await fetch(`/api/groups/invite/${inviteToken}/join`, {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${res.token}` }
            });
          }
        } catch (err) {
          // Optionally set error, but continue
          setError('Logged in, but failed to join group: ' + (err.message || 'Unknown error'));
        }
        // Redirect to group details if present
        if (redirectGroupId) {
          navigate(`/group/${redirectGroupId}`, { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.log('Login error:', err);
      setError(err.message || 'Failed to log in. Please check your credentials.');
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
        <div className="mb-6 animate-pulse">
          <span className="inline-block text-5xl md:text-7xl bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">🔐</span>
        </div>
        <div className="w-full max-w-md bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-8 transform transition-all duration-500">
          <h2 className="text-3xl font-extrabold text-center bg-gradient-to-r from-blue-700 to-purple-600 bg-clip-text text-transparent mb-6">
            Log In to KraLoan
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Access your susu savings account securely.
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          {/* Email/Password Form */}
          <form onSubmit={handleEmailLogin} className="space-y-6">
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
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
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
              <div className="text-right">
                <Link to="/forgot-password" className="text-blue-600 hover:underline text-sm">Forgot Password?</Link>
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 mb-4"
              disabled={loading || !email || !password}
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>

          {/* Register Link */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 hover:text-blue-800 font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-8 text-center text-gray-600 text-sm bg-white/80 backdrop-blur-sm">
        <p className="font-medium"> 2025 KraLoan. Empowering communities through transparent savings.</p>
      </footer>
    </div>
  );
}