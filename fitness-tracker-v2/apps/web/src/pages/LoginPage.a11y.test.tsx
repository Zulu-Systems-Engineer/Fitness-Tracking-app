import { describe, it, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { BrowserRouter } from 'react-router-dom';
import { LoginPage } from './LoginPage';
import { AuthProvider } from '../contexts/AuthContext';

// Extend expect with jest-axe matchers
expect.extend(toHaveNoViolations);

// Mock the AuthContext
vi.mock('../contexts/AuthContext', async () => {
  const actual = await vi.importActual('../contexts/AuthContext');
  return {
    ...actual,
    useAuth: () => ({
      user: null,
      login: vi.fn(),
      signup: vi.fn(),
      logout: vi.fn(),
      signInWithGoogle: vi.fn(),
      loading: false,
    }),
  };
});

describe('LoginPage Accessibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    );

    // Run axe accessibility audit
    const results = await axe(container, {
      // Configure axe rules
      rules: {
        'color-contrast': { enabled: true },
        'keyboard-navigation': { enabled: true },
        'aria-labels': { enabled: true },
        'heading-order': { enabled: true },
      },
    });

    // Assert no violations
    expect(results).toHaveNoViolations();
  });

  it('should have accessible form inputs', async () => {
    const { getByLabelText } = render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    );

    // Verify form inputs have proper labels
    const emailInput = getByLabelText(/email/i);
    const passwordInput = getByLabelText(/password/i);

    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('should have accessible buttons', async () => {
    const { getByRole } = render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    );

    // Verify buttons are accessible
    const loginButton = getByRole('button', { name: /sign in|log in/i });
    expect(loginButton).toBeInTheDocument();
    expect(loginButton).not.toHaveAttribute('aria-hidden');
  });

  it('should have accessible headings', async () => {
    const { getByRole } = render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    );

    // Verify heading structure
    const heading = getByRole('heading', { name: /login|sign in/i });
    expect(heading).toBeInTheDocument();
  });

  it('should have accessible links for navigation', async () => {
    const { getByRole } = render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    );

    // Verify signup link is accessible
    const signupLink = getByRole('link', { name: /sign up/i });
    expect(signupLink).toBeInTheDocument();
    expect(signupLink).toHaveAttribute('href', '/signup');
  });

  it('should have proper ARIA labels for interactive elements', async () => {
    const { container } = render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    );

    // Run axe audit to check for ARIA issues
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});


