# Developer Access & Permissions Guide

**Purpose**: Define what access developers need and how to provision it securely  
**Last Updated**: 07-Jul-2025, Monday 09:15 IST  
**Version**: 1.0

## 🔑 Access Requirements Overview

### Access Levels

1. **Junior Developer**: Basic access for feature development
2. **Senior Developer**: Extended access with review permissions
3. **Module Developer**: Limited access to module repositories only
4. **Team Lead**: Admin access for specific app area

## 📋 Access Checklist for New Developers

### Day 1: Essential Access

```bash
# What HR/Admin needs to provide:
□ Email account (name@sasarjan.com)
□ Slack workspace invitation
□ Calendar access for team meetings

# What Central Team provides:
□ GitHub organization invitation
□ Repository access (read/write to feature branches)
□ Supabase development project access
□ Vercel team member access (preview deployments)
□ Sentry developer access (error tracking)
```

### Day 2-3: Development Access

```bash
□ Local development credentials (.env.local file)
□ Figma viewer access (designs)
□ Postman team workspace (API testing)
□ Browser testing accounts (BrowserStack)
□ Documentation wiki access
```

## 🏢 GitHub Repository Access

### Repository Structure

```
sasarjan-org/
├── sasarjan-appstore/        # Main monorepo (PRIVATE)
│   └── Permissions: Write (feature branches only)
├── talentexcel-app/          # TalentExcel app (PRIVATE)
│   └── Permissions: Write (based on team)
├── sevapremi-app/            # SevaPremi app (PRIVATE)
│   └── Permissions: Write (based on team)
├── 10xgrowth-app/            # 10xGrowth app (PRIVATE)
│   └── Permissions: Write (based on team)
└── sasarjan-modules/         # Public modules (PUBLIC)
    └── Permissions: Fork and PR
```

### GitHub Permissions Matrix

| Action           | Junior Dev      | Senior Dev | Module Dev  | Team Lead |
| ---------------- | --------------- | ---------- | ----------- | --------- |
| View code        | ✅              | ✅         | ✅ (public) | ✅        |
| Create branches  | ✅ (feature/\*) | ✅         | ❌          | ✅        |
| Push to branches | ✅ (own)        | ✅         | ❌          | ✅        |
| Create PRs       | ✅              | ✅         | ✅          | ✅        |
| Merge PRs        | ❌              | ❌         | ❌          | ✅        |
| Delete branches  | ❌              | ✅ (own)   | ❌          | ✅        |
| Manage issues    | ✅ (assign)     | ✅         | ❌          | ✅        |
| Admin settings   | ❌              | ❌         | ❌          | ❌        |

### Branch Protection Rules

```yaml
main:
  - Require PR reviews: 2 approvals
  - Dismiss stale reviews: true
  - Require status checks: true
  - Include administrators: true
  - Restrict push: Central Team only

develop:
  - Require PR reviews: 1 approval
  - Require status checks: true
  - Allow force pushes: false

feature/*:
  - No restrictions
  - Developers can push directly
```

## 🗄️ Supabase Database Access

### Development Environment

```bash
# Provided in .env.local
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]

# For server-side operations (restricted)
SUPABASE_SERVICE_ROLE_KEY=[service-key] # Only senior devs
```

### Database Access Levels

| Permission        | Junior Dev | Senior Dev | Module Dev | Central Team |
| ----------------- | ---------- | ---------- | ---------- | ------------ |
| Read data         | ✅ (dev)   | ✅ (dev)   | ❌         | ✅ (all)     |
| Write data        | ✅ (dev)   | ✅ (dev)   | ❌         | ✅ (all)     |
| Create tables     | ❌         | ❌         | ❌         | ✅           |
| Modify schema     | ❌         | ❌         | ❌         | ✅           |
| View RLS policies | ✅         | ✅         | ❌         | ✅           |
| Modify RLS        | ❌         | ❌         | ❌         | ✅           |
| Production access | ❌         | ❌         | ❌         | ✅           |

### Row Level Security for Developers

```sql
-- Developers can only modify data in development
CREATE POLICY "Developers can manage dev data" ON internships
  FOR ALL
  USING (
    auth.jwt() ->> 'environment' = 'development' AND
    auth.jwt() ->> 'role' = 'developer'
  );
```

## 🚀 Deployment Access (Vercel)

### Vercel Team Roles

```
Team: sasarjan-dev
├── Viewer (Junior Dev)
│   ├── View deployments
│   ├── View build logs
│   └── Access preview URLs
├── Member (Senior Dev)
│   ├── All Viewer permissions
│   ├── Create deployments
│   └── Manage own deployments
└── Admin (Team Lead)
    ├── All Member permissions
    ├── Manage team
    └── Configure projects
```

### Environment Variables Access

```bash
# Developers CANNOT:
- View production env variables
- Modify any env variables
- Access sensitive keys

# Developers receive:
- Development .env.local file
- Preview environment access
- Non-sensitive configuration
```

## 📊 Monitoring & Analytics Access

### Sentry (Error Tracking)

```
Organization: sasarjan
├── Projects:
│   ├── talentexcel-dev (Full access)
│   ├── sevapremi-dev (Based on team)
│   └── 10xgrowth-dev (Based on team)
├── Permissions:
│   ├── View errors: ✅
│   ├── Resolve issues: ✅
│   ├── Create alerts: ❌
│   └── View sensitive data: ❌
```

### PostHog (Analytics)

```
Access Level: Viewer
- View dashboards: ✅
- View user sessions: ✅ (anonymized)
- Create insights: ✅
- Export data: ❌
- View PII: ❌
```

## 💬 Communication Access

### Slack Workspace

```
Channels (Auto-join):
├── #general
├── #dev-team
├── #[app]-dev (based on assignment)
├── #daily-standup
├── #dev-help
└── #random

Channels (Request access):
├── #architecture
├── #security
├── #production-alerts
└── #central-team
```

### Documentation Access

```
Confluence/Notion:
├── Developer Wiki (Read/Write)
├── API Documentation (Read/Write)
├── Architecture Docs (Read only)
├── Security Policies (Read only)
└── Runbooks (Read only)
```

## 🔐 Security Requirements

### Multi-Factor Authentication (MFA)

```
Required for:
- GitHub account
- Email account
- Slack (optional but recommended)
- Vercel account
- Any production access
```

### Password Requirements

```
- Minimum 12 characters
- Mix of uppercase, lowercase, numbers, symbols
- Unique per service
- Use password manager (1Password/Bitwarden)
- Rotate every 90 days
```

### SSH Key Setup

```bash
# Generate SSH key for GitHub
ssh-keygen -t ed25519 -C "your-email@sasarjan.com"

# Add to SSH agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# Add public key to GitHub account
cat ~/.ssh/id_ed25519.pub
# Copy and add to GitHub.com → Settings → SSH Keys
```

## 📝 Onboarding Checklist for Managers

### Before Developer Starts

```markdown
- [ ] Create email account
- [ ] Send Slack invitation
- [ ] Prepare workstation/laptop
- [ ] Create GitHub account
- [ ] Schedule onboarding meetings
```

### Day 1 Setup

```markdown
- [ ] Welcome meeting
- [ ] Provide laptop/workstation
- [ ] GitHub organization invitation
- [ ] Slack workspace setup
- [ ] Calendar access
- [ ] Development credentials
```

### Week 1 Completion

```markdown
- [ ] All repository access granted
- [ ] Development environment working
- [ ] First PR submitted
- [ ] Team introductions complete
- [ ] Security training completed
```

## ⚠️ Access Revocation Process

### When Developer Leaves

```bash
# Immediate actions (within 1 hour):
□ Disable email account
□ Remove from GitHub organization
□ Revoke Slack access
□ Disable Vercel access
□ Rotate any shared credentials

# Within 24 hours:
□ Audit code commits
□ Transfer ownership of branches
□ Update documentation
□ Notify team of changes
```

### Access Review Schedule

- Monthly: Review active developers
- Quarterly: Audit all permissions
- Annually: Full security review

## 🆘 Access Issues Resolution

### Common Issues & Solutions

| Issue                        | Solution                                      | Contact    |
| ---------------------------- | --------------------------------------------- | ---------- |
| Can't push to GitHub         | Check branch naming, ensure feature/\* prefix | DevOps     |
| Database connection failed   | Verify .env.local values                      | Team Lead  |
| Can't see Vercel deployments | Confirm team membership                       | DevOps     |
| Slack channels missing       | Request access in #general                    | Admin      |
| MFA setup problems           | Use backup codes, contact IT                  | IT Support |

### Escalation Path

1. Check documentation first
2. Ask in #dev-help channel
3. Contact Team Lead
4. Escalate to Central Team
5. Emergency: Page on-call engineer

## 📋 Developer Agreement

By accepting access, developers agree to:

- Keep credentials secure and never share them
- Use access only for assigned work
- Report security concerns immediately
- Follow company security policies
- Return all access upon departure

---

**Important**: Access is a privilege. Misuse will result in immediate revocation and potential termination.
