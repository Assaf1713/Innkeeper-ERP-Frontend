import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; 
import { useAlert } from '../hooks/useAlert';



export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const { showAlert } = useAlert();
  const location = useLocation();

  const isForbidden =
    !!user &&
    Array.isArray(allowedRoles) &&
    allowedRoles.length > 0 &&
    !allowedRoles.includes(user.role);

  useEffect(() => {
    if (!isForbidden) return;
    showAlert('אין לך הרשאה לגשת לדף זה');
  }, [isForbidden, showAlert, location.pathname]);

  // Wait for initial localStorage check to finish
  if (loading) {
    return <div>טוען נתונים...</div>;
  }

  // If no user is logged in, redirect to login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (isForbidden) {
    return <Navigate to="/" replace />;
  }

  // If authorized, render the wrapped component
  return children;
}