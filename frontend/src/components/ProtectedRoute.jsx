import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Access privilege matrix for roles
const ROLE_ACCESS = {
  ADMIN: ["/dashboard", "/vehicles", "/drivers", "/trips", "/maintenance", "/fuel", "/reports", "/settings"],
  FLEET_MANAGER: ["/dashboard", "/vehicles", "/drivers", "/maintenance", "/reports", "/settings"],
  DISPATCHER: ["/dashboard", "/vehicles", "/trips", "/settings"],
  SAFETY_OFFICER: ["/dashboard", "/drivers", "/trips", "/settings"],
  FINANCIAL_ANALYST: ["/dashboard", "/vehicles", "/fuel", "/reports", "/settings"],
};

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Get active user role
  const role = user?.role || "DISPATCHER";

  // Explicit ADMIN bypass - ADMIN has full access to all pages
  if (role === "ADMIN") {
    return children;
  }

  const allowedPaths = ROLE_ACCESS[role] || ROLE_ACCESS.DISPATCHER;

  // Verify if current path is allowed for this role
  const isAllowed = allowedPaths.some(path => location.pathname.startsWith(path));

  if (!isAllowed) {
    // If not allowed, redirect to main operational dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};
