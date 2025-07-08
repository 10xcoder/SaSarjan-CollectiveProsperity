# Daily Development Workflow

**Last Updated**: 06-Jul-2025 (Sunday, 00:25 IST)  
**Purpose**: Standardized daily workflow for all SaSarjan developers  
**Applies To**: All team members (Junior, Senior, Admin levels)

## ⚡ Quick Reference Workflow

### **Daily Start Routine** (5 minutes)

```bash
# Navigate to project
cd sasarjan-appstore

# Start local services
supabase start

# Pull latest changes
git pull origin main

# Update dependencies if needed
pnpm install

# Apply latest database migrations
supabase db reset

# Generate fresh TypeScript types
supabase gen types typescript --local > packages/database/types/database.ts

# Start development servers
pnpm dev:web  # or pnpm dev:all for all apps
```

### **End of Day Routine** (3 minutes)

```bash
# Commit work in progress
git add .
git commit -m "wip: [description of current work]"
git push origin feature/branch-name

# Stop local services
supabase stop

# Document any blockers or notes for tomorrow
echo "Tomorrow: Continue with [specific task]" >> daily-notes.md
```

---

## 🌅 Morning Routine (First 30 minutes)

### **Step 1: Environment Sync** (10 minutes)

#### **Check for Updates**

```bash
# Pull latest code changes
git checkout main
git pull origin main

# Check for new migrations
ls supabase/migrations/ | tail -5

# If new migrations exist, apply them
supabase db reset

# Update TypeScript types if schema changed
supabase gen types typescript --local > packages/database/types/database.ts
git diff packages/database/types/database.ts  # Review changes
```

#### **Dependency Updates**

```bash
# Check for dependency updates (weekly)
pnpm outdated

# Install new dependencies if package.json changed
pnpm install

# Check for security vulnerabilities
pnpm audit --audit-level=high
```

### **Step 2: Local Environment Health Check** (5 minutes)

#### **Service Status Verification**

```bash
# Start Supabase if not running
supabase status

# Expected output:
# supabase local development setup is running.
#
#          API URL: http://localhost:54321
#     GraphQL URL: http://localhost:54321/graphql/v1
#          DB URL: postgresql://postgres:postgres@localhost:54322/postgres
#      Studio URL: http://localhost:54323
#    Inbucket URL: http://localhost:54324
#      JWT secret: super-secret-jwt-token-with-at-least-32-characters-long
#        anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
# service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### **Database Connection Test**

```bash
# Quick database connectivity test
psql postgresql://postgres:postgres@localhost:54322/postgres -c "SELECT version();"

# Verify essential tables exist
psql postgresql://postgres:postgres@localhost:54322/postgres -c "\dt public.*"

# Check recent migrations
psql postgresql://postgres:postgres@localhost:54322/postgres -c "SELECT * FROM supabase_migrations.schema_migrations ORDER BY version DESC LIMIT 5;"
```

### **Step 3: Daily Planning** (15 minutes)

#### **Review Current Sprint**

```bash
# Check current sprint goals
📖 Read: plan/strategic/sprints.md

# Check your assigned tasks
# - GitHub Issues assigned to you
# - Project board status updates
# - Any blocked tasks from yesterday
```

#### **Team Communication Check**

```bash
# Check team channels for updates
💬 Slack: #development (technical discussions)
💬 Slack: #database (database changes)
💬 Slack: #general (company updates)

# Review any mentions or direct messages
# Check for critical issues or blockers from team
```

---

## 💻 Core Development Workflow

### **Feature Development Process**

#### **Step 1: Create Feature Branch**

```bash
# Create descriptive branch name
git checkout main
git pull origin main
git checkout -b feature/user-profile-enhancement

# Branch naming conventions:
# feature/description-of-feature
# fix/description-of-bug-fix
# chore/description-of-maintenance
# docs/description-of-documentation
```

#### **Step 2: Development Cycle**

##### **Database Changes (if needed)**

```bash
# Create migration if schema changes needed
supabase migration new add_user_profile_fields

# Edit migration file
code supabase/migrations/[timestamp]_add_user_profile_fields.sql

# Test migration locally
supabase db reset

# Verify migration worked
psql postgresql://postgres:postgres@localhost:54322/postgres -c "\d public.user_profiles"
```

**Example Migration:**

```sql
-- supabase/migrations/20250106120000_add_user_profile_fields.sql

-- Add social media links to user profiles
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS github_url TEXT,
ADD COLUMN IF NOT EXISTS twitter_url TEXT;

-- Add indexes for performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_profiles_linkedin
ON public.user_profiles(linkedin_url) WHERE linkedin_url IS NOT NULL;

-- Update RLS policies if needed
-- (Add any policy changes here)

-- Add comments
COMMENT ON COLUMN public.user_profiles.linkedin_url IS 'LinkedIn profile URL for professional networking';
COMMENT ON COLUMN public.user_profiles.github_url IS 'GitHub profile URL for developers';
COMMENT ON COLUMN public.user_profiles.twitter_url IS 'Twitter profile URL for social presence';
```

##### **Code Changes**

```bash
# Generate updated TypeScript types after schema changes
supabase gen types typescript --local > packages/database/types/database.ts

# Make code changes following project conventions
# - Use existing component patterns
# - Follow TypeScript strict mode
# - Add proper error handling
# - Include loading states
```

##### **Testing Changes**

```bash
# Run linting
pnpm lint

# Run type checking
pnpm typecheck

# Run tests
pnpm test

# Test specific app if working on one
pnpm dev:talentexcel  # Test TalentExcel changes
pnpm dev:sevapremi    # Test SevaPremi changes
pnpm dev:10xgrowth    # Test 10xGrowth changes
```

#### **Step 3: Code Review Preparation**

```bash
# Clean up commit history
git log --oneline  # Review your commits

# Squash commits if needed
git rebase -i HEAD~3  # Interactive rebase for last 3 commits

# Final testing before PR
supabase db reset     # Fresh database
pnpm dev:all         # Test all apps
pnpm lint           # Final lint check
pnpm typecheck      # Final type check
```

---

## 🔄 Daily Task Management

### **Morning Task Planning** (Based on Role)

#### **Junior Developer Tasks**

```bash
# Daily focus areas:
□ Complete assigned component development
□ Write tests for new components
□ Update documentation for changes
□ Ask questions early when blocked
□ Participate in code reviews (learning)

# Example daily schedule:
09:00-10:00  Code review and team standup
10:00-12:00  Feature development work
12:00-13:00  Lunch break
13:00-15:00  Continued development
15:00-15:30  Documentation updates
15:30-17:00  Testing and bug fixes
17:00-17:30  Commit work and plan tomorrow
```

#### **Senior Developer Tasks**

```bash
# Daily focus areas:
□ Lead feature implementation
□ Review junior developer PRs
□ Mentor team members
□ Database schema decisions
□ Cross-app integration work

# Example daily schedule:
09:00-09:30  Review overnight PRs and issues
09:30-10:00  Team standup and planning
10:00-12:00  Architecture and complex development
12:00-13:00  Lunch break
13:00-14:00  Code reviews and mentoring
14:00-16:00  Feature development
16:00-17:00  Testing and integration
17:00-17:30  Team support and planning
```

#### **Admin Developer Tasks**

```bash
# Daily focus areas:
□ Production environment monitoring
□ Team unblocking and support
□ Security and compliance reviews
□ Infrastructure maintenance
□ Strategic planning and architecture

# Example daily schedule:
09:00-09:30  Production health check
09:30-10:00  Team standup and planning
10:00-11:00  Strategic development work
11:00-12:00  Team support and unblocking
12:00-13:00  Lunch break
13:00-14:00  Security and compliance review
14:00-15:30  Infrastructure and DevOps
15:30-16:30  Architecture planning
16:30-17:00  Team retrospective and planning
```

### **Afternoon Workflow Patterns**

#### **Code Review Process**

```bash
# For reviewers (Senior/Admin):
1. Check PR description and requirements
2. Review database changes first (security critical)
3. Check code quality and patterns
4. Verify tests are included
5. Test changes locally if complex
6. Provide constructive feedback
7. Approve or request changes

# For authors (All levels):
1. Respond to feedback promptly
2. Ask clarifying questions
3. Make requested changes
4. Update PR description if scope changes
5. Request re-review after changes
```

#### **Testing and Quality Assurance**

```bash
# Before each commit:
□ Code builds without errors
□ All tests pass locally
□ Linting rules satisfied
□ Type checking passes
□ Database migrations test successfully
□ No console errors in browser
□ Accessibility standards met (basic check)

# Weekly quality checks:
□ Run full test suite: pnpm test:coverage
□ Check bundle size: pnpm build && pnpm analyze
□ Accessibility audit: pnpm test:a11y
□ Security audit: pnpm audit:security
```

---

## 🎯 Role-Specific Daily Activities

### **Junior Developer Daily Focus**

#### **Learning and Development**

```bash
# Daily learning goals (30 minutes):
□ Read one piece of technical documentation
□ Review one senior developer's PR for learning
□ Practice TypeScript or React concepts
□ Ask one clarifying question about codebase
□ Document one thing learned today

# Weekly learning goals:
□ Complete one technical tutorial
□ Attend one team knowledge sharing session
□ Contribute to team documentation
□ Shadow senior developer on complex task
```

#### **Contribution Expectations**

```bash
# Daily contribution targets:
□ 1-2 hours of focused development work
□ Complete assigned task or make significant progress
□ Write tests for any new code
□ Update relevant documentation
□ Participate in team discussions

# Quality over quantity focus:
- Better to complete small tasks well
- Ask for help early when stuck
- Focus on learning and understanding
- Practice code review skills
```

### **Senior Developer Daily Focus**

#### **Leadership and Mentoring**

```bash
# Daily mentoring activities:
□ Review and merge junior developer PRs
□ Provide technical guidance to team members
□ Pair program with junior developers (1-2 sessions/week)
□ Answer technical questions in team channels
□ Help unblock team members

# Technical leadership:
□ Make architectural decisions for assigned features
□ Review database schema changes
□ Ensure code quality standards
□ Guide cross-app integration efforts
```

#### **Development Leadership**

```bash
# Daily development goals:
□ Lead implementation of complex features
□ Design database schemas and APIs
□ Coordinate with multiple team members
□ Ensure feature requirements are met
□ Plan and break down large tasks

# Code quality ownership:
□ Maintain coding standards across team
□ Review and approve significant changes
□ Mentor on best practices
□ Identify technical debt opportunities
```

### **Admin Developer Daily Focus**

#### **Infrastructure and Operations**

```bash
# Daily operational tasks:
□ Monitor production environment health
□ Review and approve production deployments
□ Ensure backup and monitoring systems working
□ Address any infrastructure issues
□ Coordinate with DevOps and security teams

# Weekly operational reviews:
□ Review production metrics and performance
□ Update infrastructure documentation
□ Test disaster recovery procedures
□ Audit team access and permissions
```

#### **Strategic Planning**

```bash
# Daily strategic activities:
□ Review team progress against sprint goals
□ Identify and address team blockers
□ Make architectural decisions
□ Plan infrastructure improvements
□ Coordinate with product and business teams

# Long-term planning:
□ Evaluate new technologies and tools
□ Plan scalability improvements
□ Design security enhancements
□ Mentor other team members on leadership
```

---

## 🛠️ Common Daily Commands

### **Essential Git Workflow**

```bash
# Start of day
git checkout main
git pull origin main
git checkout -b feature/new-feature

# During development
git add .
git commit -m "feat: add user profile validation

- Add email validation for user profiles
- Include proper error messages
- Update TypeScript types"

# End of day / before breaks
git push -u origin feature/new-feature

# When feature is complete
git checkout main
git pull origin main
git checkout feature/new-feature
git rebase main
git push --force-with-lease origin feature/new-feature
```

### **Database Management Commands**

```bash
# Daily database commands
supabase start                    # Start local database
supabase status                   # Check service status
supabase db reset                 # Apply all migrations
supabase migration list           # View migration history
supabase gen types typescript --local > packages/database/types/database.ts

# Weekly maintenance
supabase db dump > backup.sql     # Create backup
supabase db clean                 # Clean up test data
```

### **Development Server Management**

```bash
# Single app development
pnpm dev:web          # Main app store
pnpm dev:talentexcel  # Career platform
pnpm dev:sevapremi    # Community service
pnpm dev:10xgrowth    # Business growth
pnpm dev:admin        # Admin dashboard

# All apps (requires more resources)
pnpm dev:all          # All apps in parallel

# Production builds
pnpm build            # Build all packages
pnpm build:web        # Build specific app
```

### **Quality Assurance Commands**

```bash
# Daily quality checks
pnpm lint                         # ESLint check
pnpm typecheck                    # TypeScript check
pnpm test                         # Run test suite
pnpm format:check                 # Prettier check

# Fix common issues
pnpm lint --fix                   # Auto-fix linting
pnpm format                       # Auto-format code
```

---

## 📊 Daily Progress Tracking

### **Personal Productivity Metrics**

#### **Daily Self-Assessment Questions**

```bash
# At end of each day, answer:
□ Did I complete my planned tasks for today?
□ What obstacles did I encounter and how did I handle them?
□ What did I learn today that will help tomorrow?
□ Did I help any team members or get help when needed?
□ What can I improve in tomorrow's workflow?
```

#### **Weekly Reflection Questions**

```bash
# Every Friday, reflect on:
□ What was my biggest accomplishment this week?
□ What technical skills did I develop?
□ How did I contribute to team success?
□ What challenges should I focus on next week?
□ How can I better support collective prosperity goals?
```

### **Team Collaboration Metrics**

#### **Daily Team Interaction Goals**

```bash
# Junior Developers:
□ Ask at least one clarifying question
□ Provide feedback on at least one PR
□ Share one learning or insight with team
□ Help another team member if possible

# Senior Developers:
□ Review and provide feedback on 2+ PRs
□ Answer team questions in channels
□ Mentor at least one junior developer
□ Coordinate on cross-team dependencies

# Admin Developers:
□ Unblock at least one team member
□ Review strategic progress with team
□ Address any infrastructure issues
□ Plan improvements for tomorrow/next week
```

---

## 🔧 Troubleshooting Common Issues

### **Environment Issues**

#### **Supabase Won't Start**

```bash
# Check if ports are in use
lsof -i :54321  # API port
lsof -i :54322  # Database port
lsof -i :54323  # Studio port

# Kill conflicting processes
kill -9 [PID]

# Reset Supabase completely
supabase stop
supabase start
```

#### **Database Connection Issues**

```bash
# Verify database is running
psql postgresql://postgres:postgres@localhost:54322/postgres -c "SELECT 1;"

# Check migration status
supabase migration list

# Reset database if corrupted
supabase db reset
```

#### **TypeScript Type Errors**

```bash
# Regenerate database types
supabase gen types typescript --local > packages/database/types/database.ts

# Clear TypeScript cache
rm -rf .next/
rm -rf node_modules/.cache/

# Restart TypeScript service in VS Code
# Cmd/Ctrl + Shift + P -> "TypeScript: Restart TS Server"
```

### **Git Workflow Issues**

#### **Merge Conflicts**

```bash
# Update main branch
git checkout main
git pull origin main

# Rebase feature branch
git checkout feature/branch-name
git rebase main

# Resolve conflicts manually, then:
git add .
git rebase --continue

# Force push after rebase
git push --force-with-lease origin feature/branch-name
```

#### **Accidental Commits**

```bash
# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1

# Amend last commit message
git commit --amend -m "New commit message"
```

---

**Remember**: Consistency in daily workflow creates collective productivity. Every day you follow these practices contributes to the team's success and the platform's mission of collective prosperity! 🌟
