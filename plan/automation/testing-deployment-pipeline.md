# Testing & Deployment Automation - TalentExcel

**Purpose**: Automate quality assurance and deployment processes to reduce human time  
**Target**: TalentExcel development pipeline  
**Benefits**: Catch issues early, consistent deployments, faster feedback  
**Created**: July 5, 2025

## 🎯 Automation Goals

### Time Savings

- **Manual Testing**: 30 min → 5 min automated
- **Code Review**: Focus on logic, not formatting
- **Deployment**: 20 min → 2 min automated
- **Bug Detection**: Catch issues before human review

### Quality Assurance

- **100% Consistent**: Same checks every time
- **Early Detection**: Find issues in PRs, not production
- **Security**: Automated vulnerability scanning
- **Performance**: Continuous performance monitoring

## 🔧 Testing Automation Pipeline

### 1. Pre-Commit Hooks (Local Developer Machine)

```yaml
# .husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Run these checks before allowing commit
echo "🔍 Running pre-commit checks..."

# TypeScript type checking
echo "📝 Checking TypeScript..."
pnpm typecheck || exit 1

# ESLint for code quality
echo "🧹 Running ESLint..."
pnpm lint || exit 1

# Prettier for formatting
echo "✨ Checking code formatting..."
pnpm format:check || exit 1

# Run unit tests (if any exist)
echo "🧪 Running unit tests..."
pnpm test:unit || exit 1

echo "✅ All pre-commit checks passed!"
```

**Setup Instructions for Developers**:

```bash
# One-time setup after cloning repo
pnpm install
pnpm prepare  # Installs husky hooks

# Hooks will automatically run on every commit
```

### 2. Pull Request Automation (GitHub Actions)

```yaml
# .github/workflows/pr-check.yml
name: PR Quality Check

on:
  pull_request:
    branches: [main]

jobs:
  quality-check:
    runs-on: ubuntu-latest
    timeout-minutes: 10

    steps:
      - name: 📦 Checkout code
        uses: actions/checkout@v4

      - name: 📋 Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'pnpm'

      - name: 📥 Install pnpm
        run: npm install -g pnpm

      - name: 🔧 Install dependencies
        run: pnpm install --frozen-lockfile

      - name: 📝 TypeScript Check
        run: pnpm typecheck

      - name: 🧹 Lint Check
        run: pnpm lint

      - name: ✨ Format Check
        run: pnpm format:check

      - name: 🏗️ Build Check
        run: pnpm build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}

      - name: 🧪 Unit Tests
        run: pnpm test:unit

      - name: 🔒 Security Audit
        run: pnpm audit --audit-level high

      - name: 📊 Bundle Size Check
        run: |
          pnpm build
          npx bundlesize

  e2e-tests:
    runs-on: ubuntu-latest
    timeout-minutes: 15

    steps:
      - name: 📦 Checkout code
        uses: actions/checkout@v4

      - name: 📋 Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'pnpm'

      - name: 🔧 Install dependencies
        run: |
          npm install -g pnpm
          pnpm install --frozen-lockfile

      - name: 🎭 Install Playwright
        run: pnpm playwright install --with-deps chromium

      - name: 🚀 Start test environment
        run: |
          pnpm build
          pnpm start &
          npx wait-on http://localhost:3001
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.TEST_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.TEST_SUPABASE_ANON_KEY }}

      - name: 🧪 Run E2E tests
        run: pnpm test:e2e

      - name: 📸 Upload screenshots on failure
        uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-screenshots
          path: test-results/
```

### 3. Automated Testing Suite

#### Unit Tests Setup

```typescript
// jest.config.js
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/app/layout.tsx',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
}

module.exports = createJestConfig(customJestConfig)
```

#### E2E Tests with Playwright

```typescript
// tests/internships.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Internship Listings', () => {
  test('should display internship cards', async ({ page }) => {
    await page.goto('/internships')

    // Wait for page to load
    await expect(page.locator('h1')).toContainText('Internship Opportunities')

    // Check if internship cards are displayed
    const cards = page.locator('[data-testid="internship-card"]')
    await expect(cards).toHaveCountGreaterThan(0)

    // Verify card content
    const firstCard = cards.first()
    await expect(firstCard.locator('[data-testid="internship-title"]')).toBeVisible()
    await expect(firstCard.locator('[data-testid="company-name"]')).toBeVisible()
  })

  test('should filter internships by location', async ({ page }) => {
    await page.goto('/internships')

    // Use location filter
    await page.selectOption('[data-testid="location-filter"]', 'remote')

    // Verify filtered results
    const cards = page.locator('[data-testid="internship-card"]')
    await expect(cards.first().locator('[data-testid="location-badge"]')).toContainText('Remote')
  })

  test('should be mobile responsive', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/internships')

    // Check mobile navigation
    await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible()

    // Verify cards stack properly on mobile
    const cards = page.locator('[data-testid="internship-card"]')
    const firstCard = cards.first()
    const secondCard = cards.nth(1)

    const firstCardBox = await firstCard.boundingBox()
    const secondCardBox = await secondCard.boundingBox()

    // Second card should be below first card (not side by side)
    expect(secondCardBox?.y).toBeGreaterThan(firstCardBox?.y + firstCardBox?.height)
  })
})
```

#### Accessibility Tests

```typescript
// tests/accessibility.spec.ts
import { test, expect } from '@playwright/test'
import { injectAxe, checkA11y } from 'axe-playwright'

test.describe('Accessibility Tests', () => {
  test('homepage should be accessible', async ({ page }) => {
    await page.goto('/')
    await injectAxe(page)
    await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: { html: true },
    })
  })

  test('internships page should be accessible', async ({ page }) => {
    await page.goto('/internships')
    await injectAxe(page)
    await checkA11y(page, null, {
      rules: {
        'color-contrast': { enabled: true },
        'keyboard-navigation': { enabled: true },
        'focus-management': { enabled: true },
      },
    })
  })
})
```

### 4. Performance Testing

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse Performance Check

on:
  pull_request:
    branches: [ main ]

jobs:
  lighthouse:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: '22'
        cache: 'pnpm'

    - name: Install and build
      run: |
        npm install -g pnpm
        pnpm install --frozen-lockfile
        pnpm build

    - name: Run Lighthouse CI
      run: |
        npm install -g @lhci/cli@0.12.x
        lhci autorun
      env:
        LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}

# lighthouserc.json
{
  "ci": {
    "collect": {
      "startServerCommand": "pnpm start",
      "url": ["http://localhost:3001", "http://localhost:3001/internships"],
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", {"minScore": 0.9}],
        "categories:accessibility": ["error", {"minScore": 0.9}],
        "categories:best-practices": ["error", {"minScore": 0.9}],
        "categories:seo": ["error", {"minScore": 0.9}]
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
```

## 🚀 Deployment Automation

### 1. Staging Deployment (Automatic on PR)

```yaml
# .github/workflows/deploy-staging.yml
name: Deploy to Staging

on:
  pull_request:
    branches: [main]

jobs:
  deploy-staging:
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'

    steps:
      - name: 📦 Checkout
        uses: actions/checkout@v4

      - name: 🚀 Deploy to Vercel Preview
        uses: amondnet/vercel-action@v25
        id: vercel-deploy
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          scope: ${{ secrets.VERCEL_ORG_ID }}
          comment: true

      - name: 🧪 Run smoke tests against staging
        run: |
          npm install -g pnpm
          pnpm install --frozen-lockfile
          pnpm playwright install --with-deps chromium
          STAGING_URL="${{ steps.vercel-deploy.outputs.preview-url }}" pnpm test:smoke

      - name: 📊 Performance audit on staging
        run: |
          npm install -g lighthouse
          lighthouse "${{ steps.vercel-deploy.outputs.preview-url }}" --chrome-flags="--headless" --output json --output-path ./lighthouse-staging.json
          node scripts/check-lighthouse-score.js ./lighthouse-staging.json

      - name: 💬 Comment PR with deployment info
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `🚀 **Staging Deployment Ready!**
              
              **Preview URL**: ${{ steps.vercel-deploy.outputs.preview-url }}
              
              **Test Checklist**:
              - [ ] Feature works as expected
              - [ ] Mobile responsive
              - [ ] No console errors
              - [ ] Performance acceptable
              
              **Automated Checks**: ✅ All passed`
            })
```

### 2. Production Deployment (Manual Approval)

```yaml
# .github/workflows/deploy-production.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  quality-gate:
    runs-on: ubuntu-latest
    steps:
      - name: 📦 Checkout
        uses: actions/checkout@v4

      - name: 🔍 Final quality check
        run: |
          npm install -g pnpm
          pnpm install --frozen-lockfile
          pnpm typecheck
          pnpm lint
          pnpm test:unit
          pnpm build

  deploy-production:
    runs-on: ubuntu-latest
    needs: quality-gate
    environment: production # Requires manual approval

    steps:
      - name: 📦 Checkout
        uses: actions/checkout@v4

      - name: 🚀 Deploy to Vercel Production
        uses: amondnet/vercel-action@v25
        id: vercel-deploy
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
          scope: ${{ secrets.VERCEL_ORG_ID }}

      - name: 🧪 Post-deployment smoke tests
        run: |
          npm install -g pnpm
          pnpm install --frozen-lockfile
          pnpm playwright install --with-deps chromium
          PROD_URL="https://talentexcel.com" pnpm test:smoke

      - name: 📊 Production performance check
        run: |
          npm install -g lighthouse
          lighthouse "https://talentexcel.com" --chrome-flags="--headless" --output json --output-path ./lighthouse-prod.json
          node scripts/check-lighthouse-score.js ./lighthouse-prod.json

      - name: 🔔 Notify team of deployment
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          channel: '#talentexcel-releases'
          text: |
            🚀 **TalentExcel deployed to production!**

            **Version**: ${{ github.sha }}
            **Deployed by**: ${{ github.actor }}
            **URL**: https://talentexcel.com
            **Status**: ${{ job.status }}
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

### 3. Automated Rollback on Failure

```yaml
# .github/workflows/rollback.yml
name: Emergency Rollback

on:
  workflow_dispatch:
    inputs:
      reason:
        description: 'Reason for rollback'
        required: true
        default: 'Production issue detected'

jobs:
  rollback:
    runs-on: ubuntu-latest
    environment: production

    steps:
      - name: 🚨 Emergency rollback
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod --force'
          github-comment: false

      - name: 📝 Create incident issue
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: '🚨 Production Rollback - ${{ github.event.inputs.reason }}',
              body: `**Rollback Reason**: ${{ github.event.inputs.reason }}
              **Rollback Time**: ${new Date().toISOString()}
              **Triggered By**: ${{ github.actor }}
              
              ## Investigation Checklist
              - [ ] Identify root cause
              - [ ] Create fix
              - [ ] Test fix thoroughly
              - [ ] Deploy fix
              - [ ] Verify fix in production
              
              ## Post-mortem
              - [ ] Document incident
              - [ ] Update processes to prevent recurrence`,
              labels: ['incident', 'production', 'high-priority']
            })
```

## 📊 Monitoring & Alerts

### 1. Performance Monitoring

```typescript
// scripts/check-lighthouse-score.js
const fs = require('fs')

const lighthouseData = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'))

const scores = {
  performance: lighthouseData.categories.performance.score * 100,
  accessibility: lighthouseData.categories.accessibility.score * 100,
  bestPractices: lighthouseData.categories['best-practices'].score * 100,
  seo: lighthouseData.categories.seo.score * 100,
}

const thresholds = {
  performance: 90,
  accessibility: 90,
  bestPractices: 90,
  seo: 90,
}

console.log('Lighthouse Scores:')
console.log(`Performance: ${scores.performance}% (threshold: ${thresholds.performance}%)`)
console.log(`Accessibility: ${scores.accessibility}% (threshold: ${thresholds.accessibility}%)`)
console.log(`Best Practices: ${scores.bestPractices}% (threshold: ${thresholds.bestPractices}%)`)
console.log(`SEO: ${scores.seo}% (threshold: ${thresholds.seo}%)`)

const failures = []
Object.keys(scores).forEach(category => {
  if (scores[category] < thresholds[category]) {
    failures.push(`${category}: ${scores[category]}% < ${thresholds[category]}%`)
  }
})

if (failures.length > 0) {
  console.error('❌ Lighthouse score check failed:')
  failures.forEach(failure => console.error(`  - ${failure}`))
  process.exit(1)
} else {
  console.log('✅ All Lighthouse scores meet thresholds!')
}
```

### 2. Error Monitoring Setup

```typescript
// src/lib/monitoring.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  beforeSend(event) {
    // Filter out known development errors
    if (event.exception) {
      const error = event.exception.values?.[0]
      if (error?.value?.includes('Development mode') && process.env.NODE_ENV === 'development') {
        return null
      }
    }
    return event
  },
})

// Custom error boundary for React components
export function withErrorBoundary<T extends object>(Component: React.ComponentType<T>) {
  return Sentry.withErrorBoundary(Component, {
    fallback: ({ error, resetError }) => (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold text-red-600 mb-4">Something went wrong</h2>
        <p className="text-gray-600 mb-4">{error.message}</p>
        <button
          onClick={resetError}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Try again
        </button>
      </div>
    ),
  })
}
```

## ⚡ Developer Experience Automation

### 1. Code Generation Scripts

```bash
#!/bin/bash
# scripts/generate-component.sh

COMPONENT_NAME=$1
COMPONENT_DIR="src/components/${COMPONENT_NAME,,}"

if [ -z "$COMPONENT_NAME" ]; then
  echo "Usage: ./scripts/generate-component.sh ComponentName"
  exit 1
fi

mkdir -p "$COMPONENT_DIR"

# Generate component file
cat > "$COMPONENT_DIR/index.tsx" << EOF
'use client'

interface ${COMPONENT_NAME}Props {
  // Add your props here
}

export function ${COMPONENT_NAME}({}: ${COMPONENT_NAME}Props) {
  return (
    <div>
      <h1>${COMPONENT_NAME} Component</h1>
      {/* Add your component content here */}
    </div>
  )
}
EOF

# Generate test file
cat > "$COMPONENT_DIR/${COMPONENT_NAME}.test.tsx" << EOF
import { render, screen } from '@testing-library/react'
import { ${COMPONENT_NAME} } from './index'

describe('${COMPONENT_NAME}', () => {
  it('renders correctly', () => {
    render(<${COMPONENT_NAME} />)
    expect(screen.getByText('${COMPONENT_NAME} Component')).toBeInTheDocument()
  })
})
EOF

echo "✅ Generated ${COMPONENT_NAME} component in ${COMPONENT_DIR}"
echo "📝 Don't forget to add your props and implement the component!"
```

### 2. Package.json Scripts for Automation

```json
{
  "scripts": {
    "dev": "next dev -p 3001",
    "build": "next build",
    "start": "next start -p 3001",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "typecheck": "tsc --noEmit",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "test:unit": "jest",
    "test:unit:watch": "jest --watch",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:smoke": "playwright test --config=playwright-smoke.config.ts",
    "test:a11y": "playwright test --config=playwright-a11y.config.ts",
    "generate:component": "./scripts/generate-component.sh",
    "generate:page": "./scripts/generate-page.sh",
    "check:all": "pnpm typecheck && pnpm lint && pnpm test:unit && pnpm build",
    "deploy:staging": "vercel --target preview",
    "deploy:production": "vercel --prod",
    "prepare": "husky install",
    "audit:security": "pnpm audit --audit-level high",
    "audit:lighthouse": "lighthouse http://localhost:3001 --output json --output-path lighthouse.json",
    "clean": "rm -rf .next out dist"
  }
}
```

## 🎯 Success Metrics

### Automation Effectiveness

- **Build Success Rate**: >95% first-time success
- **Test Coverage**: >80% maintained automatically
- **Performance Scores**: >90% Lighthouse scores
- **Security**: Zero high-severity vulnerabilities

### Time Savings

- **Developer**: 2 hours/day saved on manual tasks
- **Central Team**: 1 hour/day saved on reviews
- **Deployment**: 18 minutes saved per deployment
- **Bug Detection**: 80% faster issue identification

### Quality Improvements

- **Consistent Code**: 100% formatted correctly
- **Fewer Bugs**: 60% reduction in production issues
- **Better Performance**: Consistent performance metrics
- **Security**: Automated vulnerability detection

This automation pipeline ensures high-quality code reaches production while minimizing human time spent on routine checks.
