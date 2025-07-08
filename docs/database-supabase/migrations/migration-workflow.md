# Migration Workflow - Schema Sync Without Data Exposure

**Last Updated**: 06-Jul-2025 (Sunday, 00:05 IST)  
**Purpose**: Safe schema synchronization across environments without exposing production data  
**Security Level**: Maximum - Zero production data exposure to developers

## 🔄 Migration-First Development Philosophy

### **Core Principle: Schema-Only Synchronization**

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Migration-First Workflow                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  SCHEMA CHANGES              DATA SEPARATION           ENVIRONMENTS │
│  ┌─────────────────┐        ┌─────────────────┐       ┌─────────────┐│
│  │ SQL Migrations  │───────▶│ Structure Only  │──────▶│ All Envs    ││
│  │                 │        │                 │       │             ││
│  │ • DDL Commands  │        │ • Tables        │       │ • Local     ││
│  │ • Index Changes │        │ • Columns       │       │ • Staging   ││
│  │ • Policy Updates│        │ • Indexes       │       │ • Production││
│  │ • Function Mods │        │ • Policies      │       │             ││
│  └─────────────────┘        └─────────────────┘       └─────────────┘│
│          ▲                           │                        │      │
│          │                           ▼                        ▼      │
│  ┌─────────────────┐        ┌─────────────────┐       ┌─────────────┐│
│  │ Developers      │        │ NO USER DATA    │       │ Environment ││
│  │ Create Changes  │        │ NEVER EXPOSED   │       │ Specific    ││
│  └─────────────────┘        └─────────────────┘       └─────────────┘│
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Key Benefits:**

- ✅ **Zero Data Exposure**: Developers never see production user data
- ✅ **Consistent Schema**: All environments have identical database structure
- ✅ **Version Control**: All schema changes tracked in Git
- ✅ **Rollback Safety**: Every migration is reversible
- ✅ **Audit Trail**: Complete history of all database changes

---

## 📋 Complete Migration Workflow

### **Step 1: Local Development (Developer)**

#### **Creating a New Migration**

```bash
# Start local Supabase
cd /path/to/sasarjan-appstore
supabase start

# Create new migration file
supabase migration new add_user_career_profiles

# This creates: supabase/migrations/YYYYMMDDHHMMSS_add_user_career_profiles.sql
```

#### **Writing the Migration**

```sql
-- supabase/migrations/20250106120000_add_user_career_profiles.sql

-- ==========================================
-- Migration: Add User Career Profiles
-- Purpose: Support TalentExcel career tracking
-- Author: Developer Name
-- Date: 06-Jan-2025
-- ==========================================

-- Create career profiles table
CREATE TABLE public.user_career_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Career Information
  current_title TEXT,
  experience_years INTEGER DEFAULT 0,
  industry TEXT,
  skills TEXT[] DEFAULT '{}',
  career_goals TEXT[] DEFAULT '{}',

  -- Preferences
  preferred_work_mode TEXT CHECK (preferred_work_mode IN ('remote', 'hybrid', 'onsite')),
  salary_expectation_min INTEGER,
  salary_expectation_max INTEGER,
  currency TEXT DEFAULT 'INR',

  -- Location
  preferred_locations JSONB DEFAULT '[]',
  open_to_relocation BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),

  -- Constraints
  UNIQUE(user_id)
);

-- Create indexes for performance
CREATE INDEX idx_career_profiles_user_id ON public.user_career_profiles(user_id);
CREATE INDEX idx_career_profiles_industry ON public.user_career_profiles(industry);
CREATE INDEX idx_career_profiles_experience ON public.user_career_profiles(experience_years);

-- Enable Row Level Security
ALTER TABLE public.user_career_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own career profile" ON public.user_career_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own career profile" ON public.user_career_profiles
  FOR ALL USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE TRIGGER update_career_profiles_updated_at
  BEFORE UPDATE ON public.user_career_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Add helpful comments
COMMENT ON TABLE public.user_career_profiles IS 'Career information and preferences for TalentExcel users';
COMMENT ON COLUMN public.user_career_profiles.skills IS 'Array of skill keywords for matching';
COMMENT ON COLUMN public.user_career_profiles.preferred_locations IS 'JSON array of preferred work locations';
```

#### **Testing Migration Locally**

```bash
# Apply migration to local database
supabase db reset

# Verify migration applied correctly
supabase db diff --use-migra

# Check table creation
psql postgresql://postgres:postgres@localhost:54322/postgres -c "\d public.user_career_profiles"

# Generate TypeScript types
supabase gen types typescript --local > packages/database/types/database.ts
```

#### **Creating Seed Data for Testing**

```sql
-- supabase/seed/test_career_profiles.sql

-- Insert test career profiles (NO REAL USER DATA)
INSERT INTO public.user_career_profiles (
  id,
  user_id,
  current_title,
  experience_years,
  industry,
  skills,
  career_goals,
  preferred_work_mode,
  salary_expectation_min,
  salary_expectation_max
) VALUES
(
  gen_random_uuid(),
  (SELECT id FROM public.users WHERE email = 'test@example.com'),
  'Software Engineer',
  3,
  'Technology',
  ARRAY['React', 'TypeScript', 'Node.js'],
  ARRAY['Tech Lead', 'Full Stack Development'],
  'remote',
  800000,
  1200000
),
(
  gen_random_uuid(),
  (SELECT id FROM public.users WHERE email = 'test2@example.com'),
  'Data Analyst',
  2,
  'Finance',
  ARRAY['Python', 'SQL', 'Tableau'],
  ARRAY['Data Science', 'Machine Learning'],
  'hybrid',
  600000,
  900000
);
```

### **Step 2: Code Review and Validation**

#### **Migration Review Checklist**

```bash
# Before submitting PR, verify:
□ Migration is idempotent (can run multiple times)
□ All tables have proper RLS policies
□ Indexes are added for performance
□ Foreign key constraints are correct
□ Comments explain complex logic
□ No production data included
□ TypeScript types generated and committed
□ Local testing completed successfully

# Run validation script
./scripts/validate-migration.sh
```

#### **Automated Migration Validation**

```bash
#!/bin/bash
# scripts/validate-migration.sh

echo "🔍 Validating migration..."

# Check for common issues
echo "✅ Checking for production data..."
if grep -r "INSERT.*@sasarjan.com" supabase/migrations/; then
  echo "❌ ERROR: Production email found in migration"
  exit 1
fi

echo "✅ Checking for RLS policies..."
if ! grep -q "ENABLE ROW LEVEL SECURITY" supabase/migrations/$(ls -t supabase/migrations/ | head -1); then
  echo "⚠️  WARNING: No RLS policy found in latest migration"
fi

echo "✅ Checking migration syntax..."
supabase db reset --debug

echo "✅ Generating types..."
supabase gen types typescript --local > packages/database/types/database.ts

echo "🎉 Migration validation completed!"
```

### **Step 3: Staging Deployment (Automated)**

#### **CI/CD Pipeline (GitHub Actions)**

```yaml
# .github/workflows/deploy-staging.yml
name: Deploy to Staging

on:
  push:
    branches: [main]
    paths: ['supabase/migrations/**']

jobs:
  deploy-staging:
    runs-on: ubuntu-latest
    environment: staging

    steps:
      - uses: actions/checkout@v4

      - name: Setup Supabase CLI
        uses: supabase/setup-cli@v1
        with:
          version: latest

      - name: Validate Migration
        run: |
          supabase db start
          supabase db reset

      - name: Deploy to Staging
        run: |
          supabase link --project-ref ${{ secrets.STAGING_PROJECT_REF }}
          supabase db push
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}

      - name: Generate Types for Staging
        run: |
          supabase gen types typescript --project-id ${{ secrets.STAGING_PROJECT_REF }} > packages/database/types/staging.ts

      - name: Run Integration Tests
        run: |
          npm run test:integration:staging
        env:
          STAGING_SUPABASE_URL: ${{ secrets.STAGING_SUPABASE_URL }}
          STAGING_SUPABASE_ANON_KEY: ${{ secrets.STAGING_SUPABASE_ANON_KEY }}
```

#### **Staging Deployment Validation**

```bash
# Automated tests after staging deployment
npm run test:integration:staging

# Manual verification by senior developers
# 1. Check staging dashboard for successful migration
# 2. Verify table structure matches expectations
# 3. Test application functionality with new schema
# 4. Validate RLS policies work correctly
```

### **Step 4: Production Deployment (Manual, Admin Only)**

#### **Pre-Production Checklist**

```bash
# Admin-level pre-deployment verification
□ Migration tested successfully in staging for 24+ hours
□ Integration tests pass in staging environment
□ Performance impact assessed and acceptable
□ Rollback plan prepared and tested
□ Maintenance window scheduled (if needed)
□ Team notified of deployment timeline
□ Database backup verified recent and complete
```

#### **Production Deployment Process**

```bash
# ONLY executed by Admin-level developers
# During scheduled maintenance window

# 1. Verify staging is stable
echo "Checking staging environment..."
supabase projects list
supabase link --project-ref $STAGING_PROJECT_REF

# 2. Backup production database
echo "Creating production backup..."
supabase db dump --project-ref $PRODUCTION_PROJECT_REF > backups/pre-migration-$(date +%Y%m%d-%H%M).sql

# 3. Deploy to production
echo "Deploying to production..."
supabase link --project-ref $PRODUCTION_PROJECT_REF
supabase db push --dry-run  # Preview changes
read -p "Continue with production deployment? (y/N): " confirm
if [[ $confirm == "y" ]]; then
  supabase db push
  echo "✅ Migration deployed to production"
else
  echo "❌ Deployment cancelled"
  exit 1
fi

# 4. Verify deployment
echo "Verifying production deployment..."
supabase db diff --use-migra
```

#### **Post-Production Validation**

```bash
# Immediate post-deployment checks
1. Verify application starts without errors
2. Run smoke tests on critical user flows
3. Check database performance metrics
4. Monitor error rates for 30 minutes
5. Validate RLS policies in production
6. Generate updated TypeScript types

# Generate production types (for reference only)
supabase gen types typescript --project-id $PRODUCTION_PROJECT_REF > packages/database/types/production.ts
```

---

## 🔄 Data Flow and Isolation

### **What Gets Synchronized**

#### **✅ Schema Elements (Always Synced)**

```sql
-- Table definitions
CREATE TABLE public.new_table (...);

-- Column additions/modifications
ALTER TABLE public.existing_table ADD COLUMN new_column TEXT;

-- Index creation/modification
CREATE INDEX idx_performance ON public.table(column);

-- Function definitions
CREATE OR REPLACE FUNCTION calculate_metrics() RETURNS ...;

-- RLS policy definitions
CREATE POLICY "policy_name" ON public.table FOR SELECT USING (...);

-- Enum type definitions
CREATE TYPE status_enum AS ENUM ('active', 'inactive');

-- Extension installations
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

#### **❌ Data Elements (Never Synced)**

```sql
-- User data (NEVER in migrations)
❌ INSERT INTO users VALUES ('real@user.com', ...);

-- Production configuration (NEVER in migrations)
❌ UPDATE system_config SET api_key = 'prod_key';

-- Real business data (NEVER in migrations)
❌ INSERT INTO transactions VALUES (real_transaction_data);

-- Environment-specific secrets (NEVER in migrations)
❌ INSERT INTO api_keys VALUES ('production_secret');
```

### **Environment-Specific Data Handling**

#### **Local Development Data**

```sql
-- supabase/seed/local_test_data.sql
-- Safe test data for local development

INSERT INTO public.users (id, email, full_name, role) VALUES
(gen_random_uuid(), 'dev@test.com', 'Test Developer', 'developer'),
(gen_random_uuid(), 'user@test.com', 'Test User', 'customer');

-- Career profiles with fake but realistic data
INSERT INTO public.user_career_profiles (user_id, current_title, industry) VALUES
((SELECT id FROM public.users WHERE email = 'user@test.com'), 'Software Engineer', 'Technology');
```

#### **Staging Environment Data**

```sql
-- Realistic but fake data that mirrors production patterns
-- Generated via scripts, not migrations

-- Example: Staging data seeding script
-- scripts/seed-staging-data.js
const faker = require('faker');

for (let i = 0; i < 1000; i++) {
  await supabase.from('user_career_profiles').insert({
    user_id: faker.datatype.uuid(),
    current_title: faker.name.jobTitle(),
    industry: faker.random.arrayElement(['Technology', 'Finance', 'Healthcare']),
    experience_years: faker.datatype.number({ min: 0, max: 20 }),
    skills: faker.random.arrayElements(['React', 'Python', 'Java', 'SQL'], 3)
  });
}
```

#### **Production Environment Data**

```bash
# Real user data - NEVER exposed to developers
# - Career information
# - Volunteer activity
# - Business metrics
# - Payment transactions
# - Personal information

# Access: Admin-level only, emergency procedures only
# Viewing: Aggregated metrics only, no individual records
# Backup: Automated, encrypted, access-logged
```

---

## 🛠️ Migration Best Practices

### **Writing Safe Migrations**

#### **Idempotent Operations**

```sql
-- Good: Can be run multiple times safely
CREATE TABLE IF NOT EXISTS public.new_table (...);
ALTER TABLE public.existing_table ADD COLUMN IF NOT EXISTS new_column TEXT;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_name ON public.table(column);

-- Bad: Will fail on second run
CREATE TABLE public.new_table (...);
ALTER TABLE public.existing_table ADD COLUMN new_column TEXT;
```

#### **Non-Breaking Changes**

```sql
-- Good: Additive changes
ALTER TABLE public.users ADD COLUMN phone_number TEXT;
CREATE INDEX CONCURRENTLY idx_users_phone ON public.users(phone_number);

-- Careful: Potentially breaking changes
ALTER TABLE public.users DROP COLUMN old_column;  -- Ensure app code updated first
ALTER TABLE public.users ALTER COLUMN email TYPE VARCHAR(500);  -- Test thoroughly
```

#### **Performance Considerations**

```sql
-- For large tables, use CONCURRENTLY
CREATE INDEX CONCURRENTLY idx_large_table ON public.large_table(indexed_column);

-- Add constraints without validation first, then validate
ALTER TABLE public.large_table ADD CONSTRAINT check_positive CHECK (amount > 0) NOT VALID;
ALTER TABLE public.large_table VALIDATE CONSTRAINT check_positive;

-- Use appropriate data types
-- Good: Specific varchar length
ALTER TABLE public.users ALTER COLUMN email TYPE VARCHAR(254);
-- Avoid: Generic text for everything
```

### **Migration Templates**

#### **New Table Template**

```sql
-- supabase/migrations/template_new_table.sql

-- ==========================================
-- Migration: [Description]
-- Purpose: [Business requirement]
-- Author: [Developer name]
-- Date: [Date]
-- ==========================================

-- Create new table
CREATE TABLE IF NOT EXISTS public.[table_name] (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Add your columns here
  name TEXT NOT NULL,
  description TEXT,

  -- Standard timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_[table_name]_name ON public.[table_name](name);

-- Enable Row Level Security
ALTER TABLE public.[table_name] ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "[table_name]_select_policy" ON public.[table_name]
  FOR SELECT USING (true);  -- Adjust as needed

-- Create updated_at trigger
CREATE TRIGGER update_[table_name]_updated_at
  BEFORE UPDATE ON public.[table_name]
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Add comments
COMMENT ON TABLE public.[table_name] IS '[Table description]';
```

#### **Column Addition Template**

```sql
-- ==========================================
-- Migration: Add [column_name] to [table_name]
-- Purpose: [Business requirement]
-- Author: [Developer name]
-- Date: [Date]
-- ==========================================

-- Add new column
ALTER TABLE public.[table_name]
ADD COLUMN IF NOT EXISTS [column_name] [data_type] [constraints];

-- Add index if needed
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_[table_name]_[column_name]
ON public.[table_name]([column_name]);

-- Update RLS policies if needed
-- DROP POLICY IF EXISTS "[old_policy]" ON public.[table_name];
-- CREATE POLICY "[new_policy]" ON public.[table_name] FOR ...;

-- Add comment
COMMENT ON COLUMN public.[table_name].[column_name] IS '[Column description]';
```

---

## 🔧 Troubleshooting Common Issues

### **Migration Failures**

#### **Rollback Procedures**

```bash
# If staging migration fails
echo "Rolling back staging migration..."

# 1. Identify failed migration
supabase migration list

# 2. Restore from backup if needed
supabase db reset  # Reapplies all previous migrations

# 3. Fix migration file
# Edit the problematic migration file

# 4. Test fix locally
supabase db reset
# Verify fix works

# 5. Redeploy to staging
supabase db push
```

#### **Production Rollback**

```bash
# EMERGENCY ONLY - Admin level access required

# 1. Assess impact
echo "Assessing production impact..."
# Check application errors, user reports

# 2. Quick fix if possible
# Edit migration, deploy fix

# 3. Full rollback if necessary
echo "Performing emergency rollback..."
supabase db reset --project-ref $PRODUCTION_PROJECT_REF --to-migration [previous_migration_timestamp]

# 4. Restore from backup if needed
psql $PRODUCTION_DB_URL < backups/pre-migration-[timestamp].sql

# 5. Post-incident review
# Document what went wrong, update procedures
```

### **Common Migration Errors**

#### **RLS Policy Conflicts**

```sql
-- Error: Policy already exists
-- Solution: Use CREATE OR REPLACE or DROP first
DROP POLICY IF EXISTS "existing_policy" ON public.table_name;
CREATE POLICY "new_policy" ON public.table_name FOR SELECT USING (...);
```

#### **Foreign Key Violations**

```sql
-- Error: Referenced table doesn't exist
-- Solution: Ensure proper migration order
-- Create referenced table first, then referencing table
CREATE TABLE public.parent_table (...);
CREATE TABLE public.child_table (
  parent_id UUID REFERENCES public.parent_table(id)
);
```

#### **Index Creation on Large Tables**

```sql
-- Error: Index creation times out
-- Solution: Use CONCURRENTLY
CREATE INDEX CONCURRENTLY idx_large_table ON public.large_table(column);
```

---

## 📊 Migration Monitoring

### **Key Metrics to Track**

**Migration Success Rate:**

- Local testing success: 100%
- Staging deployment success: >99%
- Production deployment success: >99.9%

**Performance Impact:**

- Migration execution time < 5 minutes
- Zero application downtime for non-breaking changes
- < 30 seconds downtime for breaking changes

**Schema Drift Detection:**

- Weekly schema comparison between environments
- Automated alerts for unexpected differences
- Monthly audit of RLS policy compliance

### **Automated Monitoring**

```bash
# scripts/monitor-schema-drift.sh
#!/bin/bash

echo "🔍 Checking for schema drift..."

# Compare staging and production schemas
supabase db diff --project-ref $STAGING_PROJECT_REF --linked-project-ref $PRODUCTION_PROJECT_REF

# Check for unexpected changes
if [ $? -ne 0 ]; then
  echo "⚠️  Schema drift detected between staging and production"
  # Send alert to team
  curl -X POST $SLACK_WEBHOOK -d '{"text":"Schema drift detected in SaSarjan database"}'
fi
```

---

**Next Steps**: Create developer onboarding guides and security policies documentation to complete the database environment management system.
