# Application Monitoring

This document outlines the monitoring and observability strategy for the Fitness Tracker application.

## Overview

The application uses **Sentry** for comprehensive error tracking, performance monitoring, and release tracking in production environments.

---

## Features

### Error Tracking
- **Service**: Sentry
- **Coverage**: Frontend + Backend errors
- **Sampling Rate**: 100% of errors captured
- **Session Replay**: Enabled for debugging errors

### Performance Monitoring
- **Browser Tracing**: Automatic instrumentation
- **Transaction Sampling**: 10% of transactions
- **Performance Budget**: Tracked via Sentry dashboards

### Release Tracking
- Automatic release tracking
- Version tagging per deployment
- Deployment notifications

---

## Dashboard & Links

- **Sentry Dashboard**: [Configure in Sentry Console]
- **Environment**: `production` | `staging` | `development`
- **Release Tracking**: Automatic via Sentry

---

## Alerting Rules

### Critical Alerts

1. **Error Rate > 1%**
   - Condition: Error rate exceeds 1% of total transactions
   - Notification: Slack channel `#alerts-production`
   - Severity: Critical
   - Response Time: < 15 minutes

2. **API Response Time > 2s**
   - Condition: Average API response time exceeds 2 seconds
   - Notification: Email + Slack
   - Severity: Warning
   - Response Time: < 30 minutes

3. **Database Connection Failures**
   - Condition: Multiple connection failures detected
   - Notification: PagerDuty (on-call)
   - Severity: Critical
   - Response Time: Immediate

4. **Authentication Failures Spike**
   - Condition: > 10 auth failures in 5 minutes
   - Notification: Security team
   - Severity: High
   - Response Time: < 5 minutes

### Warning Alerts

1. **Performance Degradation**
   - Lighthouse score drops below 80
   - Notification: Slack
   - Severity: Low

2. **Frontend Error Rate Increase**
   - > 5% increase from baseline
   - Notification: Slack
   - Severity: Medium

---

## Metrics Tracked

### Application Metrics

- **Error Rates by Page**
  - Dashboard page errors
  - Login/Signup errors
  - Workout tracking errors
  - Plans creation errors

- **API Response Times**
  - Endpoint performance
  - Database query time
  - External service latency

- **User Session Tracking**
  - Session duration
  - User journey completion
  - Feature adoption rates

- **Performance Metrics**
  - Time to First Byte (TTFB)
  - First Contentful Paint (FCP)
  - Largest Contentful Paint (LCP)
  - Cumulative Layout Shift (CLS)

### Business Metrics

- **Active Users**
  - Daily/Monthly active users
  - User retention rates

- **Feature Usage**
  - Workout creation rate
  - Goal completion rate
  - Plan sharing frequency

---

## Configuration

### Environment Variables

Add to `.env.production`:

```env
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
VITE_APP_VERSION=1.0.0
```

### Sentry DSN

Get your DSN from:
1. Go to Sentry Dashboard
2. Select your project
3. Navigate to Settings → Client Keys (DSN)

---

## Integration Points

### Frontend Integration

**File**: `apps/web/src/main.tsx`

```typescript
import { initMonitoring } from './lib/monitoring';
initMonitoring();
```

### Backend Integration (Future)

```typescript
// functions/src/index.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

---

## Error Context

### User Context

Automatically captured when user is authenticated:

```typescript
import { setSentryUser, clearSentryUser } from './lib/monitoring';

// On login
setSentryUser({
  id: user.id,
  email: user.email,
  name: user.name,
});

// On logout
clearSentryUser();
```

### Custom Context

Add custom context to errors:

```typescript
import { captureError } from './lib/monitoring';

try {
  // risky operation
} catch (error) {
  captureError(error, {
    workoutId: workout.id,
    action: 'complete_workout',
  });
}
```

---

## Alert Channels

### Slack Integration

**Channel**: `#alerts-production`
**Format**: 
```
🔴 [Alert] Error rate exceeds threshold
Environment: production
Errors: 15/min
View: [Sentry Dashboard Link]
```

### Email Alerts

**Recipients**: 
- DevOps Team
- Lead Developers
- Product Manager

**Frequency**: Real-time for critical, daily digest for warnings

### PagerDuty (On-Call)

**Only for**: Critical database/infrastructure failures
**Escalation**: Every 10 minutes if not acknowledged

---

## Monitoring Dashboard Views

### Performance Dashboard

- Response time percentiles (p50, p95, p99)
- Request rate
- Error rate
- Apdex score

### Error Dashboard

- Errors by type
- Errors by page
- Error frequency
- Affected users

### Release Dashboard

- Deployment history
- Error rate by release
- Performance by release
- Rollback triggers

---

## Best Practices

### 1. Never Log Sensitive Data

✅ **Good:**
```typescript
captureError(error, { userId: '123' });
```

❌ **Bad:**
```typescript
captureError(error, { password: userPassword });
```

### 2. Use Descriptive Context

```typescript
Sentry.setContext('workout', {
  workoutId: workout.id,
  planId: workout.planId,
  exerciseCount: workout.exercises.length,
});
```

### 3. Filter Noise

Already configured in `monitoring.ts`:
- Browser extension errors
- Third-party script errors
- Known non-critical errors

### 4. Monitor Performance

```typescript
import { startTransaction } from './lib/monitoring';

const transaction = startTransaction('Create Workout', 'workout.create');
// ... perform operation
transaction.finish();
```

---

## Troubleshooting

### Sentry Not Capturing Errors

**Check:**
1. `VITE_SENTRY_DSN` is set in production environment
2. `import.meta.env.PROD` is `true`
3. No ad blockers blocking Sentry SDK

### Too Many Errors

**Solutions:**
- Review `ignoreErrors` in `monitoring.ts`
- Add more specific error filtering
- Adjust `tracesSampleRate` if needed

### Performance Impact

**Optimize:**
- Reduce `tracesSampleRate` (currently 10%)
- Reduce `replaysSessionSampleRate` (currently 10%)
- Disable session replay if not needed

---

## Access & Permissions

### Sentry Project Access

- **Developers**: Read + Create issues
- **DevOps**: Full access + Configure alerts
- **Product**: Read-only access to dashboards

### Granting Access

1. Go to Sentry Dashboard
2. Settings → Members
3. Invite by email

---

## Related Documentation

- [Performance Optimization](./PERFORMANCE.md)
- [Error Handling Strategy](../Doc/TROUBLESHOOTING.md)
- [CI/CD Pipeline](../.github/workflows/ci-cd.yml)

---

*Last Updated: Current Date*
*Maintained by: DevOps Team*

