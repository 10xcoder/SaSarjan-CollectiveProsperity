# GitHub Automation & Sprint Integration Guide

**Last Updated**: 05-Jul-2025 (Saturday, 20:30 IST)  
**Purpose**: Complete guide to GitHub automation, branching strategy, and sprint/todo integration  
**Scope**: All teams (🤖 Claude AI, 👥 Central Team, 🌍 Independent Developers)

## 🎯 Overview

Our GitHub automation system provides comprehensive CI/CD, quality gates, and sprint integration to support our 3-team development model with automatic deployment and quality assurance.

## 📋 Workflow Summary

| Workflow          | Trigger         | Purpose                            | Duration  |
| ----------------- | --------------- | ---------------------------------- | --------- |
| **CI**            | PR/Push to main | Lint, test, build                  | 8-12 min  |
| **Quality Gates** | PR/Push         | Coverage, security, performance    | 15-20 min |
| **Deploy**        | Push to main    | Preview/Production deployment      | 5-8 min   |
| **Release**       | Push to main    | Semantic versioning & release      | 10-15 min |
| **Scheduled**     | Daily/Weekly    | Security scans, dependency updates | 5-30 min  |

## 🔀 Branching Strategy

### **Main Branches**

```
main (production)
├── develop (staging) [optional]
├── feature/sprint-X-description
├── fix/issue-number-description
├── hotfix/critical-issue
└── release/vX.Y.Z
```

### **Branch Naming Conventions**

```bash
# Feature branches (sprint work)
feature/sprint-2-user-profile-dashboard
feature/sprint-2-payment-integration

# Bug fixes
fix/123-session-timeout-issue
fix/456-mobile-responsive-layout

# Hotfixes (production issues)
hotfix/critical-auth-vulnerability
hotfix/database-connection-error

# Release branches
release/v1.2.0
release/v1.2.1-hotfix

# Sprint branches (for sprint-specific work)
sprint/week-2-july-2025
```

### **Branch Protection Rules**

#### **Main Branch**

```yaml
Protection Rules:
  - Require PR reviews: 2 reviewers
  - Dismiss stale reviews: true
  - Require status checks: all CI workflows
  - Require up-to-date branches: true
  - Restrict force pushes: true
  - Restrict deletions: true
  - Lock branch: false (allow admins)
```

#### **Develop Branch** (if used)

```yaml
Protection Rules:
  - Require PR reviews: 1 reviewer
  - Require status checks: CI workflow
  - Allow force pushes: false
```

## 🤖 Automated Workflows

### **1. Continuous Integration (`ci.yml`)**

**Triggers:**

- Push to `main`
- Pull requests to `main`

**Jobs:**

- **Lint**: ESLint, Prettier, TypeScript
- **Test**: Unit tests, E2E tests with Playwright
- **Build**: Multi-app builds with artifact upload

**Sprint Integration:**

- Validates commit message format
- Checks for sprint/todo references
- Reports test coverage for sprint metrics

### **2. Quality Gates (`quality-gates.yml`)**

**Triggers:**

- Pull requests to `main`/`develop`
- Push to `main`/`develop`

**Jobs:**

- **Commit Validation**: Conventional commits, sprint integration
- **Code Coverage**: 80% threshold, Codecov integration
- **Security**: Trivy, npm audit, Snyk scanning
- **Bundle Analysis**: Size limits, performance impact
- **Performance**: Lighthouse audits (85+ scores)
- **Accessibility**: A11y testing, WCAG compliance
- **Code Quality**: ESLint metrics, naming conventions

**Quality Thresholds:**

```yaml
Code Coverage: >80
Performance Score: >85
Accessibility Score: >95
Bundle Size: <5MB (main), <3MB (other apps)
Security: No HIGH/CRITICAL vulnerabilities
```

### **3. Deployment (`deploy.yml`)**

**Triggers:**

- Push to `main` (production)
- Pull requests (preview)

**Jobs:**

- **Preview Deploy**: Vercel preview for PR review
- **Production Deploy**: Automatic main branch deployment
- **Database Migration**: Automated schema updates

**Sprint Integration:**

- Links deployments to sprint goals
- Updates sprint logs with deployment status
- Tracks deployment metrics for sprint reviews

### **4. Release Automation (`release.yml`)**

**Triggers:**

- Push to `main` with releasable commits
- Manual trigger with release type selection

**Jobs:**

- **Commit Analysis**: Determines release type (patch/minor/major)
- **Version Bump**: Updates package.json versions
- **Changelog**: Generates conventional changelog
- **Git Tag**: Creates release tags
- **GitHub Release**: Automated release notes
- **Sprint Documentation**: Updates sprint logs

**Release Types:**

```bash
fix: patch release (1.0.0 → 1.0.1)
feat: minor release (1.0.0 → 1.1.0)
BREAKING CHANGE: major release (1.0.0 → 2.0.0)
```

### **5. Scheduled Tasks (`scheduled.yml`)**

**Daily (2 AM UTC):**

- Security vulnerability scans
- Database backups
- Performance audits

**Weekly (Sunday 3 AM UTC):**

- Dependency updates with automated PRs
- Comprehensive security reviews

## 📝 Commit Message Integration

### **Conventional Commit Format**

```
<type>(<scope>): <description>

<body>

Sprint: Week X (YYYY-MM-DD to YYYY-MM-DD)
Todo: todo-123, todo-456
Fixes: blocker-789
Co-authored-by: Name <email@example.com>
```

### **Commit Types**

```bash
feat:      ✨ New feature
fix:       🐛 Bug fix
docs:      📚 Documentation
style:     💄 Formatting
refactor:  ♻️ Code refactoring
perf:      ⚡ Performance improvement
test:      🧪 Tests
build:     🔧 Build system
ci:        👷 CI/CD changes
chore:     🔨 Maintenance
sprint:    🎯 Sprint planning
todo:      ✅ Todo completion
blocker:   🚨 Sprint blocker fix
automation:🤖 Automation improvements
```

### **Sprint Integration Examples**

```bash
# Feature with sprint tracking
feat(web): add user profile dashboard

Implement comprehensive user profile with edit capabilities,
avatar upload, and preferences management.

Sprint: Week 2 (2025-07-08 to 2025-07-14)
Todo: todo-123, todo-124
Closes #45

# Bug fix with blocker resolution
fix(auth): resolve session timeout issue

Users were being logged out unexpectedly due to
incorrect token refresh logic.

Sprint: Week 2 (2025-07-08 to 2025-07-14)
Todo: todo-125
Fixes: blocker-12
Closes #78

# Sprint completion
sprint: complete week 2 deliverables

All sprint goals achieved:
- User profile system ✅
- Payment integration ✅
- Mobile responsive design ✅

Sprint: Week 2 (2025-07-08 to 2025-07-14)
Todos: todo-123, todo-124, todo-125, todo-126
```

## 🔧 Git Hooks Integration

### **Pre-commit Hook**

```bash
# .husky/pre-commit
npx lint-staged          # Format and lint staged files
```

### **Commit-msg Hook**

```bash
# .husky/commit-msg
npx commitlint --edit    # Validate commit message format
node .husky/scripts/validate-commit-integration.js  # Sprint/todo validation
```

### **Validation Rules**

- **Conventional format**: Enforced via commitlint
- **Sprint integration**: Warns if missing for development commits
- **Todo format**: Validates todo-123 format
- **Scope validation**: Checks against valid app/component scopes
- **Prosperity alignment**: Suggests for large features

## 📊 Sprint & Todo Integration

### **Sprint Tracking in Commits**

```bash
# Required for development commits
Sprint: Week X (YYYY-MM-DD to YYYY-MM-DD)

# Multiple todo items
Todo: todo-123, todo-456, todo-789

# Blocker resolution
Fixes: blocker-12, BLOCKER-34

# Co-authorship (for pair programming)
Co-authored-by: Claude <noreply@anthropic.com>
```

### **Automated Sprint Updates**

- **PR Creation**: Links to sprint goals and todos
- **Deployment**: Updates sprint logs with deployment status
- **Release**: Adds release information to sprint documentation
- **Quality Metrics**: Tracks coverage, performance for sprint reviews

### **Todo Item Integration**

- **Commit Linking**: Associates commits with specific todo items
- **Progress Tracking**: Monitors todo completion via commits
- **Blocker Resolution**: Tracks blocker fixes and sprint impact
- **Sprint Reporting**: Generates todo completion metrics

## 🚨 Emergency Procedures

### **Hotfix Process**

```bash
# 1. Create hotfix branch from main
git checkout main
git pull origin main
git checkout -b hotfix/critical-issue-description

# 2. Make fix with proper commit message
git commit -m "fix: resolve critical production issue

Sprint: Current week
Fixes: blocker-999
Priority: CRITICAL"

# 3. Push and create PR
git push origin hotfix/critical-issue-description

# 4. Emergency review and merge
# 5. Automatic deployment to production
# 6. Post-deployment verification
```

### **Rollback Process**

```bash
# 1. Identify last good release
git tag --sort=-version:refname | head -5

# 2. Create rollback PR
git checkout main
git revert HEAD --no-edit
git commit -m "revert: rollback to v1.2.3

Sprint: Current week
Priority: CRITICAL
Reason: Production issue"

# 3. Emergency deployment
```

### **Pipeline Failure Recovery**

```bash
# 1. Check workflow status
gh run list --limit 10

# 2. Re-run failed workflow
gh run rerun <run-id>

# 3. Skip CI for emergency (use sparingly)
git commit -m "fix: emergency hotfix [skip ci]"
```

## 📈 Monitoring & Metrics

### **Quality Metrics Dashboard**

- **Build Success Rate**: Target >95%
- **Deployment Frequency**: Multiple times daily
- **Lead Time**: Commit to production <2 hours
- **Mean Time to Recovery**: <30 minutes
- **Code Coverage**: >80% maintained

### **Sprint Metrics Integration**

- **Velocity Tracking**: Story points via commit analysis
- **Burndown Charts**: Todo completion via Git history
- **Quality Trends**: Coverage, performance over time
- **Deployment Success**: Sprint deliverable tracking

### **Automated Reporting**

- **Daily**: Deployment status, quality metrics
- **Weekly**: Sprint progress, todo completion rates
- **Monthly**: Trend analysis, process improvements

## 🎯 Team-Specific Workflows

### **🤖 Claude AI Team**

```bash
# Always use conventional commits
git commit -m "feat(web): implement user dashboard

Generated with Plop generators and follows all
naming conventions and quality standards.

Sprint: Week 2 (2025-07-08 to 2025-07-14)
Todo: todo-123

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

### **👥 Central Team**

```bash
# Architecture and infrastructure commits
git commit -m "build: upgrade database schema

Add new tables for multi-app user management
and improve performance with indexes.

Sprint: Week 2 (2025-07-08 to 2025-07-14)
Todo: todo-124
Breaking-Change: Requires migration"

# Code review commits
git commit -m "fix: address code review feedback

Improve error handling and add input validation
based on security review comments.

Sprint: Week 2 (2025-07-08 to 2025-07-14)
Todo: todo-125"
```

### **🌍 Independent Developers**

```bash
# Community module commits
git commit -m "feat(community): add event management module

New module for community event planning with
calendar integration and RSVP management.

Sprint: Week 2 (2025-07-08 to 2025-07-14)
Todo: community-todo-45
Module: @sasarjan/event-manager"
```

## 🔒 Security Integration

### **Automated Security Scanning**

- **Dependencies**: Daily vulnerability scans
- **Code**: SAST scanning on every PR
- **Infrastructure**: Container security scanning
- **Secrets**: Automated secret detection

### **Security Gates**

- **High/Critical Vulnerabilities**: Block merges
- **Dependency Updates**: Automated weekly PRs
- **Security Advisories**: Immediate notifications
- **Compliance**: SOC2, GDPR alignment checks

## 🚀 Advanced Features

### **Multi-App Coordination**

- **Parallel Builds**: All apps built simultaneously
- **Shared Dependencies**: Coordinated package updates
- **Cross-App Testing**: Integration test suites
- **Synchronized Deployments**: All apps deploy together

### **AI-Powered Automation**

- **Code Review**: AI-assisted PR reviews
- **Test Generation**: Automatic test case creation
- **Documentation**: Auto-generated API docs
- **Release Notes**: AI-enhanced release descriptions

### **Performance Optimization**

- **Bundle Analysis**: Automated size optimization
- **Cache Strategy**: Intelligent cache invalidation
- **CDN Management**: Automatic asset optimization
- **Database Optimization**: Query performance monitoring

## 🛠️ Setup Instructions

### **Initial Repository Setup**

```bash
# 1. Clone and setup
git clone <repository-url>
cd SaSarjan-AppStore

# 2. Install dependencies
pnpm install

# 3. Setup Git hooks
npx husky

# 4. Configure commit template
git config commit.template .gitmessage

# 5. Setup environment
cp .env.example .env.local
```

### **Team Onboarding**

```bash
# 1. Verify workflow permissions
gh workflow list

# 2. Test commit format
git commit -m "test: verify setup

Sprint: Week X
Todo: onboarding-test"

# 3. Create test PR
git push origin -u feature/onboarding-test
gh pr create
```

## 📚 Best Practices

### **Commit Frequency**

- **Feature Work**: Commit every 2-4 hours
- **Bug Fixes**: Commit immediately after fix
- **Refactoring**: Small, focused commits
- **Documentation**: Separate from code commits

### **PR Management**

- **Size**: <500 lines changed
- **Focus**: Single feature or fix
- **Description**: Use provided template
- **Review**: Address all feedback promptly

### **Sprint Alignment**

- **Daily**: Update todos in commits
- **Weekly**: Sprint review integration
- **Blockers**: Immediate escalation via issues
- **Completion**: Proper todo marking

## 🔗 Related Documentation

- [File Naming Conventions](../teams/developers/shared/file-naming-conventions.md)
- [Plop Generator Guide](../teams/developers/shared/plop-generator-guide.md)
- [Sprint Management](../strategic/sprints.md)
- [Quality Standards](./testing-deployment-pipeline.md)

---

**Remember**: Our GitHub automation supports collective prosperity by ensuring high-quality, secure, and efficient development processes that scale with our growing team! 🚀
