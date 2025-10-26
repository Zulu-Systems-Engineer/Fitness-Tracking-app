import { lazy, Suspense } from 'react';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { LoadingSpinner } from './components/ui/LoadingSpinner';

// Lazy load pages for code splitting
const LoginPage = lazy(() => import('./pages/LoginPage').then(module => ({ default: module.LoginPage })));
const SignupPage = lazy(() => import('./pages/SignupPage').then(module => ({ default: module.SignupPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(module => ({ default: module.DashboardPage })));
const PlansPage = lazy(() => import('./pages/PlansPage').then(module => ({ default: module.PlansPage })));
const TrackPage = lazy(() => import('./pages/TrackPage').then(module => ({ default: module.TrackPage })));
const GoalsPage = lazy(() => import('./pages/GoalsPage').then(module => ({ default: module.GoalsPage })));
const RecordsPage = lazy(() => import('./pages/RecordsPage').then(module => ({ default: module.RecordsPage })));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage').then(module => ({ default: module.AnalyticsPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(module => ({ default: module.ProfilePage })));

// Loading component for Suspense fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <LoadingSpinner size="lg" />
  </div>
);

// Wrapper component for lazy-loaded pages with error boundary
const LazyPageWrapper = ({ children }: { children: React.ReactNode }) => (
  <ErrorBoundary>
    <Suspense fallback={<PageLoader />}>
      {children}
    </Suspense>
  </ErrorBoundary>
);

export {
  LoginPage,
  SignupPage,
  DashboardPage,
  PlansPage,
  TrackPage,
  GoalsPage,
  RecordsPage,
  AnalyticsPage,
  ProfilePage,
  LazyPageWrapper,
};
