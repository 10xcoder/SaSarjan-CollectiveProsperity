# Vercel Deployment Plan - SaSarjan AppStore

## 🎯 Executive Summary

This document outlines the comprehensive deployment strategy for all SaSarjan AppStore applications on Vercel. The platform consists of 5 Next.js applications deployed as a monorepo using pnpm workspaces and Turborepo.

## 📱 Applications Overview

| App Name | Package Name | Vercel Scope | Domain | Status |
|----------|--------------|--------------|---------|---------|
| Web (Main) | @sasarjan/web | sasarjan-web | sasarjan.com | Production Ready |
| 10xGrowth | @sasarjan/10xgrowth | sasarjan-10xgrowth | 10xgrowth.sasarjan.com | Production Ready |
| TalentExcel | @sasarjan/talentexcel | sasarjan-talentexcel | talent.sasarjan.com | Production Ready |
| SevaPremi | @sasarjan/sevapremi | sasarjan-sevapremi | seva.sasarjan.com | In Development |
| Admin | @sasarjan/admin | sasarjan-admin | admin.sasarjan.com | Production Ready |

## 🏗️ Deployment Architecture

### Monorepo Structure
```
SaSarjan-AppStore/
├── apps/
│   ├── web/              # Main landing page
│   ├── 10xgrowth/        # Business growth platform
│   ├── talentexcel/      # Learning platform
│   ├── sevapremi/        # Service platform
│   └── admin/            # Admin dashboard
├── packages/
│   ├── database/         # Shared Prisma client
│   ├── ui/              # Shared UI components
│   └── utils/           # Shared utilities
├── vercel.json          # Root Vercel config
├── .vercelignore        # Global ignore patterns
└── turbo.json           # Turborepo config
```

### Build Pipeline
1. **Install Phase**: pnpm install at root level
2. **Build Phase**: Turbo build with app-specific filters
3. **Output**: App-specific .next directories
4. **Deploy**: Upload to Vercel with scope isolation

## 🚀 Deployment Strategy

### 1. Initial Setup (One-time)

#### A. Vercel Account Setup
```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Link project (run from root)
vercel link
```

#### B. Create Vercel Projects
For each app, create a separate Vercel project:

```bash
# Create projects with specific scopes
vercel project add sasarjan-web
vercel project add sasarjan-10xgrowth
vercel project add sasarjan-talentexcel
vercel project add sasarjan-sevapremi
vercel project add sasarjan-admin
```

### 2. Environment Variables Setup

#### Per-App Configuration in Vercel Dashboard

**Common Variables (All Apps)**:
```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://[app-subdomain].sasarjan.com
```

**10xGrowth Specific**:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
USE_CMS_HOMEPAGE=false
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_key
STRIPE_SECRET_KEY=your_stripe_secret
```

**TalentExcel Specific**:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
MAPBOX_ACCESS_TOKEN=your_mapbox_token
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

**Admin Specific**:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ADMIN_EMAIL_WHITELIST=admin1@example.com,admin2@example.com
```

### 3. Deployment Workflows

#### A. Production Deployment
```bash
# From root directory
pnpm deploy:web              # Deploy main web app
pnpm deploy:10xgrowth        # Deploy 10xGrowth app
pnpm deploy:talentexcel      # Deploy TalentExcel app
pnpm deploy:sevapremi        # Deploy SevaPremi app
pnpm deploy:admin            # Deploy Admin app
```

#### B. Preview Deployment
```bash
# For testing and staging
pnpm deploy:preview:web
pnpm deploy:preview:10xgrowth
pnpm deploy:preview:talentexcel
pnpm deploy:preview:sevapremi
pnpm deploy:preview:admin
```

#### C. Manual Deployment (Alternative)
```bash
# Direct Vercel CLI usage
vercel --prod --scope=sasarjan-[app-name]

# With build output directory
vercel --prod --scope=sasarjan-10xgrowth --build-env TURBO_TEAM=team --build-env TURBO_TOKEN=token
```

### 4. CI/CD Integration

#### GitHub Actions Workflow
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]
  workflow_dispatch:
    inputs:
      app:
        description: 'App to deploy'
        required: true
        type: choice
        options:
          - all
          - web
          - 10xgrowth
          - talentexcel
          - sevapremi
          - admin

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: pnpm/action-setup@v2
        with:
          version: 9.15.0
          
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'pnpm'
          
      - name: Install dependencies
        run: pnpm install
        
      - name: Deploy Apps
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
        run: |
          if [ "${{ github.event.inputs.app }}" = "all" ]; then
            pnpm deploy:web
            pnpm deploy:10xgrowth
            pnpm deploy:talentexcel
            pnpm deploy:admin
          else
            pnpm deploy:${{ github.event.inputs.app }}
          fi
```

### 5. Domain Configuration

#### A. Domain Setup in Vercel
1. Navigate to each project in Vercel Dashboard
2. Go to Settings → Domains
3. Add custom domains:
   - Web: `sasarjan.com`, `www.sasarjan.com`
   - 10xGrowth: `10xgrowth.sasarjan.com`
   - TalentExcel: `talent.sasarjan.com`
   - SevaPremi: `seva.sasarjan.com`
   - Admin: `admin.sasarjan.com`

#### B. DNS Configuration
Add CNAME records pointing to `cname.vercel-dns.com`:
```
10xgrowth.sasarjan.com    CNAME    cname.vercel-dns.com
talent.sasarjan.com       CNAME    cname.vercel-dns.com
seva.sasarjan.com         CNAME    cname.vercel-dns.com
admin.sasarjan.com        CNAME    cname.vercel-dns.com
```

### 6. Performance Optimization

#### A. Build Optimization
- Use Turbo cache for faster builds
- Enable Vercel Remote Caching
- Optimize bundle sizes with next/dynamic

#### B. Runtime Optimization
- Enable ISR (Incremental Static Regeneration)
- Configure Edge Functions for API routes
- Use Vercel Analytics for monitoring

### 7. Security Best Practices

#### A. Environment Variables
- Never commit secrets to repository
- Use Vercel's encrypted environment variables
- Rotate keys regularly
- Use different keys for preview/production

#### B. Access Control
- Enable Vercel Authentication for preview deployments
- Restrict admin app access by IP/domain
- Implement proper CORS policies

### 8. Monitoring & Maintenance

#### A. Health Checks
- Set up uptime monitoring for each app
- Configure alerts for deployment failures
- Monitor build times and optimize

#### B. Regular Maintenance
- Update dependencies monthly
- Review and optimize build configurations
- Clean up old deployments
- Monitor usage and costs

## 📊 Deployment Checklist

### Pre-Deployment
- [ ] All tests passing locally
- [ ] TypeScript compilation successful
- [ ] ESLint checks passed
- [ ] Environment variables configured in Vercel
- [ ] Domain DNS configured

### Deployment
- [ ] Run deployment command
- [ ] Monitor build logs
- [ ] Verify successful deployment
- [ ] Check deployment URL

### Post-Deployment
- [ ] Test all critical user flows
- [ ] Verify API endpoints
- [ ] Check mobile responsiveness
- [ ] Monitor error rates
- [ ] Update status page

## 🚨 Troubleshooting Guide

### Common Issues

1. **Build Timeouts**
   - Solution: Increase timeout in Vercel settings
   - Alternative: Optimize build process

2. **Missing Dependencies**
   - Solution: Check pnpm-lock.yaml is committed
   - Run: `pnpm install --frozen-lockfile`

3. **Environment Variable Issues**
   - Solution: Verify all vars in Vercel dashboard
   - Check: Variable names match exactly

4. **TypeScript Errors**
   - Solution: Run `pnpm typecheck` locally
   - Fix all errors before deployment

5. **API Function Timeouts**
   - Solution: Optimize database queries
   - Consider: Edge Functions for better performance

## 📈 Success Metrics

- Build time < 5 minutes per app
- Deployment success rate > 99%
- Zero downtime deployments
- Page load time < 3 seconds
- Lighthouse score > 90

## 🔄 Continuous Improvement

1. Review deployment metrics monthly
2. Optimize build processes quarterly
3. Update dependencies regularly
4. Implement new Vercel features
5. Gather team feedback and iterate

---

**Last Updated**: [Current Date]
**Maintained By**: DevOps Team
**Review Cycle**: Monthly