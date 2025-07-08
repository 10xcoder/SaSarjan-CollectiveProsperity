# Team Access Control Matrix

**Last Updated**: 05-Jul-2025 (Saturday, 23:55 IST)  
**Purpose**: Role-based database access control for 5-10 developer team  
**Security Level**: High - protecting sensitive user data across 3 flagship apps

## 👥 Team Structure & Access Levels

### **Team Composition (5-10 Developers)**

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SaSarjan Development Team                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ADMIN LEVEL              SENIOR LEVEL              JUNIOR LEVEL    │
│  ┌─────────────────┐     ┌─────────────────┐       ┌─────────────────┐│
│  │ Lead Developers │     │ Senior Devs     │       │ Junior Devs     ││
│  │ (2-3 people)    │     │ (3-4 people)    │       │ (3-5 people)    ││
│  │                 │     │                 │       │                 ││
│  │ • Full prod access    │ • Staging access │       │ • Local dev only││
│  │ • Schema management   │ • Code review    │       │ • Learning focus││
│  │ • Emergency response │ │ • Integration    │       │ • Mentorship    ││
│  └─────────────────┘     └─────────────────┘       └─────────────────┘│
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## 🔐 Access Control Matrix

### **Detailed Access Permissions**

| Resource                | Admin Level       | Senior Level      | Junior Level  |
| ----------------------- | ----------------- | ----------------- | ------------- |
| **Local Development**   | ✅ Full           | ✅ Full           | ✅ Full       |
| **Staging Database**    | ✅ Read/Write     | ✅ Read/Write     | 👁️ Read-only  |
| **Production Database** | ⚠️ CLI only       | 👁️ Read-only      | ❌ No access  |
| **Schema Migrations**   | ✅ Deploy all     | ✅ Deploy staging | ❌ Local only |
| **Supabase Dashboard**  | ✅ Full admin     | ✅ Staging only   | 👁️ Local only |
| **Service Role Keys**   | ✅ Production     | ✅ Staging        | ❌ None       |
| **Database Backups**    | ✅ Create/Restore | 👁️ View only      | ❌ No access  |
| **User Data**           | ⚠️ Emergency only | ❌ No access      | ❌ No access  |

**Legend:**

- ✅ Full Access
- 👁️ Read-only Access
- ⚠️ Restricted/Emergency Access
- ❌ No Access

---

## 🎭 Role Definitions

### **Admin Level: Lead Developers (2-3 people)**

**Responsibilities:**

- Database architecture decisions
- Production deployment authorization
- Security policy enforcement
- Emergency incident response
- Team onboarding and training

**Access Permissions:**

#### **Local Development**

```bash
✅ Full local database control
✅ All Supabase CLI commands
✅ Migration creation and testing
✅ Local data seeding and cleanup
✅ Performance testing and optimization
```

#### **Staging Environment**

```bash
✅ Full Supabase dashboard access
✅ Database schema modifications
✅ Migration deployment
✅ Performance monitoring
✅ Test data management
✅ Integration testing coordination
```

#### **Production Environment**

```bash
⚠️ CLI-only access (no dashboard)
⚠️ Migration deployment during maintenance windows
⚠️ Read-only monitoring and alerting
⚠️ Emergency break-glass procedures
❌ Direct data modification (except emergencies)
❌ Schema changes outside migration system
```

**Required Credentials:**

```bash
# Environment variables for admin access
SUPABASE_ACCESS_TOKEN=admin_access_token
STAGING_PROJECT_REF=staging_project_id
STAGING_DB_PASSWORD=staging_service_role_key
PRODUCTION_PROJECT_REF=production_project_id
PRODUCTION_DB_PASSWORD=production_service_role_key
```

### **Senior Level: Senior Developers (3-4 people)**

**Responsibilities:**

- Feature development and integration
- Code review and quality assurance
- Staging environment management
- Migration creation and testing
- Junior developer mentoring

**Access Permissions:**

#### **Local Development**

```bash
✅ Full local database control
✅ All Supabase CLI commands
✅ Migration creation and testing
✅ Local data seeding and cleanup
✅ Performance testing
```

#### **Staging Environment**

```bash
✅ Full Supabase dashboard access
✅ Database read/write operations
✅ Migration deployment to staging
✅ Test data management
✅ Integration testing
✅ Performance monitoring
```

#### **Production Environment**

```bash
👁️ Read-only monitoring dashboard
👁️ Performance metrics viewing
👁️ Error log analysis
❌ Direct database connections
❌ Schema modifications
❌ Data modifications
```

**Required Credentials:**

```bash
# Environment variables for senior access
SUPABASE_ACCESS_TOKEN=senior_access_token
STAGING_PROJECT_REF=staging_project_id
STAGING_DB_PASSWORD=staging_service_role_key
PRODUCTION_PROJECT_REF=production_project_id  # Read-only
PRODUCTION_ANON_KEY=production_anon_key  # Read-only monitoring
```

### **Junior Level: Junior Developers (3-5 people)**

**Responsibilities:**

- Feature development on assigned tasks
- Local testing and development
- Learning database best practices
- Code review participation
- Documentation contribution

**Access Permissions:**

#### **Local Development**

```bash
✅ Full local database control
✅ Basic Supabase CLI commands
✅ Migration testing (not creation)
✅ Local data seeding
✅ Local development workflow
```

#### **Staging Environment**

```bash
👁️ Read-only dashboard access
👁️ View database schema
👁️ Query data for debugging
❌ Data modifications
❌ Schema changes
❌ Migration deployment
```

#### **Production Environment**

```bash
❌ No access to production
❌ No production credentials
❌ No production monitoring
```

**Required Credentials:**

```bash
# Environment variables for junior access
STAGING_PROJECT_REF=staging_project_id
STAGING_ANON_KEY=staging_anon_key  # Read-only
# No production credentials
```

---

## 🔑 Credential Management Strategy

### **Environment Variable Structure**

#### **Admin Level (.env.admin)**

```bash
# Local Development
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=local_anon_key
SUPABASE_SERVICE_ROLE_KEY=local_service_role_key

# Staging Environment
STAGING_SUPABASE_URL=https://staging-project.supabase.co
STAGING_SUPABASE_ANON_KEY=staging_anon_key
STAGING_SERVICE_ROLE_KEY=staging_service_role_key

# Production Environment (Restricted)
PRODUCTION_SUPABASE_URL=https://production-project.supabase.co
PRODUCTION_SUPABASE_ANON_KEY=production_anon_key
PRODUCTION_SERVICE_ROLE_KEY=production_service_role_key

# CLI Access
SUPABASE_ACCESS_TOKEN=admin_personal_access_token
```

#### **Senior Level (.env.senior)**

```bash
# Local Development
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=local_anon_key
SUPABASE_SERVICE_ROLE_KEY=local_service_role_key

# Staging Environment
STAGING_SUPABASE_URL=https://staging-project.supabase.co
STAGING_SUPABASE_ANON_KEY=staging_anon_key
STAGING_SERVICE_ROLE_KEY=staging_service_role_key

# Production Environment (Read-only)
PRODUCTION_SUPABASE_URL=https://production-project.supabase.co
PRODUCTION_SUPABASE_ANON_KEY=production_anon_key
# No production service role key

# CLI Access
SUPABASE_ACCESS_TOKEN=senior_personal_access_token
```

#### **Junior Level (.env.junior)**

```bash
# Local Development
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=local_anon_key
SUPABASE_SERVICE_ROLE_KEY=local_service_role_key

# Staging Environment (Read-only)
STAGING_SUPABASE_URL=https://staging-project.supabase.co
STAGING_SUPABASE_ANON_KEY=staging_anon_key
# No staging service role key

# No production environment access

# CLI Access (Limited)
SUPABASE_ACCESS_TOKEN=junior_personal_access_token
```

### **Credential Rotation Policy**

**Monthly Rotation:**

- All service role keys rotated monthly
- Personal access tokens reviewed quarterly
- Emergency credentials rotated after any incident

**Access Audit:**

- Weekly review of active sessions
- Monthly audit of access permissions
- Quarterly review of team access levels

---

## 🛡️ Security Policies

### **Access Control Enforcement**

#### **Database Row Level Security (RLS)**

```sql
-- Example: Users can only access their own data
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Example: Developers can only access staging data
CREATE POLICY "Staging environment access" ON public.apps
  FOR ALL USING (
    current_setting('app.environment', true) = 'staging'
    OR auth.jwt() ->> 'role' = 'admin'
  );
```

#### **Environment Isolation**

```bash
# Network-level isolation
Production:  Private subnet, VPN-only admin access
Staging:     Public subnet, team IP whitelist
Local:       Developer machine, no external access
```

#### **Audit Logging**

```sql
-- All production changes logged
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **Emergency Access Procedures**

#### **Break-Glass Access**

**When**: Critical production issues requiring immediate data access
**Who**: Admin level developers only
**Process**:

1. Document emergency justification
2. Enable temporary production access
3. Fix critical issue with minimal changes
4. Revoke access immediately after resolution
5. Complete post-incident audit

**Emergency Contacts:**

- Database Lead: TBD
- Security Lead: TBD
- DevOps Lead: TBD

---

## 📋 Implementation Checklist

### **Team Onboarding Process**

#### **For Admin Level Developers**

```bash
□ Supabase organization admin access
□ Production and staging project access
□ CLI personal access token generation
□ Emergency procedure training
□ Security policy acknowledgment
□ Backup and recovery training
```

#### **For Senior Level Developers**

```bash
□ Staging project full access
□ Production read-only monitoring access
□ CLI personal access token (limited)
□ Code review permission setup
□ Migration workflow training
□ Team mentoring responsibilities
```

#### **For Junior Level Developers**

```bash
□ Local development setup
□ Staging read-only access
□ CLI personal access token (basic)
□ Development workflow training
□ Security awareness training
□ Mentorship assignment
```

### **Access Validation Tests**

#### **Weekly Access Verification**

```bash
# Test scripts to verify access controls
./scripts/verify-admin-access.sh
./scripts/verify-senior-access.sh
./scripts/verify-junior-access.sh
./scripts/verify-production-isolation.sh
```

#### **Monthly Security Audit**

```bash
# Audit checklist
□ Review all active user accounts
□ Verify credential rotation schedule
□ Check for unauthorized access attempts
□ Validate RLS policy effectiveness
□ Review audit log completeness
□ Test emergency access procedures
```

---

## 🔧 Technical Implementation

### **Supabase Organization Setup**

#### **Project Structure**

```bash
SaSarjan Organization
├── Members:
│   ├── admin@sasarjan.com (Owner)
│   ├── lead1@sasarjan.com (Admin)
│   ├── lead2@sasarjan.com (Admin)
│   ├── senior1@sasarjan.com (Developer)
│   ├── senior2@sasarjan.com (Developer)
│   ├── senior3@sasarjan.com (Developer)
│   ├── junior1@sasarjan.com (Developer)
│   ├── junior2@sasarjan.com (Developer)
│   └── junior3@sasarjan.com (Developer)
├── Projects:
│   ├── sasarjan-prod (Restricted access)
│   └── sasarjan-staging (Team access)
└── Billing: Organization level
```

#### **Role Assignment Script**

```bash
#!/bin/bash
# assign-team-roles.sh

# Admin level access
supabase projects update sasarjan-prod --add-member lead1@sasarjan.com --role admin
supabase projects update sasarjan-staging --add-member lead1@sasarjan.com --role admin

# Senior level access
supabase projects update sasarjan-staging --add-member senior1@sasarjan.com --role developer
supabase projects update sasarjan-prod --add-member senior1@sasarjan.com --role read-only

# Junior level access (staging read-only)
supabase projects update sasarjan-staging --add-member junior1@sasarjan.com --role read-only
```

---

## 📊 Access Monitoring and Metrics

### **Key Metrics to Track**

**Security Metrics:**

- Failed authentication attempts per day
- Unauthorized access attempts
- Credential usage patterns
- Emergency access activations

**Productivity Metrics:**

- Developer onboarding time
- Environment-related blockers
- Migration deployment success rate
- Schema change cycle time

**Compliance Metrics:**

- Audit log completeness
- Access review completion rate
- Security training completion
- Incident response time

### **Alerting Thresholds**

**Immediate Alerts:**

- Any production database direct access
- Failed admin authentication (>3 attempts)
- Unusual query patterns on production
- Emergency access activation

**Daily Alerts:**

- Staging environment unusual activity
- New team member access requests
- Credential rotation due dates
- Performance degradation alerts

---

**Next Steps**: Implement migration workflow documentation and developer onboarding guides.
