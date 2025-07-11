import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function PrivateRoute({ children }) {
  const { user, token, loading } = useAuth();

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  return (user && token) ? children : <Navigate to="/login" replace />;
}
