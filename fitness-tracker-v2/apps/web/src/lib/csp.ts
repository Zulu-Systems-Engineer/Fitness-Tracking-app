/**
 * Content Security Policy and security headers configuration
 */

// Content Security Policy configuration
export const CSP_CONFIG = {
  development: {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      "'unsafe-inline'",
      "'unsafe-eval'", // Required for Vite in development
      "https://www.gstatic.com",
      "https://www.google.com",
      "https://apis.google.com"
    ],
    'style-src': [
      "'self'",
      "'unsafe-inline'",
      "https://fonts.googleapis.com"
    ],
    'font-src': [
      "'self'",
      "https://fonts.gstatic.com",
      "data:"
    ],
    'img-src': [
      "'self'",
      "data:",
      "https:",
      "blob:"
    ],
    'connect-src': [
      "'self'",
      "https://*.googleapis.com",
      "https://*.firebase.com",
      "https://*.firebaseapp.com",
      "wss://*.firebase.com",
      "ws://localhost:*", // For Vite dev server
      "http://localhost:*" // For Vite dev server
    ],
    'frame-src': [
      "'self'",
      "https://*.google.com"
    ],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
    'upgrade-insecure-requests': []
  },
  
  production: {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      "https://www.gstatic.com",
      "https://www.google.com",
      "https://apis.google.com"
    ],
    'style-src': [
      "'self'",
      "https://fonts.googleapis.com"
    ],
    'font-src': [
      "'self'",
      "https://fonts.gstatic.com"
    ],
    'img-src': [
      "'self'",
      "data:",
      "https:",
      "blob:"
    ],
    'connect-src': [
      "'self'",
      "https://*.googleapis.com",
      "https://*.firebase.com",
      "https://*.firebaseapp.com",
      "wss://*.firebase.com"
    ],
    'frame-src': [
      "'self'",
      "https://*.google.com"
    ],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
    'upgrade-insecure-requests': []
  }
};

// Generate CSP header string
export const generateCSPHeader = (environment: 'development' | 'production' = 'production'): string => {
  const config = CSP_CONFIG[environment];
  
  return Object.entries(config)
    .map(([directive, sources]) => {
      if (sources.length === 0) {
        return directive;
      }
      return `${directive} ${sources.join(' ')}`;
    })
    .join('; ');
};

// Security headers configuration
export const SECURITY_HEADERS = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin'
};

// Get all security headers
export const getAllSecurityHeaders = (environment: 'development' | 'production' = 'production') => {
  return {
    'Content-Security-Policy': generateCSPHeader(environment),
    ...SECURITY_HEADERS
  };
};

// Security middleware for development server
export const securityMiddleware = (req: any, res: any, next: any) => {
  const environment = process.env.NODE_ENV === 'development' ? 'development' : 'production';
  const headers = getAllSecurityHeaders(environment);
  
  Object.entries(headers).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
  
  next();
};

// Validate CSP compliance
export const validateCSPCompliance = (html: string): { compliant: boolean; violations: string[] } => {
  const violations: string[] = [];
  
  // Check for inline scripts
  if (html.includes('<script>') || html.includes('javascript:')) {
    violations.push('Inline scripts detected - CSP violation');
  }
  
  // Check for inline styles
  if (html.includes('style=') && !html.includes('nonce=')) {
    violations.push('Inline styles detected - CSP violation');
  }
  
  // Check for eval usage
  if (html.includes('eval(') || html.includes('Function(')) {
    violations.push('eval() usage detected - CSP violation');
  }
  
  return {
    compliant: violations.length === 0,
    violations
  };
};

// Security audit function
export const performSecurityAudit = () => {
  const auditResults = {
    timestamp: new Date().toISOString(),
    checks: [] as Array<{ name: string; passed: boolean; details: string }>
  };
  
  // Check HTTPS
  const isHTTPS = window.location.protocol === 'https:';
  auditResults.checks.push({
    name: 'HTTPS Protocol',
    passed: isHTTPS || window.location.hostname === 'localhost',
    details: isHTTPS ? 'Secure HTTPS connection' : 'HTTP connection detected'
  });
  
  // Check for secure cookies
  const hasSecureCookies = document.cookie.includes('Secure');
  auditResults.checks.push({
    name: 'Secure Cookies',
    passed: hasSecureCookies,
    details: hasSecureCookies ? 'Secure cookies detected' : 'No secure cookies found'
  });
  
  // Check for mixed content
  const hasMixedContent = document.querySelectorAll('img[src^="http:"], script[src^="http:"], link[href^="http:"]').length > 0;
  auditResults.checks.push({
    name: 'Mixed Content',
    passed: !hasMixedContent,
    details: hasMixedContent ? 'Mixed content detected' : 'No mixed content found'
  });
  
  // Check for external scripts
  const externalScripts = document.querySelectorAll('script[src]');
  const hasExternalScripts = Array.from(externalScripts).some(script => 
    !script.getAttribute('src')?.startsWith(window.location.origin)
  );
  auditResults.checks.push({
    name: 'External Scripts',
    passed: !hasExternalScripts,
    details: hasExternalScripts ? 'External scripts detected' : 'No external scripts found'
  });
  
  return auditResults;
};

// Export security configuration for different environments
export const getSecurityConfig = (environment: 'development' | 'production') => {
  return {
    csp: generateCSPHeader(environment),
    headers: getAllSecurityHeaders(environment),
    isDevelopment: environment === 'development',
    isProduction: environment === 'production'
  };
};
