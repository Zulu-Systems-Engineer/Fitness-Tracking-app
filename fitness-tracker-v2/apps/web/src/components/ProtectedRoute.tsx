import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from './ui/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  // Development mode bypass - allows access without authentication
  const DEV_MODE_BYPASS = import.meta.env.DEV;

  if (loading && !DEV_MODE_BYPASS) {
    return (
      <div className="min-h-screen bg-bg-secondary flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user && !DEV_MODE_BYPASS) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
