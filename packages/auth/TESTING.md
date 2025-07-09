# 🧪 SaSarjan Auth Testing Guide

This document provides comprehensive information about testing the SaSarjan authentication system.

## 🎯 Testing Strategy

### Test Types

1. **Unit Tests** - Test individual functions and modules
2. **Integration Tests** - Test cross-app communication and workflows
3. **Security Tests** - Test security vulnerabilities and attack vectors
4. **E2E Tests** - Test complete user journeys across all apps

### Coverage Goals

- **Unit Tests**: 95% code coverage
- **Integration Tests**: 100% critical path coverage
- **Security Tests**: All OWASP Top 10 scenarios
- **E2E Tests**: 100% user journey coverage

## 🚀 Quick Start

### Install Dependencies

```bash
cd packages/auth
pnpm install
```

### Run All Tests

```bash
# Run all tests
pnpm test:all

# Run with coverage
pnpm test:coverage

# Run in watch mode
pnpm test:watch
```

### Run Specific Test Types

```bash
# Unit tests only
pnpm test:run

# Security tests only
pnpm test:security

# Integration tests only
pnpm test:integration

# With UI
pnpm test:ui
pnpm test:integration:ui
```

## 📋 Test Categories

### 1. Unit Tests (`tests/unit/`)

Tests for individual modules and functions:

#### Crypto Tests (`crypto.test.ts`)
- ✅ AES-256-GCM encryption/decryption
- ✅ HMAC signing and verification
- ✅ Secure random generation
- ✅ Key derivation
- ✅ Constant-time comparison

#### JWT Tests (`jwt.test.ts`)
- ✅ Token generation and verification
- ✅ Device fingerprinting
- ✅ Token rotation
- ✅ Expiration handling
- ✅ Signature validation

#### HMAC Tests (`hmac.test.ts`)
- ✅ Message signing
- ✅ Replay protection
- ✅ Nonce management
- ✅ Timing attack resistance

#### Session Management Tests (`session-manager.test.ts`)
- ✅ Session creation and validation
- ✅ Activity monitoring
- ✅ Cross-app synchronization
- ✅ Storage integration

### 2. Integration Tests (`tests/integration/`)

Tests for cross-app functionality:

#### Cross-App Sync Tests (`cross-app-sync.test.ts`)
- ✅ Secure message broadcasting
- ✅ HMAC verification
- ✅ Encryption/decryption
- ✅ Replay attack prevention
- ✅ Trusted app validation

#### Auth Flow Tests (`auth-flow.test.ts`)
- ✅ Complete login/logout workflows
- ✅ Token refresh flows
- ✅ Session synchronization
- ✅ Cookie management
- ✅ CSRF protection

### 3. Security Tests (`tests/security/`)

Tests for security vulnerabilities:

#### CSRF Protection Tests (`csrf-protection.test.ts`)
- ✅ Token validation
- ✅ Double-submit cookie pattern
- ✅ Timing attack resistance
- ✅ Malformed request handling

#### XSS Prevention Tests (`xss-prevention.test.ts`)
- ✅ Input sanitization
- ✅ Output encoding
- ✅ Content Security Policy
- ✅ Script injection prevention

#### Session Security Tests (`session-security.test.ts`)
- ✅ Session hijacking prevention
- ✅ Session fixation protection
- ✅ Secure cookie handling
- ✅ Activity monitoring

### 4. E2E Tests (`tests/e2e/`)

Tests for complete user journeys:

#### Multi-App Workflow Tests
- ✅ Login on one app, access another
- ✅ Logout from one app, logout from all
- ✅ Session expiration handling
- ✅ Token refresh across apps

## 🔧 Test Configuration

### Vitest Configuration (`vitest.config.ts`)

```typescript
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      thresholds: {
        global: {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90
        }
      }
    }
  }
})
```

### Playwright Configuration (`playwright.config.ts`)

```typescript
export default defineConfig({
  testDir: './tests/integration',
  fullyParallel: false, // Sequential for auth tests
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 2,
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  }
})
```

## 🎭 Test Environment Setup

### Environment Variables

```bash
# Test environment variables
NEXT_PUBLIC_SUPABASE_URL=https://test.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=test-anon-key
HMAC_SECRET_KEY=test-hmac-secret-key-minimum-32-chars
JWT_SECRET=test-jwt-secret
TOKEN_ENCRYPTION_KEY=test-encryption-key-32-chars-min
```

### Mock Services

The test suite includes comprehensive mocks for:

- **Supabase** - Database and authentication
- **Crypto APIs** - Web Crypto API for encryption
- **Storage APIs** - localStorage and sessionStorage
- **BroadcastChannel** - Cross-app communication
- **Fetch API** - HTTP requests

## 📊 Test Reports

### Coverage Reports

```bash
# Generate coverage report
pnpm test:coverage

# View coverage report
open coverage/index.html
```

### Integration Reports

```bash
# Generate Playwright report
pnpm test:integration

# View Playwright report
pnpm playwright show-report
```

### Custom Test Runner

```bash
# Run comprehensive test suite with reports
npx tsx tests/test-runner.ts

# View generated reports
open test-results/test-report.html
```

## 🚨 Security Testing

### OWASP Top 10 Coverage

1. **Injection** - SQL/NoSQL injection prevention
2. **Broken Authentication** - Session management testing
3. **Sensitive Data Exposure** - Encryption testing
4. **XML External Entities** - Not applicable
5. **Broken Access Control** - Permission testing
6. **Security Misconfiguration** - Configuration validation
7. **Cross-Site Scripting** - XSS prevention testing
8. **Insecure Deserialization** - Safe parsing testing
9. **Known Vulnerabilities** - Dependency scanning
10. **Insufficient Logging** - Audit trail testing

### Automated Security Scans

```bash
# Run security-focused tests
pnpm test:security

# Run with security report
pnpm test:security --reporter=html
```

## 🔍 Debugging Tests

### Debug Unit Tests

```bash
# Run with debugger
pnpm test --inspect-brk

# Run specific test
pnpm test crypto.test.ts

# Run with UI
pnpm test:ui
```

### Debug Integration Tests

```bash
# Run with browser visible
pnpm test:integration:headed

# Run with debugging tools
pnpm test:integration:ui

# Run specific test
pnpm test:integration --grep "should sync login"
```

### Debug Security Tests

```bash
# Run with verbose output
pnpm test:security --reporter=verbose

# Run specific security test
pnpm test tests/security/csrf-protection.test.ts
```

## 📈 Performance Testing

### Metrics Tracked

- **Authentication Latency** - Time to authenticate
- **Token Generation** - Time to generate/verify tokens
- **Cross-App Sync** - Time for sync propagation
- **Session Validation** - Time to validate sessions

### Performance Tests

```bash
# Run performance benchmarks
pnpm test:performance

# Run with profiling
pnpm test --reporter=verbose
```

## 🎯 Test Best Practices

### Writing Tests

1. **Descriptive Names** - Use clear, descriptive test names
2. **Arrange-Act-Assert** - Structure tests clearly
3. **Mock External Dependencies** - Use mocks for external services
4. **Test Edge Cases** - Include error conditions and edge cases
5. **Maintain Test Data** - Use factories for test data

### Test Organization

```
tests/
├── unit/           # Unit tests
├── integration/    # Integration tests
├── security/       # Security tests
├── e2e/           # End-to-end tests
├── fixtures/      # Test data and fixtures
├── mocks/         # Mock implementations
├── helpers/       # Test utilities
└── setup.ts       # Test setup
```

### Code Coverage

- **Statements**: 95%+
- **Branches**: 90%+
- **Functions**: 95%+
- **Lines**: 95%+

## 🚀 CI/CD Integration

### GitHub Actions

```yaml
name: Auth Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: pnpm install
      - run: pnpm test:ci
      - run: pnpm test:integration
      - run: pnpm test:security
```

### Test Commands for CI

```bash
# Run all tests with reports
pnpm test:ci

# Run with coverage and JUnit output
pnpm test:coverage --reporter=junit
```

## 📚 Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [Auth0 Security Testing](https://auth0.com/blog/security-testing/)

## 🤝 Contributing

When adding new features:

1. **Write tests first** (TDD approach)
2. **Ensure coverage** meets thresholds
3. **Add security tests** for new attack vectors
4. **Update documentation** with new test cases
5. **Run full test suite** before submitting

## 📞 Support

For testing issues:

1. Check existing test documentation
2. Review test failures in CI
3. Check coverage reports
4. Create issue with test reproduction steps