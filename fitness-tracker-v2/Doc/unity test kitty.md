# Fitness Tracker - Comprehensive Testing Guide

## Table of Contents
1. [Setup](#setup)
2. [Running Tests](#running-tests)
3. [Test Types](#test-types)
4. [Writing Tests](#writing-tests)
5. [CI/CD Integration](#cicd-integration)
6. [Best Practices](#best-practices)

---

## Setup

### Install Dependencies

```bash
# Install testing libraries
pnpm add -D vitest @vitest/ui @vitest/coverage-v8
pnpm add -D @testing-library/react @testing-library/jest-dom @testing-library/user-event
pnpm add -D @playwright/test
pnpm add -D jsdom happy-dom
pnpm add -D @firebase/rules-unit-testing
```

### Configuration Files

All configuration files are already created:
- `vitest.config.ts` - Unit/integration test config
- `playwright.config.ts` - E2E test config
- `src/test/setup.ts` - Global test setup

---

## Running Tests

### Package.json Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:watch": "vitest --watch",
    "test:run": "vitest run",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:report": "playwright show-report",
    "test:integration": "vitest run --config vitest.integration.config.ts",
    "test:unit": "vitest run src/**/*.test.{ts,tsx}",
    "test:all": "pnpm test:unit && pnpm test:integration && pnpm test:e2e"
  }
}
```

### Running Specific Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run with UI
pnpm test:ui

# Run with coverage
pnpm test:coverage

# Run specific test file
pnpm test src/features/workouts/components/WorkoutForm.test.tsx

# Run tests matching pattern
pnpm test --grep "workout"

# Run E2E tests
pnpm test:e2e

# Run E2E tests with browser visible
pnpm test:e2e:headed

# Run specific E2E test
pnpm test:e2e tests/e2e/workout.spec.ts

# Run E2E in debug mode
pnpm test:e2e:debug
```

---

## Test Types

### 1. Unit Tests (Vitest)

Test individual functions and utilities in isolation.

**Location:** `packages/shared/utils/*.test.ts`

**Example:**
```typescript
// packages/shared/utils/calculations.test.ts
import { describe, it, expect } from 'vitest';
import { calculateOneRepMax } from './calculations';

describe('calculateOneRepMax', () => {
  it('should calculate 1RM correctly', () => {
    const result = calculateOneRepMax(100, 10);
    expect(result).toBeCloseTo(133.33, 1);
  });
});
```

**Run:**
```bash
pnpm test:unit
```

---

### 2. Component Tests (Vitest + Testing Library)

Test React components in isolation.

**Location:** `apps/web/src/features/**/*.test.tsx`

**Example:**
```typescript
// apps/web/src/features/workouts/components/WorkoutForm.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WorkoutForm } from './WorkoutForm';

it('should submit form with valid data', async () => {
  const user = userEvent.setup();
  const onSuccess = vi.fn();
  
  render(<WorkoutForm onSuccess={onSuccess} />);
  
  await user.type(screen.getByLabelText(/workout name/i), 'Test Workout');
  await user.click(screen.getByRole('button', { name: /save/i }));
  
  expect(onSuccess).toHaveBeenCalled();
});
```

**Run:**
```bash
pnpm test src/features/workouts/
```

---

### 3. Integration Tests (Vitest)

Test tRPC routers and API endpoints.

**Location:** `functions/src/routers/*.test.ts`

**Example:**
```typescript
// functions/src/routers/workout.router.test.ts
import { workoutRouter } from './workout.router';

describe('Workout Router', () => {
  it('should create workout', async () => {
    const caller = workoutRouter.createCaller({ 
      user: { uid: 'test-user' } 
    });
    
    const result = await caller.createWorkout({
      name: 'Test Workout',
      exercises: [],
      duration: 3600
    });
    
    expect(result).toHaveProperty('id');
  });
});
```

**Run:**
```bash
pnpm test:integration
```

---

### 4. E2E Tests (Playwright)

Test complete user flows in real browser.

**Location:** `tests/e2e/*.spec.ts`

**Example:**
```typescript
// tests/e2e/workout.spec.ts
import { test, expect } from '@playwright/test';

test('should create workout successfully', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[data-testid="email-input"]', 'test@example.com');
  await page.fill('[data-testid="password-input"]', 'password123');
  await page.click('[data-testid="login-button"]');
  
  await page.goto('/workouts/start');
  await page.fill('[data-testid="workout-name-input"]', 'Test Workout');
  await page.click('[data-testid="save-workout-button"]');
  
  await expect(page.locator('[data-testid="toast-success"]')).toBeVisible();
});
```

**Run:**
```bash
pnpm test:e2e
```

---

## Writing Tests

### Test Structure

```typescript
describe('Feature/Component Name', () => {
  // Setup before all tests
  beforeAll(() => {
    // Runs once before all tests
  });

  // Setup before each test
  beforeEach(() => {
    // Runs before each test
    vi.clearAllMocks();
  });

  // Cleanup after each test
  afterEach(() => {
    // Runs after each test
    cleanup();
  });

  // Cleanup after all tests
  afterAll(() => {
    // Runs once after all tests
  });

  it('should do something', () => {
    // Test implementation
  });

  it('should handle edge case', () => {
    // Test implementation
  });
});
```

---

### Testing Patterns

#### 1. Arrange, Act, Assert (AAA)

```typescript
it('should calculate total volume', () => {
  // Arrange
  const sets = [
    { weight: 100, reps: 10, completed: true },
    { weight: 110, reps: 8, completed: true }
  ];

  // Act
  const result = calculateTotalVolume(sets);

  // Assert
  expect(result).toBe(1880);
});
```

#### 2. User-Centric Testing

```typescript
it('should allow user to log workout', async () => {
  const user = userEvent.setup();
  render(<WorkoutForm />);

  // User types workout name
  await user.type(screen.getByLabelText(/workout name/i), 'My Workout');

  // User clicks save
  await user.click(screen.getByRole('button', { name: /save/i }));

  // User sees success message
  await expect(screen.getByText(/workout saved/i)).toBeInTheDocument();
});
```

#### 3. Mocking External Dependencies

```typescript
import { vi } from 'vitest';

// Mock module
vi.mock('../lib/trpc', () => ({
  trpc: {
    workout: {
      create: {
        useMutation: vi.fn(() => ({
          mutate: vi.fn(),
          isLoading: false
        }))
      }
    }
  }
}));

// Mock function
const mockFn = vi.fn();
mockFn.mockReturnValue('mocked value');
mockFn.mockResolvedValue('async value');
mockFn.mockRejectedValue(new Error('error'));
```

#### 4. Testing Async Operations

```typescript
it('should fetch workouts', async () => {
  const { result, waitFor } = renderHook(() => useWorkouts());

  await waitFor(() => {
    expect(result.current.isLoading).toBe(false);
  });

  expect(result.current.data).toHaveLength(5);
});
```

#### 5. Testing Forms

```typescript
it('should validate form inputs', async () => {
  const user = userEvent.setup();
  render(<WorkoutForm />);

  // Submit without filling
  await user.click(screen.getByRole('button', { name: /save/i }));

  // Check validation errors
  expect(screen.getByText(/name is required/i)).toBeInTheDocument();
  expect(screen.getByText(/at least one exercise/i)).toBeInTheDocument();
});
```

#### 6. Testing User Interactions

```typescript
it('should handle click events', async () => {
  const user = userEvent.setup();
  const handleClick = vi.fn();
  
  render(<Button onClick={handleClick}>Click me</Button>);
  
  await user.click(screen.getByRole('button'));
  
  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

---

### Testing Queries and Mutations

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

it('should fetch data with useQuery', async () => {
  const { result, waitFor } = renderHook(
    () => useWorkouts(),
    { wrapper: createWrapper() }
  );

  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  
  expect(result.current.data).toBeDefined();
});
```

---

### E2E Testing Best Practices

#### 1. Use Data Test IDs

```tsx
// Component
<button data-testid="save-workout-button">Save</button>

// Test
await page.click('[data-testid="save-workout-button"]');
```

#### 2. Wait for Elements

```typescript
// Wait for element to be visible
await expect(page.locator('[data-testid="workout-card"]')).toBeVisible();

// Wait for navigation
await page.waitForURL('/workouts/history');

// Wait for timeout
await page.waitForTimeout(1000);

// Wait for load state
await page.waitForLoadState('networkidle');
```

#### 3. Handle Flaky Tests

```typescript
// Use retry
test('flaky test', async ({ page }) => {
  test.setTimeout(60000);
  
  await expect(async () => {
    await page.goto('/dashboard');
    await expect(page.locator('[data-testid="data"]')).toBeVisible();
  }).toPass({ timeout: 10000 });
});
```

#### 4. Test Fixtures

```typescript
// tests/e2e/fixtures.ts
import { test as base } from '@playwright/test';

export const test = base.extend({
  authenticatedPage: async ({ page }, use) => {
    // Login
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'password');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/dashboard');
    
    await use(page);
  }
});

// Usage
test('should access protected route', async ({ authenticatedPage }) => {
  await authenticatedPage.goto('/workouts');
  // Test implementation
});
```

---

## CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Run unit tests
        run: pnpm test:unit
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

  integration-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Run integration tests
        run: pnpm test:integration

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Install Playwright browsers
        run: pnpm exec playwright install --with-deps
      
      - name: Run E2E tests
        run: pnpm test:e2e
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

---

## Best Practices

### 1. Test Naming

```typescript
// ❌ Bad
it('test 1', () => {});

// ✅ Good
it('should calculate 1RM when given weight and reps', () => {});
```

### 2. Keep Tests Independent

```typescript
// ❌ Bad - Tests depend on each other
let sharedState;

it('test 1', () => {
  sharedState = 'value';
});

it('test 2', () => {
  expect(sharedState).toBe('value'); // Fails if run alone
});

// ✅ Good - Each test is independent
it('test 1', () => {
  const state = 'value';
  expect(state).toBe('value');
});

it('test 2', () => {
  const state = 'value';
  expect(state).toBe('value');
});
```

### 3. Test One Thing

```typescript
// ❌ Bad - Testing multiple things
it('should create and delete workout', async () => {
  const workout = await createWorkout({});
  expect(workout).toBeDefined();
  
  await deleteWorkout(workout.id);
  const deleted = await getWorkout(workout.id);
  expect(deleted).toBeNull();
});

// ✅ Good - Separate tests
it('should create workout', async () => {
  const workout = await createWorkout({});
  expect(workout).toBeDefined();
});

it('should delete workout', async () => {
  const workout = await createWorkout({});
  await deleteWorkout(workout.id);
  const deleted = await getWorkout(workout.id);
  expect(deleted).toBeNull();
});
```

### 4. Use Descriptive Assertions

```typescript
// ❌ Bad
expect(result).toBeTruthy();

// ✅ Good
expect(result.totalVolume).toBe(1880);
```

### 5. Avoid Implementation Details

```typescript
// ❌ Bad - Testing implementation
it('should call setState', () => {
  const { result } = renderHook(() => useState(0));
  result.current[1](1);
  // Testing React internals
});

// ✅ Good - Testing behavior
it('should increment counter', async () => {
  render(<Counter />);
  await userEvent.click(screen.getByRole('button', { name: /increment/i }));
  expect(screen.getByText('1')).toBeInTheDocument();
});
```

### 6. Use Test Data Builders

```typescript
// testDataBuilders.ts
export const buildWorkout = (overrides = {}) => ({
  id: 'workout-123',
  name: 'Test Workout',
  exercises: [],
  duration: 3600,
  totalVolume: 0,
  ...overrides
});

// Usage
it('should display workout', () => {
  const workout = buildWorkout({ name: 'Custom Workout' });
  render(<WorkoutCard workout={workout} />);
  expect(screen.getByText('Custom Workout')).toBeInTheDocument();
});
```

### 7. Coverage Goals

- **Statements:** 80%+
- **Branches:** 75%+
- **Functions:** 80%+
- **Lines:** 80%+

Focus on testing critical paths and edge cases rather than achieving 100% coverage.

---

## Debugging Tests

### Vitest

```bash
# Run with debugging
node --inspect-brk ./node_modules/.bin/vitest

# Use VS Code debugger
# Add to .vscode/launch.json:
{
  "type": "node",
  "request": "launch",
  "name": "Debug Vitest Tests",
  "runtimeExecutable": "${workspaceFolder}/node_modules/.bin/vitest",
  "console": "integratedTerminal"
}
```

### Playwright

```bash
# Debug mode
pnpm test:e2e:debug

# Headed mode
pnpm test:e2e:headed

# UI mode
pnpm test:e2e:ui

# View report
pnpm test:e2e:report
```

---

## Common Testing Utilities

```typescript
// Custom matchers
expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    return {
      pass,
      message: () => `expected ${received} to be within ${floor}-${ceiling}`
    };
  }
});

// Custom render with providers
export const renderWithProviders = (ui, options = {}) => {
  const Wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <Router>
        {children}
      </Router>
    </QueryClientProvider>
  );
  
  return render(ui, { wrapper: Wrapper, ...options });
};

// Wait for async updates
export const waitForLoadingToFinish = () => 
  waitFor(() => {
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  });
```

---

## Testing Checklist

- [ ] All critical user flows have E2E tests
- [ ] Utility functions have unit tests
- [ ] Components have component tests
- [ ] API routers have integration tests
- [ ] Coverage meets minimum thresholds
- [ ] Tests run in CI pipeline
- [ ] Flaky tests are fixed or skipped
- [ ] Test data is isolated and cleaned up
- [ ] Mock data is realistic
- [ ] Error cases are tested
- [ ] Edge cases are covered
- [ ] Tests are maintainable and readable

---

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Playwright Documentation](https://playwright.dev/)
- [Kent C. Dodds Testing](https://kentcdodds.com/testing)