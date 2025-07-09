# 🧪 Testing Guide: Pre-Deployment Validation

**Purpose**: Comprehensive testing before deployment to ensure quality and reliability

---

## 🚀 Quick Test Commands

### Full Test Suite
```bash
# Complete pre-deployment test
pnpm test:all

# Individual test categories
pnpm test:unit         # Unit tests
pnpm test:integration  # Integration tests
pnpm test:e2e          # End-to-end tests
pnpm typecheck         # TypeScript validation
pnpm lint              # Code quality checks
```

### Performance Testing
```bash
# Build performance check
pnpm build:check

# Lighthouse CI (if configured)
pnpm lighthouse

# Load testing
pnpm test:load
```

---

## 📋 Pre-Deployment Checklist

### Code Quality
- [ ] **TypeScript**: `pnpm typecheck` passes
- [ ] **Linting**: `pnpm lint` passes
- [ ] **Formatting**: `pnpm format:check` passes
- [ ] **Security**: `pnpm audit` shows no critical issues

### Functional Testing
- [ ] **Unit Tests**: All components tested
- [ ] **Integration Tests**: API endpoints working
- [ ] **E2E Tests**: Critical user journeys working
- [ ] **Browser Testing**: Chrome, Firefox, Safari, Edge

### Performance Testing
- [ ] **Build Size**: Bundle analysis acceptable
- [ ] **Core Web Vitals**: LCP < 2.5s, FID < 100ms, CLS < 0.1
- [ ] **Lighthouse Score**: Performance > 90
- [ ] **Load Testing**: Handles expected traffic

### Security Testing
- [ ] **Authentication**: Login/logout flows
- [ ] **Authorization**: Role-based access
- [ ] **Input Validation**: XSS/injection prevention
- [ ] **Headers**: Security headers present

---

## 🔧 Testing Each App

### SaSarjan Main App (Port 3000)
```bash
# Start app
pnpm dev:web

# Test critical paths
curl http://localhost:3000/api/health
curl http://localhost:3000/api/auth/session
```

**Test Cases:**
- [ ] Landing page loads
- [ ] User registration/login
- [ ] Prosperity wheel interaction
- [ ] Bundle selection
- [ ] Impact metrics display
- [ ] Mobile responsiveness

### TalentExcel (Port 3005)
```bash
# Start app
pnpm dev:talentexcel

# Test internship finder
curl http://localhost:3005/api/internships
```

**Test Cases:**
- [ ] Internship search
- [ ] Location filtering
- [ ] Application process
- [ ] Profile management
- [ ] Notification system

### 10xGrowth (Port 3003)
```bash
# Start app
pnpm dev:10xgrowth

# Test landing pages
curl http://localhost:3003/business-growth
curl http://localhost:3003/join-freelancers
```

**Test Cases:**
- [ ] Landing page creation
- [ ] Admin dashboard access
- [ ] Content management
- [ ] Analytics tracking
- [ ] SEO features

### SevaPremi (Port 3002)
```bash
# Start app
pnpm dev:sevapremi

# Test basic functionality
curl http://localhost:3002/api/health
```

**Test Cases:**
- [ ] Basic app structure
- [ ] Authentication flow
- [ ] Core features
- [ ] Mobile optimization

### Admin Dashboard (Port 3004)
```bash
# Start admin
pnpm dev:admin

# Test admin access
curl http://localhost:3004/api/admin/health
```

**Test Cases:**
- [ ] Admin authentication
- [ ] User management
- [ ] Content moderation
- [ ] Analytics dashboard
- [ ] System monitoring

---

## 🎯 E2E Testing with Playwright

### Setup
```bash
# Install Playwright
npx playwright install

# Run tests
pnpm test:e2e
```

### Critical User Journeys

#### User Registration Flow
```javascript
// apps/web/tests/auth.spec.ts
test('User can register and login', async ({ page }) => {
  await page.goto('/auth/register');
  await page.fill('[data-testid="email"]', 'test@example.com');
  await page.fill('[data-testid="password"]', 'password123');
  await page.click('[data-testid="submit"]');
  await expect(page).toHaveURL('/dashboard');
});
```

#### Bundle Purchase Flow
```javascript
// apps/web/tests/purchase.spec.ts
test('User can purchase bundle', async ({ page }) => {
  await page.goto('/bundles');
  await page.click('[data-testid="bundle-career-starter"]');
  await page.click('[data-testid="buy-now"]');
  await expect(page).toHaveURL('/checkout');
});
```

#### Admin Content Management
```javascript
// apps/admin/tests/content.spec.ts
test('Admin can create content', async ({ page }) => {
  await page.goto('/admin/content');
  await page.click('[data-testid="create-content"]');
  await page.fill('[data-testid="title"]', 'Test Content');
  await page.click('[data-testid="save"]');
  await expect(page.locator('[data-testid="success"]')).toBeVisible();
});
```

---

## 🔍 Performance Testing

### Core Web Vitals
```bash
# Using Lighthouse CI
npm install -g @lhci/cli
lhci autorun
```

### Bundle Analysis
```bash
# Analyze bundle sizes
pnpm build:analyze

# Check for duplicate dependencies
pnpm dlx bundle-analyzer
```

### Load Testing
```bash
# Using Artillery
npm install -g artillery
artillery run test-config.yml
```

**Artillery Config Example:**
```yaml
# test-config.yml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: 'Homepage load'
    requests:
      - get:
          url: '/'
  - name: 'API health check'
    requests:
      - get:
          url: '/api/health'
```

---

## 🧪 Database Testing

### Migration Testing
```bash
# Test migrations
pnpm db:reset
pnpm db:migrate
pnpm db:seed
```

### Data Integrity
```bash
# Test data consistency
pnpm test:db:integrity

# Test backup/restore
pnpm db:backup
pnpm db:restore
```

### Performance Testing
```sql
-- Test query performance
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'test@example.com';

-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

---

## 🔐 Security Testing

### Authentication Testing
```bash
# Test JWT token validation
curl -H "Authorization: Bearer invalid-token" http://localhost:3000/api/protected

# Test session management
curl -c cookies.txt http://localhost:3000/api/auth/login
curl -b cookies.txt http://localhost:3000/api/protected
```

### Input Validation
```javascript
// Test XSS prevention
const maliciousInput = '<script>alert("xss")</script>';
await page.fill('[data-testid="input"]', maliciousInput);
await page.click('[data-testid="submit"]');
// Should not execute script
```

### Rate Limiting
```bash
# Test rate limiting
for i in {1..10}; do
  curl http://localhost:3000/api/auth/login
done
# Should return 429 after limit
```

---

## 📊 Test Reports

### Coverage Reports
```bash
# Generate coverage report
pnpm test:coverage

# View HTML report
open coverage/index.html
```

### Performance Reports
```bash
# Generate performance report
pnpm build:stats

# View bundle analyzer
pnpm build:analyze
```

### Security Reports
```bash
# Security audit
pnpm audit

# Dependency vulnerability check
pnpm dlx audit-ci
```

---

## 🚨 Test Failure Handling

### When Tests Fail
1. **Check Error Messages**: Read failure details carefully
2. **Reproduce Locally**: Run same test in local environment
3. **Check Recent Changes**: Review recent commits
4. **Verify Environment**: Ensure all services running
5. **Update Tests**: If functionality changed legitimately

### Emergency Bypass
```bash
# Skip tests for emergency deployment (NOT recommended)
pnpm build --skip-tests
pnpm deploy --force
```

### Rollback Strategy
1. **Immediate**: Revert to last known good commit
2. **Database**: Restore from backup if needed
3. **Cache**: Clear CDN/cache if required
4. **Monitor**: Watch error rates post-rollback

---

## 📈 Continuous Testing

### GitHub Actions Integration
```yaml
# .github/workflows/test.yml
name: Test Suite
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - run: pnpm install
      - run: pnpm test:all
```

### Pre-commit Hooks
```bash
# Install pre-commit hooks
npx husky install

# Add test hook
npx husky add .husky/pre-commit "pnpm test:unit"
```

---

## 🎯 Test Automation

### Daily Health Checks
```bash
# Automated health monitoring
pnpm test:health

# Performance regression testing
pnpm test:performance:regression
```

### Staging Environment Testing
```bash
# Test against staging
NEXT_PUBLIC_API_URL=https://staging.sasarjan.app pnpm test:e2e
```

---

**✅ Ready for deployment when all tests pass and performance meets targets.**