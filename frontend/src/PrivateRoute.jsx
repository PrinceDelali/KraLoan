import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import LoadingSpinner from './components/LoadingSpinner';

export default function PrivateRoute({ children }) {
  const { user, token, loading } = useAuth();

  if (loading) return <LoadingSpinner message="Authenticating..." />;
  return (user && token) ? children : <Navigate to="/login" replace />;
}
