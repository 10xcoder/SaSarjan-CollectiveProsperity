# Admin Panel Testing Setup

This document provides comprehensive testing setup and guidelines for the SaSarjan Admin Panel.

## 📋 Table of Contents

- [Overview](#overview)
- [Testing Stack](#testing-stack)
- [Setup Instructions](#setup-instructions)
- [Running Tests](#running-tests)
- [Test Structure](#test-structure)
- [Writing Tests](#writing-tests)
- [Test Data Management](#test-data-management)
- [Best Practices](#best-practices)
- [CI/CD Integration](#cicd-integration)

## 🎯 Overview

The admin panel uses a comprehensive testing strategy combining:

- **Unit Tests**: Component and utility function testing
- **Integration Tests**: API route and database testing
- **E2E Tests**: Full user workflow testing
- **Accessibility Tests**: WCAG compliance verification
- **Performance Tests**: Core Web Vitals monitoring

## 🛠 Testing Stack

### Unit Testing

- **Framework**: Vitest
- **Testing Library**: @testing-library/react
- **Environment**: happy-dom
- **Mocking**: Vitest built-in mocks

### E2E Testing

- **Framework**: Playwright
- **Browsers**: Chromium, Firefox, WebKit
- **Accessibility**: @axe-core/playwright
- **Performance**: Built-in Playwright metrics

### Coverage

- **Provider**: V8 (built into Vitest)
- **Reports**: HTML, JSON, Text
- **Threshold**: 80% minimum coverage

## 🚀 Setup Instructions

### Prerequisites

```bash
# Ensure you have the required Node.js version
node --version  # Should be >= 22.0.0
pnpm --version  # Should be >= 9.0.0
```

### Installation

```bash
# Install dependencies (already done if you've run pnpm install)
pnpm install

# Install Playwright browsers (required for E2E tests)
pnpm playwright install
```

### Environment Setup

```bash
# Copy environment variables
cp .env.example .env.local

# Update with test database credentials
# For testing, use a separate test database
```

## 🏃‍♂️ Running Tests

### Unit Tests

```bash
# Run all unit tests
pnpm test:unit

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run specific test file
pnpm vitest src/components/modals/__tests__/user-modal.test.tsx

# Run tests matching pattern
pnpm vitest --grep "UserModal"
```

### E2E Tests

```bash
# Run all E2E tests
pnpm test:e2e

# Run E2E tests in headed mode (see browser)
pnpm test:headed

# Run E2E tests with UI mode
pnpm test:ui

# Run specific E2E test
pnpm playwright test user-management.spec.ts

# Debug E2E tests
pnpm test:debug
```

### All Tests

```bash
# Run all tests (unit + E2E)
pnpm test

# Run tests in CI mode
CI=true pnpm test
```

## 📁 Test Structure

```
apps/admin/
├── e2e/                          # E2E tests
│   ├── fixtures/                 # Test fixtures and helpers
│   ├── utils/                    # E2E test utilities
│   ├── auth.spec.ts             # Authentication tests
│   ├── dashboard.spec.ts        # Dashboard tests
│   ├── user-management.spec.ts  # User management tests
│   ├── accessibility.spec.ts    # Accessibility tests
│   ├── performance.spec.ts      # Performance tests
│   ├── global-setup.ts          # Global E2E setup
│   └── global-teardown.ts       # Global E2E cleanup
├── src/
│   ├── components/
│   │   └── **/__tests__/        # Component unit tests
│   ├── lib/
│   │   └── __tests__/           # Utility function tests
│   ├── hooks/
│   │   └── __tests__/           # Custom hook tests
│   └── test/
│       ├── setup.ts             # Global test setup
│       └── utils.tsx            # Test utilities
├── playwright.config.ts         # Playwright configuration
├── vitest.config.ts            # Vitest configuration
└── TEST_SETUP.md               # This file
```

## ✍️ Writing Tests

### Unit Test Example

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@/test/utils';
import { YourComponent } from '../your-component';

describe('YourComponent', () => {
  it('should render correctly', () => {
    render(<YourComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('should handle user interactions', async () => {
    const mockFn = vi.fn();
    render(<YourComponent onClick={mockFn} />);

    fireEvent.click(screen.getByRole('button'));
    expect(mockFn).toHaveBeenCalled();
  });
});
```

### E2E Test Example

```typescript
import { test, expect } from './fixtures/admin-fixtures';

test.describe('Feature Name', () => {
  test('should perform user workflow', async ({ authenticatedPage, adminHelpers }) => {
    await adminHelpers.navigateToUsers();

    await expect(authenticatedPage.locator('[data-testid="users-table"]')).toBeVisible();

    // Add more test steps...
  });
});
```

### Test Data IDs

Add `data-testid` attributes to components for reliable testing:

```typescript
// ✅ Good
<button data-testid="create-user-button">Create User</button>

// ❌ Avoid
<button className="create-user-btn">Create User</button>
```

## 🗄️ Test Data Management

### Static Test Data

```typescript
// src/test/fixtures/users.ts
export const testUsers = {
  admin: {
    email: 'admin@test.com',
    password: 'secure123',
    role: 'admin'
  },
  regular: {
    email: 'user@test.com',
    password: 'secure123',
    role: 'user'
  }
};
```

### Dynamic Test Data

```typescript
// Generate unique test data
export const generateTestUser = () => ({
  email: `test_${Date.now()}@example.com`,
  fullName: `Test User ${Date.now()}`,
  // ...other fields
});
```

### Database Seeding

```typescript
// e2e/global-setup.ts
async function seedTestData() {
  // Create test users, apps, etc.
  // This runs before all E2E tests
}
```

## 📋 Best Practices

### General Testing

1. **Test Behavior, Not Implementation**
   - Test what users see and do
   - Avoid testing internal state

2. **Use Descriptive Test Names**

   ```typescript
   // ✅ Good
   test('should show error message when email is invalid')

   // ❌ Avoid
   test('email validation')
   ```

3. **Follow AAA Pattern**
   - **Arrange**: Set up test data
   - **Act**: Perform the action
   - **Assert**: Verify the result

### Unit Testing

1. **Mock External Dependencies**

   ```typescript
   vi.mock('@/lib/supabase', () => ({ /* mock implementation */ }));
   ```

2. **Test Edge Cases**
   - Empty states
   - Error conditions
   - Loading states

3. **Keep Tests Independent**
   - Each test should work in isolation
   - Use `beforeEach` for setup

### E2E Testing

1. **Use Page Object Model**

   ```typescript
   // helpers/user-page.ts
   export class UserPage {
     async createUser(userData) { /* implementation */ }
     async searchUser(query) { /* implementation */ }
   }
   ```

2. **Wait for Elements Properly**

   ```typescript
   // ✅ Good
   await expect(page.locator('[data-testid="user-list"]')).toBeVisible();

   // ❌ Avoid
   await page.waitForTimeout(1000);
   ```

3. **Use Fixtures for Authentication**
   ```typescript
   test('should manage users', async ({ authenticatedPage }) => {
     // Test runs with pre-authenticated user
   });
   ```

### Accessibility Testing

1. **Test Keyboard Navigation**
2. **Verify ARIA Labels**
3. **Check Color Contrast**
4. **Test Screen Reader Compatibility**

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
name: Admin Tests
on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - name: Run unit tests
        run: pnpm test:unit --coverage

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - name: Install Playwright
        run: pnpm playwright install
      - name: Run E2E tests
        run: pnpm test:e2e
```

## 🎯 Coverage Goals

### Minimum Coverage Requirements

- **Overall**: 80%
- **Functions**: 85%
- **Lines**: 80%
- **Branches**: 75%

### Critical Areas (100% Coverage Required)

- Authentication logic
- Payment processing
- User data handling
- Security-related functions

## 🔧 Debugging Tests

### Unit Test Debugging

```bash
# Debug specific test
pnpm vitest --debug src/components/user-modal.test.tsx

# Use debugger statements
test('debug example', () => {
  debugger; // Will pause execution
  // test code...
});
```

### E2E Test Debugging

```bash
# Debug with browser open
pnpm playwright test --debug

# Save trace files
pnpm playwright test --trace on
```

### Common Issues

1. **Test timeouts**: Increase timeout in config
2. **Flaky tests**: Add proper waits
3. **Mock issues**: Verify mock setup
4. **Data issues**: Check test data cleanup

## 📊 Metrics and Reporting

### Coverage Reports

- **Location**: `coverage/` directory
- **Format**: HTML, JSON, LCOV
- **CI Integration**: Automatic upload to coverage services

### E2E Reports

- **Location**: `playwright-report/` directory
- **Features**: Screenshots, videos, traces
- **CI Integration**: Artifact upload for failed tests

## 🤝 Contributing

### Adding New Tests

1. Create test file with `.test.ts` or `.spec.ts` extension
2. Follow existing patterns and conventions
3. Add `data-testid` attributes to new components
4. Update this documentation if needed

### Test Review Checklist

- [ ] Tests are independent and isolated
- [ ] Descriptive test names and descriptions
- [ ] Proper assertions and error messages
- [ ] Edge cases covered
- [ ] Accessibility considerations included
- [ ] Performance implications considered

---

## 📞 Support

If you encounter issues with the testing setup:

1. Check the [troubleshooting section](#common-issues)
2. Review test logs and error messages
3. Consult team documentation
4. Ask in team chat or create an issue

Remember: Good tests are an investment in code quality and developer confidence! 🚀
