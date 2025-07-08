# Central Team Setup Checklist - TalentExcel Launch

**Target**: Prepare infrastructure for 3 fresher developers  
**Timeline**: 3 days before developer onboarding  
**Owner**: Central Team (4-6 senior developers)  
**Created**: July 5, 2025

## 🎯 Overview

This checklist ensures all infrastructure, security, and processes are ready before fresher developers start on TalentExcel.

## Day 1: Core Infrastructure Setup

### 1. Repository & Version Control

- [ ] **Create TalentExcel GitHub Repository**

  ```bash
  # Create new repository: sasarjan/talentexcel-app
  # Initialize with:
  # - README.md
  # - .gitignore (Node.js template)
  # - MIT License
  # - main branch as default
  ```

- [ ] **Clone and Setup Monorepo Code**

  ```bash
  # Copy TalentExcel app from main monorepo
  cp -r SaSarjan-AppStore/apps/talentexcel/* talentexcel-app/

  # Update package.json for standalone repo
  # Remove workspace dependencies
  # Add individual npm packages
  ```

- [ ] **Branch Protection Rules**
  ```yaml
  # GitHub Settings → Branches → Add rule for 'main'
  - Require pull request reviews before merging: ✓
  - Require status checks to pass: ✓
  - Require up-to-date branches: ✓
  - Include administrators: ✓
  - Allow force pushes: ✗
  - Allow deletions: ✗
  ```

### 2. Environment & Secrets Management

- [ ] **Supabase Project Setup**

  ```bash
  # Create new Supabase project: talentexcel-prod
  # Copy schema from main project
  # Set up Row Level Security (RLS)
  # Create API keys for development and production
  ```

- [ ] **Environment Variables**

  ```bash
  # Create .env.example with all required variables
  NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
  SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
  NEXT_PUBLIC_APP_URL=https://talentexcel.com
  NEXT_PUBLIC_VERCEL_URL=auto_generated
  RAZORPAY_KEY_ID=your_razorpay_key
  RAZORPAY_KEY_SECRET=your_razorpay_secret
  NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_token
  ```

- [ ] **GitHub Secrets Configuration**
  ```yaml
  # Repository Settings → Secrets and variables → Actions
  SUPABASE_ACCESS_TOKEN: [from Supabase dashboard]
  VERCEL_TOKEN: [from Vercel account]
  VERCEL_ORG_ID: [from Vercel team settings]
  VERCEL_PROJECT_ID: [will be generated after Vercel setup]
  ```

### 3. Deployment Infrastructure

- [ ] **Vercel Project Setup**

  ```bash
  # 1. Connect GitHub repo to Vercel
  # 2. Configure build settings:
  Framework: Next.js
  Build Command: pnpm build
  Output Directory: .next
  Install Command: pnpm install

  # 3. Set up domains:
  Production: talentexcel.com
  Preview: talentexcel-preview.vercel.app
  ```

- [ ] **Domain Configuration**
  ```dns
  # Configure DNS for talentexcel.com
  A Record: @  → Vercel IP
  CNAME: www → talentexcel.com
  ```

### 4. Database Setup

- [ ] **TalentExcel Schema Creation**

  ```sql
  -- Core tables for TalentExcel
  CREATE TABLE internships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    description TEXT,
    location TEXT,
    type TEXT CHECK (type IN ('remote', 'onsite', 'hybrid')),
    stipend_min INTEGER,
    stipend_max INTEGER,
    duration_months INTEGER,
    requirements TEXT[],
    skills_required TEXT[],
    application_deadline TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'closed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  CREATE TABLE fellowship_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    organization TEXT NOT NULL,
    description TEXT,
    duration_months INTEGER,
    stipend_amount INTEGER,
    application_deadline TIMESTAMP WITH TIME ZONE,
    program_start_date TIMESTAMP WITH TIME ZONE,
    eligibility_criteria TEXT[],
    benefits TEXT[],
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  CREATE TABLE learning_paths (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    estimated_duration_hours INTEGER,
    skills_covered TEXT[],
    prerequisites TEXT[],
    created_by UUID REFERENCES profiles(id),
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Enable RLS
  ALTER TABLE internships ENABLE ROW LEVEL SECURITY;
  ALTER TABLE fellowship_programs ENABLE ROW LEVEL SECURITY;
  ALTER TABLE learning_paths ENABLE ROW LEVEL SECURITY;

  -- Create policies
  CREATE POLICY "Anyone can view active internships" ON internships
    FOR SELECT USING (status = 'active');

  CREATE POLICY "Anyone can view fellowship programs" ON fellowship_programs
    FOR SELECT USING (true);

  CREATE POLICY "Anyone can view published learning paths" ON learning_paths
    FOR SELECT USING (is_published = true);
  ```

- [ ] **Seed Data Creation**

  ```sql
  -- Insert sample data for development
  INSERT INTO internships (title, company, description, location, type, stipend_min, stipend_max, duration_months) VALUES
  ('Frontend Developer Intern', 'TechCorp', 'Build user interfaces with React', 'Bangalore', 'hybrid', 15000, 25000, 6),
  ('Data Science Intern', 'DataFlow', 'Analyze user behavior patterns', 'Remote', 'remote', 20000, 30000, 4),
  ('UX Design Intern', 'DesignHub', 'Create intuitive user experiences', 'Mumbai', 'onsite', 18000, 28000, 3);

  INSERT INTO fellowship_programs (title, organization, description, duration_months, stipend_amount) VALUES
  ('Social Impact Fellowship', 'Change Foundation', 'Work on projects that create social change', 12, 50000),
  ('Tech for Good Fellowship', 'Innovation Lab', 'Build technology solutions for social problems', 6, 35000);
  ```

## Day 2: Development Environment & CI/CD

### 5. GitHub Actions Setup

- [ ] **Test Pipeline Configuration**

  ```yaml
  # .github/workflows/test.yml
  name: Test TalentExcel

  on:
    push:
      branches: [main]
    pull_request:
      branches: [main]

  jobs:
    test:
      runs-on: ubuntu-latest

      steps:
        - name: Checkout code
          uses: actions/checkout@v4

        - name: Setup Node.js
          uses: actions/setup-node@v4
          with:
            node-version: '22'
            cache: 'pnpm'

        - name: Install pnpm
          run: npm install -g pnpm

        - name: Install dependencies
          run: pnpm install

        - name: Type check
          run: pnpm typecheck

        - name: Lint
          run: pnpm lint

        - name: Build
          run: pnpm build
          env:
            NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
            NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
  ```

- [ ] **Deploy to Staging Pipeline**

  ```yaml
  # .github/workflows/deploy-staging.yml
  name: Deploy to Staging

  on:
    pull_request:
      branches: [main]

  jobs:
    deploy:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        - name: Deploy to Vercel Preview
          uses: amondnet/vercel-action@v25
          with:
            vercel-token: ${{ secrets.VERCEL_TOKEN }}
            vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
            vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
            scope: ${{ secrets.VERCEL_ORG_ID }}
            comment: true
  ```

- [ ] **Deploy to Production Pipeline**

  ```yaml
  # .github/workflows/deploy-production.yml
  name: Deploy to Production

  on:
    push:
      branches: [main]

  jobs:
    deploy:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        - name: Deploy to Vercel Production
          uses: amondnet/vercel-action@v25
          with:
            vercel-token: ${{ secrets.VERCEL_TOKEN }}
            vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
            vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
            vercel-args: '--prod'
            scope: ${{ secrets.VERCEL_ORG_ID }}
  ```

### 6. Code Quality & Security

- [ ] **ESLint Configuration**

  ```json
  // .eslintrc.json
  {
    "extends": ["next/core-web-vitals", "next/typescript"],
    "rules": {
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/no-explicit-any": "warn",
      "react/jsx-key": "error",
      "react-hooks/exhaustive-deps": "warn"
    }
  }
  ```

- [ ] **Prettier Configuration**

  ```json
  // .prettierrc
  {
    "semi": false,
    "trailingComma": "es5",
    "singleQuote": true,
    "tabWidth": 2,
    "useTabs": false,
    "printWidth": 80,
    "bracketSpacing": true,
    "arrowParens": "avoid"
  }
  ```

- [ ] **Security Scanning Setup**

  ```yaml
  # .github/workflows/security.yml
  name: Security Scan

  on:
    push:
      branches: [main]
    pull_request:
      branches: [main]

  jobs:
    security:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        - name: Run Snyk to check for vulnerabilities
          uses: snyk/actions/node@master
          env:
            SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
          with:
            args: --severity-threshold=high
  ```

### 7. Monitoring & Analytics Setup

- [ ] **Sentry Error Tracking**

  ```bash
  # 1. Create Sentry project for TalentExcel
  # 2. Add Sentry configuration to Next.js
  # 3. Set up error reporting
  # 4. Configure performance monitoring
  ```

- [ ] **Vercel Analytics**

  ```typescript
  // src/app/layout.tsx
  import { Analytics } from '@vercel/analytics/react'
  import { SpeedInsights } from '@vercel/speed-insights/next'

  export default function RootLayout({ children }) {
    return (
      <html>
        <body>
          {children}
          <Analytics />
          <SpeedInsights />
        </body>
      </html>
    )
  }
  ```

- [ ] **PostHog Product Analytics**
  ```bash
  # 1. Create PostHog project
  # 2. Install PostHog SDK
  # 3. Configure event tracking
  # 4. Set up user journey analysis
  ```

## Day 3: Team Setup & Documentation

### 8. Communication Channels

- [ ] **Slack Workspace Setup**

  ```yaml
  Channels to create:
    -  #talentexcel-dev (main development channel)
    -  #talentexcel-alerts (automated notifications)
    -  #talentexcel-releases (deployment notifications)
    -  #talentexcel-general (general discussion)
  ```

- [ ] **GitHub Notifications**
  ```yaml
  # Repository Settings → Notifications
  - Email notifications for: All activity
  - Slack integration for: PRs, issues, releases
  - Auto-assign reviewers: Central Team members
  ```

### 9. Code Review Process

- [ ] **PR Template Creation**

  ```markdown
  <!-- .github/pull_request_template.md -->

  ## 🎯 What does this PR do?

  Brief description of the feature/fix

  ## 📷 Screenshots

  [Add screenshots showing your feature on desktop and mobile]

  ## ✅ Testing Checklist

  - [ ] Tested on desktop Chrome
  - [ ] Tested on mobile (responsive)
  - [ ] Loading states work
  - [ ] Error handling works
  - [ ] TypeScript compiles
  - [ ] Linting passes

  ## 🔗 Related Issue

  Fixes #[issue-number]

  ## 💭 Notes for Reviewers

  Any special instructions or areas to focus on during review
  ```

- [ ] **Review Assignment Rules**

  ```yaml
  # .github/CODEOWNERS
  # All files require review from Central Team
  * @central-team

  # Specific files require additional review
  /src/lib/auth/* @security-team
  /src/app/api/* @backend-team
  /.github/workflows/* @devops-team
  ```

### 10. Documentation Setup

- [ ] **Developer README**

  ```markdown
  # TalentExcel - Career & Education Platform

  ## Quick Start

  1. Clone repository
  2. Install dependencies: `pnpm install`
  3. Copy environment: `cp .env.example .env.local`
  4. Start development: `pnpm dev`

  ## Tech Stack

  - Next.js 15 (App Router)
  - TypeScript
  - Tailwind CSS
  - Supabase
  - Vercel

  ## Scripts

  - `pnpm dev` - Start development server
  - `pnpm build` - Build for production
  - `pnpm lint` - Run linting
  - `pnpm typecheck` - TypeScript checking
  ```

- [ ] **Architecture Documentation**

  ```markdown
  # Project Structure

  src/
  ├── app/ # Next.js App Router pages
  ├── components/ # Reusable React components
  │ ├── ui/ # Basic UI components
  │ └── features/ # Feature-specific components
  ├── lib/ # Utility functions and configurations
  ├── types/ # TypeScript type definitions
  └── styles/ # Global styles
  ```

### 11. Issue Templates & Project Management

- [ ] **GitHub Issue Templates**

  ```yaml
  # .github/ISSUE_TEMPLATE/feature.yml
  name: Feature Request
  description: Request a new feature for TalentExcel
  labels: ['enhancement', 'needs-triage']
  body:
    - type: textarea
      attributes:
        label: Feature Description
        description: Describe the feature you'd like to see
    - type: textarea
      attributes:
        label: Acceptance Criteria
        description: What needs to be true for this feature to be complete?
  ```

- [ ] **Project Board Setup**
  ```yaml
  # GitHub Projects → New project
  Columns:
    - 📋 Backlog (new issues)
    - 🏗️ In Progress (assigned to developers)
    - 👀 Code Review (PRs pending review)
    - ✅ Done (completed this sprint)
  ```

## Pre-Launch Verification Checklist

### Technical Verification

- [ ] **Repository Access**
  - All Central Team members have admin access
  - Fresher developers invited as contributors
  - Branch protection rules active

- [ ] **Build & Deployment**
  - Production build succeeds
  - Staging environment accessible
  - Domain pointing to correct deployment
  - SSL certificate active

- [ ] **Database & APIs**
  - All environment variables configured
  - Database connection working
  - Sample data loaded
  - API routes responding correctly

### Security Verification

- [ ] **Access Control**
  - No secrets in repository
  - Environment variables properly secured
  - Supabase RLS policies active
  - API rate limiting configured

- [ ] **Code Quality**
  - ESLint rules enforced
  - TypeScript strict mode enabled
  - Security scanning active
  - No high-severity vulnerabilities

### Process Verification

- [ ] **Communication Setup**
  - Slack channels created and configured
  - Notification rules set up
  - Team members added to channels

- [ ] **Code Review Process**
  - PR templates working
  - Auto-assign reviewers active
  - Status checks required
  - Merge protection enabled

## Day 4: Team Onboarding

### 12. Fresher Developer Accounts

- [ ] **GitHub Access**

  ```bash
  # Send invitations to GitHub repository
  # Role: Write access (not Admin)
  # Require 2FA enabled
  ```

- [ ] **Development Environment**
  ```bash
  # Provide each developer:
  # - Repository clone URL
  # - Environment variables file
  # - Slack workspace invitation
  # - Vercel account access (optional)
  ```

### 13. First Day Setup Session

- [ ] **Kick-off Meeting** (2 hours)

  ```yaml
  Agenda:
    - Project overview and goals (30 min)
    - Tech stack walkthrough (30 min)
    - Development workflow explanation (30 min)
    - Environment setup (30 min)
  ```

- [ ] **Pair Programming Session**
  ```yaml
  # Each fresher paired with Central Team member
  # Build one simple feature together
  # Demonstrate full workflow from code to deployment
  # Duration: 2-3 hours
  ```

## Success Metrics

### Week 1 Targets

- [ ] All 3 developers successfully set up environment
- [ ] First PRs submitted and reviewed
- [ ] No security incidents
- [ ] All builds passing

### Week 2-3 Targets

- [ ] 10+ features implemented
- [ ] <24 hour PR review turnaround
- [ ] 90%+ test coverage
- [ ] Zero production bugs

### Month 1 Target

- [ ] TalentExcel MVP launched
- [ ] 100+ users onboarded
- [ ] Process documented for next teams
- [ ] Team ready for independent development

## Emergency Procedures

### If Developer Environment Fails

1. Check #talentexcel-dev Slack for known issues
2. Central Team member available within 2 hours
3. Backup development environment on Vercel

### If Production Deployment Fails

1. Automatic rollback to previous version
2. Alert Central Team immediately
3. Debug in staging environment
4. Manual deployment if needed

### If Security Issue Detected

1. Immediately revoke compromised credentials
2. Alert security team
3. Audit all recent commits
4. Deploy security patch within 4 hours

---

**Completion Timeline**: 3 days  
**Next Step**: Send developer onboarding guide to TalentExcel team  
**Review**: Central Team lead signs off on all items before developer start date
