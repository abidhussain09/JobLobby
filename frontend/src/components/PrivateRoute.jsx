// src/components/PrivateRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// PrivateRoute now accepts an optional 'role' prop
const PrivateRoute = ({ children, role }) => {
  const { user } = useSelector((state) => state.auth);

  // If no user, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If a role is specified, check if the user's role matches
  if (role && user.role !== role) {
    // Optionally, redirect to a 403 Forbidden page or dashboard with an error
    alert(`Access Denied: You must be a ${role} to view this page.`); // Temporary alert
    return <Navigate to="/dashboard" replace />; // Redirect to dashboard
  }

  return children;
};

export default PrivateRoute;
