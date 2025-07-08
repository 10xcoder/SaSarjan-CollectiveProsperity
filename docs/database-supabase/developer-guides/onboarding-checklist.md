# Developer Onboarding Checklist

**Last Updated**: 06-Jul-2025 (Sunday, 00:15 IST)  
**Purpose**: Complete onboarding process for new developers joining SaSarjan database team  
**Time Required**: 2-4 hours depending on experience level

## 🎯 Quick Start Overview

### **5-Minute Quick Setup** (For Experienced Developers)

```bash
# 1. Clone repository
git clone https://github.com/sasarjan/sasarjan-appstore.git
cd sasarjan-appstore

# 2. Install dependencies
pnpm install

# 3. Setup local database
npm install supabase -g
supabase start
supabase db reset

# 4. Start development
pnpm dev:web
```

### **Complete Onboarding Process** (For All Developers)

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Developer Onboarding Journey                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  PREPARATION           SETUP               VERIFICATION             │
│  ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐    │
│  │ Account Setup   │──▶│ Local Dev Env   │──▶│ Access Test     │    │
│  │ • GitHub        │   │ • Supabase CLI  │   │ • Database      │    │
│  │ • Supabase      │   │ • Environment   │   │ • Applications  │    │
│  │ • Slack/Discord │   │ • Applications  │   │ • Team Tools    │    │
│  └─────────────────┘   └─────────────────┘   └─────────────────┘    │
│           │                      │                      │           │
│           ▼                      ▼                      ▼           │
│  ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐    │
│  │ Training        │   │ First Task      │   │ Team Integration│    │
│  │ • Security      │   │ • Simple PR     │   │ • Code Review   │    │
│  │ • Workflows     │   │ • Migration     │   │ • Mentorship    │    │
│  │ • Best Practice │   │ • Documentation │   │ • Feedback      │    │
│  └─────────────────┘   └─────────────────┘   └─────────────────┘    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📋 Pre-Onboarding Requirements

### **Before Your First Day**

#### **Required Accounts** (Send invitation links to new developer)

```bash
□ GitHub account with access to sasarjan-appstore repository
□ Supabase account (will be added to organization)
□ Company email address (@sasarjan.com)
□ Slack workspace access (for team communication)
□ Discord server access (for developer community)
```

#### **Hardware/Software Requirements**

```bash
□ Development machine (Mac/Linux preferred, Windows with WSL2)
□ Minimum 16GB RAM, 512GB SSD recommended
□ Node.js 22+ installed
□ Git configured with company email
□ VS Code or preferred IDE
□ Terminal/command line comfort
```

#### **Knowledge Prerequisites**

```bash
# Required Knowledge:
□ JavaScript/TypeScript fundamentals
□ React.js and Next.js basics
□ SQL and database concepts
□ Git version control
□ Command line usage

# Nice to Have:
□ Supabase/PostgreSQL experience
□ Row Level Security (RLS) concepts
□ Tailwind CSS familiarity
□ CI/CD pipeline understanding
```

---

## 🚀 Day 1: Environment Setup

### **Step 1: Account Access Verification** (30 minutes)

#### **GitHub Repository Access**

```bash
# Test repository access
git clone https://github.com/sasarjan/sasarjan-appstore.git
cd sasarjan-appstore

# Verify you can see all directories
ls -la  # Should see apps/, packages/, docs/, supabase/, etc.

# Test branch creation
git checkout -b test/onboarding-$(date +%Y%m%d)
git push -u origin test/onboarding-$(date +%Y%m%d)
# Clean up: git push origin --delete test/onboarding-$(date +%Y%m%d)
```

#### **Supabase Organization Access**

```bash
# Install Supabase CLI
npm install supabase -g

# Login to Supabase
supabase login

# List accessible projects (should see staging project for Senior/Admin)
supabase projects list

# Verify your access level matches your role:
# Junior: No projects listed (local development only)
# Senior: sasarjan-staging project visible
# Admin: Both sasarjan-staging and sasarjan-prod visible
```

### **Step 2: Local Development Environment** (60 minutes)

#### **Project Dependencies**

```bash
# Navigate to project directory
cd sasarjan-appstore

# Install dependencies (may take 5-10 minutes)
pnpm install

# Verify installation
pnpm --version  # Should be 9.15.0+
node --version  # Should be 22.0.0+
```

#### **Environment Configuration**

```bash
# Copy environment template
cp .env.example .env.local

# Configure local environment variables
# Edit .env.local with your preferred editor
nano .env.local  # or code .env.local
```

**Required Environment Variables (Junior Developers):**

```bash
# Local Development Only
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  # From supabase start
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  # From supabase start

# Email Service (for local testing)
EMAIL_PROVIDER=resend
FROM_EMAIL=test@example.com
FROM_NAME=SaSarjan Test

# Node Environment
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Additional Variables (Senior/Admin Developers):**

```bash
# Staging Environment Access
STAGING_SUPABASE_URL=https://[project-ref].supabase.co
STAGING_SUPABASE_ANON_KEY=[provided-by-admin]
STAGING_SERVICE_ROLE_KEY=[provided-by-admin]  # Senior+ only

# Production Environment Access (Admin only)
PRODUCTION_SUPABASE_URL=https://[project-ref].supabase.co
PRODUCTION_SUPABASE_ANON_KEY=[provided-by-admin]
PRODUCTION_SERVICE_ROLE_KEY=[provided-by-admin]  # Admin only
```

#### **Local Database Setup**

```bash
# Initialize and start local Supabase
supabase init  # If not already initialized
supabase start

# This will output local URLs and keys - update your .env.local

# Pull latest schema from staging (Senior/Admin) or reset with migrations
# For Junior developers (no staging access):
supabase db reset

# For Senior/Admin developers (with staging access):
supabase link --project-ref [staging-project-ref]
supabase db pull
supabase db reset  # Apply pulled schema locally

# Generate TypeScript types
supabase gen types typescript --local > packages/database/types/database.ts
```

### **Step 3: Application Startup Verification** (30 minutes)

#### **Start All Applications**

```bash
# Start all development servers
pnpm dev:all

# This should start:
# - Main App Store (http://localhost:3000)
# - TalentExcel (http://localhost:3001)
# - SevaPremi (http://localhost:3002)
# - 10xGrowth (http://localhost:3003)
# - Admin Dashboard (http://localhost:3004)

# Verify each application loads without errors
```

#### **Database Connection Test**

```bash
# Test database connection
pnpm db:test  # If this script exists

# Or manually test with psql
psql postgresql://postgres:postgres@localhost:54322/postgres

# Run a simple query to verify schema
\dt public.*  # List all tables
SELECT COUNT(*) FROM public.users;  # Should work even if empty
```

#### **Local Environment Health Check**

```bash
# Run health check script
npm run check:environment  # If available

# Manual verification checklist:
□ All 5 applications start without errors
□ Database connection successful
□ Supabase Studio accessible (http://localhost:54323)
□ Email testing interface accessible (http://localhost:54324)
□ No error messages in terminal output
```

---

## 🎓 Day 2: Training and Documentation

### **Step 1: Security Training** (60 minutes)

#### **Database Security Fundamentals**

```bash
# Read required documentation
1. Database Environment Strategy
   📖 docs/database-supabase/environments/environment-strategy.md

2. Team Access Control Matrix
   📖 docs/database-supabase/access-control/team-access-matrix.md

3. Security Policies
   📖 docs/database-supabase/access-control/security-policies.md
```

#### **Practical Security Exercises**

```bash
# Exercise 1: Test RLS policies locally
psql postgresql://postgres:postgres@localhost:54322/postgres

-- Try to access data without authentication (should be denied)
SELECT * FROM public.users;

-- Enable RLS bypass for testing (local only)
SET row_security = off;
SELECT COUNT(*) FROM public.users;
SET row_security = on;

# Exercise 2: Understand environment separation
echo "NEVER put production data in migrations!"
echo "Schema only, no user data, no secrets!"

# Exercise 3: Practice secure migration creation
supabase migration new security_test_$(date +%s)
# Edit migration to add a table with proper RLS policies
```

#### **Security Quiz** (Must Pass)

```bash
# Take the security knowledge quiz:
# 1. Can junior developers access production data? (No)
# 2. What goes in migrations? (Schema only, never data)
# 3. How do we sync environments? (Migrations only)
# 4. What happens if you leak credentials? (Immediate rotation)
# 5. Who can deploy to production? (Admin level only)

# Quiz location: docs/database-supabase/security-quiz.md
```

### **Step 2: Development Workflow Training** (90 minutes)

#### **Migration Workflow Deep Dive**

```bash
# Read migration documentation
📖 docs/database-supabase/migrations/migration-workflow.md

# Practice creating your first migration
supabase migration new onboarding_test_table

# Edit the migration file with proper structure:
# - Table creation
# - Indexes
# - RLS policies
# - Comments
# - No data inserts!

# Test migration locally
supabase db reset
```

#### **Code Review Process**

```bash
# Create a practice pull request
git checkout -b onboarding/first-migration
git add supabase/migrations/
git commit -m "feat: add onboarding test table

This migration adds a simple test table to practice
the migration workflow during developer onboarding.

- Adds test_table with basic structure
- Includes proper RLS policies
- Follows migration best practices"

git push -u origin onboarding/first-migration

# Create PR on GitHub with proper template
# Request review from your assigned mentor
```

#### **Daily Workflow Practice**

```bash
# Practice the standard daily workflow
supabase start
supabase db reset
pnpm dev:web

# Make a small change to any component
# Test the change locally
# Commit and push for review

# Standard workflow documentation:
📖 docs/database-supabase/developer-guides/daily-workflow.md
```

### **Step 3: Team Integration** (60 minutes)

#### **Meet Your Team**

```bash
# Schedule 15-minute intro calls with:
□ Your assigned mentor (Senior/Admin developer)
□ Product manager for your focus area
□ At least 2 other developers in your role level
□ DevOps/Infrastructure lead (if Admin level)

# Join team communication channels:
□ #general (company updates)
□ #development (technical discussions)
□ #database (database-specific topics)
□ #random (team culture and fun)
```

#### **Understand Product Areas**

```bash
# Read product documentation for assigned area:

# If assigned to TalentExcel:
📖 docs/teams/developers/talentexcel/

# If assigned to SevaPremi:
📖 docs/teams/developers/sevapremi/

# If assigned to 10xGrowth:
📖 docs/teams/developers/10xgrowth/

# For all developers:
📖 docs/Collective_Prosperity_Framework.md
📖 docs/Technical_Specifications.md
```

---

## 🎯 Week 1: First Productive Tasks

### **Junior Developer Track**

#### **Day 3-4: Component Development**

```bash
# Task: Create a simple UI component
Task: Add a "Career Goals" selector component for TalentExcel

Requirements:
- Use existing design system (shadcn/ui)
- Follow naming conventions
- Include TypeScript types
- Add basic unit tests
- Document component usage

Files to create:
- packages/ui/src/components/career-goals-selector.tsx
- packages/ui/src/components/career-goals-selector.stories.tsx
- packages/ui/src/components/__tests__/career-goals-selector.test.tsx
```

#### **Day 5-7: Database Integration**

```bash
# Task: Add database table for component
Task: Create migration for career goals data

Requirements:
- Follow migration template
- Include proper RLS policies
- Add appropriate indexes
- Test thoroughly locally
- Document in PR description

Migration: supabase/migrations/[timestamp]_add_career_goals.sql
```

### **Senior Developer Track**

#### **Day 3-4: Feature Integration**

```bash
# Task: Implement cross-app feature
Task: Add shared notification system across all 3 apps

Requirements:
- Design database schema
- Create shared components
- Implement API endpoints
- Add real-time subscriptions
- Deploy to staging for testing

Focus areas:
- Database design and RLS policies
- Cross-app component sharing
- Real-time event handling
```

#### **Day 5-7: Code Review and Mentoring**

```bash
# Task: Code review responsibilities
Task: Review and merge junior developer PRs

Requirements:
- Provide constructive feedback
- Ensure security best practices
- Validate database changes
- Help with pair programming sessions
- Document any team process improvements
```

### **Admin Developer Track**

#### **Day 3-4: Infrastructure and Security**

```bash
# Task: Production environment setup
Task: Configure production database project

Requirements:
- Set up production Supabase project
- Configure team access controls
- Implement monitoring and alerting
- Test backup and recovery procedures
- Document emergency procedures

Focus areas:
- Production security configuration
- Team access management
- Operational procedures
```

#### **Day 5-7: Team Leadership**

```bash
# Task: Team process optimization
Task: Improve developer onboarding process

Requirements:
- Review current onboarding experience
- Identify bottlenecks and pain points
- Update documentation and procedures
- Create automation where possible
- Train team on new processes
```

---

## ✅ Onboarding Completion Checklist

### **Technical Competency** (All Developers)

```bash
□ Local development environment fully functional
□ Can create, test, and deploy migrations locally
□ Understands RLS policies and security requirements
□ Can navigate monorepo structure efficiently
□ Knows how to run tests and linting
□ Familiar with code review process
□ Understands deployment workflows
```

### **Security Awareness** (All Developers)

```bash
□ Passed security knowledge quiz (100% score required)
□ Understands production data access restrictions
□ Knows how to report security concerns
□ Familiar with incident response procedures
□ Can identify potential security risks in code
□ Understands compliance requirements
```

### **Team Integration** (All Developers)

```bash
□ Has met assigned mentor and team members
□ Familiar with team communication channels
□ Understands product roadmap and goals
□ Knows how to ask for help effectively
□ Familiar with collective prosperity mission
□ Comfortable with team culture and values
```

### **Role-Specific Competencies**

#### **Junior Developers**

```bash
□ Can create UI components following design system
□ Understands component testing requirements
□ Familiar with TypeScript and React patterns
□ Can write basic database queries
□ Knows when to escalate questions
```

#### **Senior Developers**

```bash
□ Can design database schemas with proper normalization
□ Familiar with performance optimization techniques
□ Can mentor junior developers effectively
□ Understands cross-app integration patterns
□ Can troubleshoot production issues
```

#### **Admin Developers**

```bash
□ Can manage production database deployments
□ Familiar with security and compliance requirements
□ Can handle emergency situations calmly
□ Understands infrastructure and DevOps concepts
□ Can make architectural decisions confidently
```

---

## 🎉 Onboarding Success Metrics

### **30-Day Goals**

```bash
# Junior Developers:
- Complete first feature implementation
- Submit 3+ reviewed and merged PRs
- Demonstrate component development skills
- Show understanding of database basics

# Senior Developers:
- Lead cross-app feature implementation
- Review 10+ junior developer PRs
- Mentor at least one team member
- Contribute to architecture decisions

# Admin Developers:
- Complete production environment setup
- Establish operational procedures
- Lead team process improvements
- Handle first production deployment
```

### **Success Indicators**

```bash
□ Developer reports feeling confident and supported
□ Mentor confirms technical competency
□ First month productivity meets expectations
□ No security incidents or violations
□ Positive feedback from team members
□ Enthusiasm for collective prosperity mission
```

---

## 🆘 Getting Help

### **Immediate Support**

```bash
# For urgent issues (blocking development):
💬 Slack: #development-help
👤 Direct message: Your assigned mentor
🚨 Emergency: Text mentor directly (number provided)

# For general questions:
💬 Slack: #general-questions
📚 Documentation: Check docs/ directory first
🤝 Pair programming: Schedule with mentor
```

### **Escalation Path**

```bash
1. Try documentation and self-debugging (15 minutes)
2. Ask assigned mentor (primary support)
3. Ask in team Slack channels
4. Escalate to tech lead (for complex issues)
5. Emergency procedures (for production issues)
```

### **Resources**

```bash
# Internal Documentation:
📖 docs/database-supabase/ (Database environment docs)
📖 docs/developer-contribution-guide.md (Code contribution)
📖 docs/Technical_Specifications.md (Architecture overview)

# External Resources:
🌐 Supabase Documentation: https://supabase.com/docs
🌐 Next.js Documentation: https://nextjs.org/docs
🌐 TypeScript Handbook: https://www.typescriptlang.org/docs
🌐 PostgreSQL Documentation: https://www.postgresql.org/docs
```

---

**Welcome to the SaSarjan development team! Remember: Individual success contributes to collective prosperity. Ubuntu - "I am because we are!" 🌟**
