import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; 

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  // Wait for initial localStorage check to finish
  if (loading) {
    return <div>טוען נתונים...</div>;
  }

  // If no user is logged in, redirect to login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If authorized, render the wrapped component
  return children;
}