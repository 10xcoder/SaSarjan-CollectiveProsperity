# Production Deployment Checklist

## Pre-Deployment Requirements

### 1. Supabase Production Setup
- [ ] Create production Supabase project
- [ ] Note down project reference ID
- [ ] Copy anon key and service role key
- [ ] Configure authentication providers (Email, Google, etc.)
- [ ] Set up rate limiting in Supabase dashboard
- [ ] Configure allowed redirect URLs for OAuth

### 2. Domain Setup
- [ ] Register/configure main domain: `sasarjan.com`
- [ ] Set up subdomains:
  - [ ] `admin.sasarjan.com`
  - [ ] `talent.sasarjan.com`
  - [ ] `seva.sasarjan.com`
  - [ ] `10xgrowth.sasarjan.com`
- [ ] Configure DNS records to point to Vercel
- [ ] Verify SSL certificates are active

### 3. Security Keys Generation
- [ ] Run `./scripts/generate-production-keys.sh`
- [ ] Store generated keys securely
- [ ] Create `.env.production` for each app
- [ ] Verify all keys are unique and strong

## Database Migration

### 1. Schema Preparation
- [ ] Review all migration files in `/supabase/migrations/`
- [ ] Backup current local schema: `supabase db dump > backups/local-schema-$(date +%Y%m%d).sql`
- [ ] Test migrations locally: `supabase db reset`

### 2. Production Migration
- [ ] Connect to production project: `supabase link --project-ref [your-project-ref]`
- [ ] Apply migrations: `supabase db push`
- [ ] Verify schema: `supabase db diff --use-migra`
- [ ] Generate TypeScript types: `pnpm db:types`

### 3. Initial Data Setup
- [ ] Create production admin user(s)
- [ ] Set up initial app configurations
- [ ] Verify Row Level Security policies
- [ ] Test database connectivity

## Vercel Configuration

### 1. Project Setup (for each app)
- [ ] Create Vercel project
- [ ] Link to GitHub repository
- [ ] Configure build settings:
  - Root Directory: `./`
  - Build Command: `pnpm build --filter=@sasarjan/[app-name]`
  - Install Command: `pnpm install`
  - Output Directory: `apps/[app-name]/.next`

### 2. Environment Variables (for each app)
Add the following environment variables in Vercel dashboard:

#### Required for all apps:
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `JWT_SECRET`
- [ ] `HMAC_SECRET_KEY`
- [ ] `TOKEN_ENCRYPTION_KEY`
- [ ] `COOKIE_SECRET`
- [ ] `NEXT_PUBLIC_COOKIE_DOMAIN` (set to `.sasarjan.com`)
- [ ] `NEXT_PUBLIC_WEB_URL`
- [ ] `NEXT_PUBLIC_ADMIN_URL`
- [ ] `NEXT_PUBLIC_TALENTEXCEL_URL`
- [ ] `NEXT_PUBLIC_SEVAPREMI_URL`
- [ ] `NEXT_PUBLIC_10XGROWTH_URL`
- [ ] `NODE_ENV` (set to `production`)

#### Admin app only:
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `ADMIN_EMAIL_WHITELIST`

### 3. Domain Configuration
- [ ] Add custom domains to each Vercel project
- [ ] Configure domain aliases if needed
- [ ] Verify domain ownership
- [ ] Enable automatic HTTPS

## Deployment Order

### Phase 1: Infrastructure
1. [ ] Deploy admin app first
2. [ ] Verify admin authentication works
3. [ ] Create initial admin users
4. [ ] Test admin panel functionality

### Phase 2: Main Apps
Deploy in this order:
1. [ ] Main web app (sasarjan.com)
2. [ ] TalentExcel (talent.sasarjan.com)
3. [ ] SevaPremi (seva.sasarjan.com)
4. [ ] 10xGrowth (10xgrowth.sasarjan.com)

For each app:
- [ ] Run `pnpm build` locally first
- [ ] Deploy using `pnpm deploy:[app-name]`
- [ ] Verify deployment in Vercel dashboard
- [ ] Test app is accessible via domain
- [ ] Verify authentication works

## Post-Deployment Verification

### 1. Authentication Testing
- [ ] Test login/logout on each app
- [ ] Verify cross-app SSO works
- [ ] Test session persistence
- [ ] Verify cookie domain is correct
- [ ] Test OAuth providers (if configured)

### 2. Database Verification
- [ ] Check all tables are created
- [ ] Verify RLS policies are active
- [ ] Test data operations (CRUD)
- [ ] Monitor database performance

### 3. Security Checks
- [ ] Verify HTTPS on all domains
- [ ] Check secure cookie flags
- [ ] Test CORS configuration
- [ ] Verify no sensitive data in logs
- [ ] Check rate limiting works

### 4. Monitoring Setup
- [ ] Set up error tracking (Sentry/LogFlare)
- [ ] Configure uptime monitoring
- [ ] Set up alerts for failures
- [ ] Monitor initial user activity

## Rollback Plan

### If issues occur:
1. [ ] Document the issue clearly
2. [ ] Use Vercel instant rollback if needed
3. [ ] For database issues:
   - [ ] Stop all write operations
   - [ ] Assess data integrity
   - [ ] Use staging as reference
   - [ ] Apply fixes via new migration

### Emergency Contacts:
- Supabase Support: support@supabase.io
- Vercel Support: support@vercel.com
- Team Lead: [Add contact]
- Database Admin: [Add contact]

## Final Checks

- [ ] All apps accessible via their domains
- [ ] Authentication works across all apps
- [ ] No console errors in production
- [ ] Performance is acceptable
- [ ] Monitoring is active
- [ ] Team is notified of go-live
- [ ] Documentation is updated

## Post-Launch Tasks

- [ ] Monitor for first 24 hours
- [ ] Collect user feedback
- [ ] Address any urgent issues
- [ ] Plan first maintenance window
- [ ] Update deployment documentation

---

**Deployment Date**: _______________  
**Deployed By**: _______________  
**Verified By**: _______________