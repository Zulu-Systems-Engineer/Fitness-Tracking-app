import React, { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './components/ui/ThemeProvider';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { ToastProvider } from './components/ui/Toast';
import { AuthProvider } from './contexts/AuthContext';
import { SecurityProvider } from './components/security/SecurityProvider';
import { QueryProvider } from './providers/QueryProvider';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/layout/Layout';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { setThemeVariables } from './lib/theme';
import { getAllSecurityHeaders } from './lib/csp';

// Lazy load route components
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const PlansPage = lazy(() => import('./pages/PlansPage'));
const TrackPage = lazy(() => import('./pages/TrackPage'));
const GoalsPage = lazy(() => import('./pages/GoalsPage'));
const RecordsPage = lazy(() => import('./pages/RecordsPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));

function App() {
  // Initialize theme on app start
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' || 'light';
    setThemeVariables(savedTheme);
  }, []);

  return (
    <ErrorBoundary>
      <SecurityProvider>
        <ThemeProvider>
          <QueryProvider>
            <AuthProvider>
              <ToastProvider>
                <Router>
                  <Layout>
                    <Suspense fallback={<LoadingSpinner fullScreen />}>
                      <Routes>
                        {/* Public routes */}
                        <Route path="/" element={<LoginPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/signup" element={<SignupPage />} />
                        
                        {/* Protected routes */}
                        <Route path="/dashboard" element={
                          <ProtectedRoute>
                            <DashboardPage />
                          </ProtectedRoute>
                        } />
                        <Route path="/plans" element={
                          <ProtectedRoute>
                            <PlansPage />
                          </ProtectedRoute>
                        } />
                        <Route path="/track" element={
                          <ProtectedRoute>
                            <TrackPage />
                          </ProtectedRoute>
                        } />
                        <Route path="/goals" element={
                          <ProtectedRoute>
                            <GoalsPage />
                          </ProtectedRoute>
                        } />
                        <Route path="/records" element={
                          <ProtectedRoute>
                            <RecordsPage />
                          </ProtectedRoute>
                        } />
                        <Route path="/analytics" element={
                          <ProtectedRoute>
                            <AnalyticsPage />
                          </ProtectedRoute>
                        } />
                        <Route path="/profile" element={
                          <ProtectedRoute>
                            <ProfilePage />
                          </ProtectedRoute>
                        } />
                        
                        {/* Catch all route - redirect to login */}
                        <Route path="*" element={<Navigate to="/login" replace />} />
                      </Routes>
                    </Suspense>
                  </Layout>
                </Router>
              </ToastProvider>
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </SecurityProvider>
    </ErrorBoundary>
  );
}

export default App;
