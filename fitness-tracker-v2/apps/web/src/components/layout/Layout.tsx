import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ThemeToggle } from '../ui/ThemeToggle';
import { useAuth } from '../../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { user } = useAuth();

  // Don't show navigation on login/signup pages
  const isAuthPage = ['/login', '/signup', '/'].includes(location.pathname);

  const navigationItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { path: '/plans', label: 'Plans', icon: '📋' },
    { path: '/track', label: 'Track', icon: '🏋️' },
    { path: '/goals', label: 'Goals', icon: '🎯' },
    { path: '/analytics', label: 'Analytics', icon: '📊' },
    { path: '/records', label: 'Records', icon: '🏆' },
    { path: '/profile', label: 'Profile', icon: '👤' },
  ];

  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-bg-primary text-text-primary">
        <main className="max-w-7xl mx-auto p-4">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <header className="bg-bg-secondary border-b border-border-default p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-text-primary">Fitness Tracker</h1>
          <ThemeToggle />
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-bg-secondary border-b border-border-default">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-1 overflow-x-auto">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors whitespace-nowrap ${
                  location.pathname === item.path
                    ? 'bg-accent-primary text-white'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-4">
        {children}
      </main>
    </div>
  );
};
