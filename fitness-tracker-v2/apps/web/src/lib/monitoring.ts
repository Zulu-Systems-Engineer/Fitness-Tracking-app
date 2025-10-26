/**
 * Production Monitoring and Error Tracking
 * Integrates Sentry for error tracking, performance monitoring, and release tracking
 */

import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

/**
 * Initialize Sentry monitoring
 * Only runs in production environment
 */
export function initMonitoring() {
  // Only initialize in production
  if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      integrations: [
        new BrowserTracing({
          // Set up tracing for React Router
          tracePropagationTargets: ['localhost', /^\//],
        }),
      ],
      // Performance monitoring
      tracesSampleRate: 0.1, // 10% of transactions for performance monitoring
      
      // Environment configuration
      environment: import.meta.env.MODE || 'production',
      release: import.meta.env.VITE_APP_VERSION || '1.0.0',
      
      // Session replay (optional, for debugging)
      replaysOnErrorSampleRate: 1.0,
      replaysSessionSampleRate: 0.1,
      
      // Filter out noise
      ignoreErrors: [
        // Browser extensions
        'top.GLOBALS',
        'originalCreateNotification',
        'canvas.contentDocument',
        'MyApp_RemoveAllHighlights',
        'atomicFindClose',
        // Random plugins/extensions
        'fb_xd_fragment',
        'bmi_SafeAddOnload',
        'EBCallBackMessageReceived',
        // Known extension errors
        'nonError',
      ],
      
      // Context
      beforeSend(event, hint) {
        // Add custom context
        if (event.request) {
          event.request.url = event.request.url?.replace(/\/\/.+@/, '//[REDACTED]@'); // Sanitize passwords
        }
        return event;
      },
    });

    // Set user context when authenticated
    Sentry.setUser({
      id: undefined, // Will be set when user logs in
      username: undefined,
      email: undefined,
    });

    console.log('✅ Sentry monitoring initialized');
  } else {
    console.log('ℹ️  Sentry monitoring disabled (development mode or missing DSN)');
  }
}

/**
 * Set user context for Sentry
 * Call this when user logs in
 */
export function setSentryUser(user: { id: string; email: string; name: string }) {
  if (import.meta.env.PROD) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.name,
    });
  }
}

/**
 * Clear user context for Sentry
 * Call this when user logs out
 */
export function clearSentryUser() {
  if (import.meta.env.PROD) {
    Sentry.setUser(null);
  }
}

/**
 * Capture an error manually
 */
export function captureError(error: Error, context?: Record<string, any>) {
  if (import.meta.env.PROD) {
    Sentry.withScope((scope) => {
      if (context) {
        scope.setContext('custom', context);
      }
      Sentry.captureException(error);
    });
  } else {
    console.error('Error (not sent to Sentry in dev):', error, context);
  }
}

/**
 * Capture a message
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info', context?: Record<string, any>) {
  if (import.meta.env.PROD) {
    Sentry.withScope((scope) => {
      if (context) {
        scope.setContext('custom', context);
      }
      Sentry.captureMessage(message, level);
    });
  } else {
    console.log(`[${level}] ${message}`, context);
  }
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(breadcrumb: Sentry.Breadcrumb) {
  if (import.meta.env.PROD) {
    Sentry.addBreadcrumb(breadcrumb);
  }
}

/**
 * Start a transaction for performance monitoring
 */
export function startTransaction(name: string, op: string): Sentry.Transaction {
  if (import.meta.env.PROD) {
    return Sentry.startTransaction({ name, op });
  }
  // Return mock transaction in dev
  return {
    finish: () => {},
    setData: () => {},
    setMeasurement: () => {},
  } as any;
}

// Export Sentry for direct use if needed
export { Sentry };

