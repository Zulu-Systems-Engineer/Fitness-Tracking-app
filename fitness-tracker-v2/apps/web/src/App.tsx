import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './components/ui/ThemeProvider';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { ToastProvider } from './components/ui/Toast';
import { AuthProvider } from './contexts/AuthContext';
import { SecurityProvider } from './components/security/SecurityProvider';
import { QueryProvider } from './providers/QueryProvider';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/layout/Layout';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { DashboardPage } from './pages/DashboardPage';
import { PlansPage } from './pages/PlansPage';
import { TrackPage } from './pages/TrackPage';
import { GoalsPage } from './pages/GoalsPage';
import { RecordsPage } from './pages/RecordsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ProfilePage } from './pages/ProfilePage';
import { setThemeVariables } from './lib/theme';
import { getAllSecurityHeaders } from './lib/csp';

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
                    <Routes>
                      <Route path="/" element={<LoginPage />} />
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/signup" element={<SignupPage />} />
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
                      {/* Add more routes as needed */}
                    </Routes>
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
