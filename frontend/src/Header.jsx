import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function Header({ forcePublic = false }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="relative z-10 p-4 md:p-6 bg-white/80 backdrop-blur-sm shadow-sm">
      <nav className="flex justify-between items-center max-w-6xl mx-auto">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">K</span>
          </div>
          <span className="text-xl font-bold text-blue-800">KraLoan</span>
        </div>
        <div className="hidden md:flex space-x-6 items-center">
          <Link to="/features" className="text-gray-600 hover:text-blue-600 transition-colors">Features</Link>
          <Link to="/about" className="text-gray-600 hover:text-blue-600 transition-colors">About</Link>
          <Link to="/contact" className="text-gray-600 hover:text-blue-600 transition-colors">Contact</Link>
          {forcePublic ? (
            <>
              <Link to="/login" className="ml-6 text-blue-600 hover:underline">Login</Link>
              <Link to="/register" className="ml-2 text-purple-600 hover:underline">Register</Link>
            </>
          ) : user ? (
            <button
              onClick={handleLogout}
              className="ml-6 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Log Out
            </button>
          ) : (
            <>
              <Link to="/login" className="ml-6 text-blue-600 hover:underline">Login</Link>
              <Link to="/register" className="ml-2 text-purple-600 hover:underline">Register</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
