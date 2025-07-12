# Vercel Deployment Guide for SaSarjan AppStore

## Overview

This guide covers the deployment of all SaSarjan AppStore applications to Vercel with proper authentication configuration.

## Prerequisites

- Vercel account (Pro recommended for team features)
- GitHub repository connected to Vercel
- Production Supabase project created
- Domain names configured and pointing to Vercel

## Deployment Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Vercel Edge Network                │
├──────────────┬──────────────┬──────────────┬────────┤
│   Main App   │  Admin App   │ TalentExcel  │  ...   │
│ sasarjan.com │admin.sasarjan│talent.sasarjan│       │
└──────┬───────┴──────┬───────┴──────┬───────┴────────┘
       │              │              │
       └──────────────┴──────────────┘
                      │
              ┌───────┴────────┐
              │   Supabase     │
              │  (PostgreSQL)  │
              └────────────────┘
```

## Step-by-Step Deployment

### 1. Initial Vercel Setup

1. **Import Repository**
   ```
   1. Go to https://vercel.com/new
   2. Import your GitHub repository
   3. Select "SaSarjan-AppStore"
   ```

2. **Configure Monorepo**
   - Vercel will auto-detect the monorepo structure
   - You'll need to create separate projects for each app

### 2. Create Vercel Projects

Create a project for each app:

#### Main Web App (sasarjan.com)
```
Project Name: sasarjan-web
Root Directory: ./
Build Command: pnpm build --filter=@sasarjan/web
Output Directory: apps/web/.next
Install Command: pnpm install
```

#### Admin App (admin.sasarjan.com)
```
Project Name: sasarjan-admin
Root Directory: ./
Build Command: pnpm build --filter=@sasarjan/admin
Output Directory: apps/admin/.next
Install Command: pnpm install
```

#### TalentExcel (talent.sasarjan.com)
```
Project Name: sasarjan-talentexcel
Root Directory: ./
Build Command: pnpm build --filter=@sasarjan/talentexcel
Output Directory: apps/talentexcel/.next
Install Command: pnpm install
```

#### SevaPremi (seva.sasarjan.com)
```
Project Name: sasarjan-sevapremi
Root Directory: ./
Build Command: pnpm build --filter=@sasarjan/sevapremi
Output Directory: apps/sevapremi/.next
Install Command: pnpm install
```

#### 10xGrowth (10xgrowth.sasarjan.com)
```
Project Name: sasarjan-10xgrowth
Root Directory: ./
Build Command: pnpm build --filter=@sasarjan/10xgrowth
Output Directory: apps/10xgrowth/.next
Install Command: pnpm install
```

### 3. Environment Variables Configuration

For **EACH** Vercel project, add these environment variables:

#### Required for All Apps:
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://[your-project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]

# Security Keys (use generated values)
JWT_SECRET=[from-generate-production-keys.sh]
HMAC_SECRET_KEY=[from-generate-production-keys.sh]
TOKEN_ENCRYPTION_KEY=[from-generate-production-keys.sh]
COOKIE_SECRET=[from-generate-production-keys.sh]

# Cookie Configuration
NEXT_PUBLIC_COOKIE_DOMAIN=.sasarjan.com
NODE_ENV=production

# App URLs
NEXT_PUBLIC_WEB_URL=https://sasarjan.com
NEXT_PUBLIC_ADMIN_URL=https://admin.sasarjan.com
NEXT_PUBLIC_TALENTEXCEL_URL=https://talent.sasarjan.com
NEXT_PUBLIC_SEVAPREMI_URL=https://seva.sasarjan.com
NEXT_PUBLIC_10XGROWTH_URL=https://10xgrowth.sasarjan.com
```

#### Additional for Admin App Only:
```bash
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]
ADMIN_EMAIL_WHITELIST=admin@sasarjan.com,team@sasarjan.com
```

### 4. Domain Configuration

For each project in Vercel:

1. Go to Project Settings → Domains
2. Add custom domain:
   - Main: `sasarjan.com` and `www.sasarjan.com`
   - Admin: `admin.sasarjan.com`
   - TalentExcel: `talent.sasarjan.com`
   - SevaPremi: `seva.sasarjan.com`
   - 10xGrowth: `10xgrowth.sasarjan.com`

3. Configure DNS (if not using Vercel DNS):
   ```
   Type: CNAME
   Name: [subdomain]
   Value: cname.vercel-dns.com
   ```

### 5. Deployment Commands

From your local machine:

```bash
# Deploy all apps to production
pnpm deploy:all

# Deploy individual apps
pnpm deploy:web
pnpm deploy:admin
pnpm deploy:talentexcel
pnpm deploy:sevapremi
pnpm deploy:10xgrowth

# Deploy to preview (staging)
pnpm deploy:preview:web
# ... etc
```

### 6. Post-Deployment Verification

#### Check Authentication Flow:
1. Visit https://admin.sasarjan.com
2. Login with admin credentials
3. Navigate to another app (e.g., https://talent.sasarjan.com)
4. Verify you're still logged in (SSO working)

#### Test Cross-Origin Requests:
```javascript
// In browser console on any app
fetch('https://admin.sasarjan.com/api/health', {
  credentials: 'include'
}).then(r => r.json()).then(console.log)
```

### 7. Monitoring Setup

1. **Vercel Analytics** (Built-in)
   - Automatically enabled for all projects
   - View at: https://vercel.com/[team]/[project]/analytics

2. **Error Tracking** (Optional)
   ```bash
   # Add to environment variables
   NEXT_PUBLIC_SENTRY_DSN=[your-sentry-dsn]
   SENTRY_AUTH_TOKEN=[your-auth-token]
   ```

3. **Custom Monitoring**
   - Set up alerts in Vercel for failed deployments
   - Configure uptime monitoring (e.g., Uptime Robot)

## Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Check locally first
   pnpm build --filter=@sasarjan/[app-name]
   ```

2. **Environment Variable Issues**
   - Verify all required variables are set
   - Check for typos in variable names
   - Ensure no trailing spaces

3. **Authentication Not Working**
   - Verify `NEXT_PUBLIC_COOKIE_DOMAIN` is `.sasarjan.com`
   - Check all apps have the same security keys
   - Ensure HTTPS is enabled

4. **CORS Errors**
   - Add allowed origins to Supabase dashboard
   - Verify app URLs in environment variables

### Debug Commands

```bash
# View Vercel logs
vercel logs [deployment-url]

# Check environment variables
vercel env ls

# Redeploy with clean cache
vercel --force
```

## Security Best Practices

1. **Environment Variables**
   - Never commit `.env` files
   - Use Vercel's environment variable UI
   - Rotate keys periodically

2. **Access Control**
   - Limit team member permissions
   - Use Vercel's preview deployments for testing
   - Enable 2FA on Vercel account

3. **Monitoring**
   - Set up alerts for failed deployments
   - Monitor authentication failures
   - Track API rate limits

## CI/CD Integration

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'
      
      - run: pnpm install
      - run: pnpm build
      - run: pnpm test
      
      - name: Deploy to Vercel
        run: |
          pnpm deploy:all
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
```

## Rollback Procedures

1. **Instant Rollback**
   - Go to Vercel dashboard
   - Select deployment
   - Click "Promote to Production" on previous deployment

2. **Git-based Rollback**
   ```bash
   git revert HEAD
   git push origin main
   ```

## Cost Optimization

1. **Vercel Usage**
   - Monitor bandwidth usage
   - Use ISR (Incremental Static Regeneration) where possible
   - Optimize images with next/image

2. **Edge Functions**
   - Keep middleware lightweight
   - Use edge config for feature flags

## Maintenance

### Regular Tasks
- [ ] Review and rotate security keys (quarterly)
- [ ] Update dependencies (monthly)
- [ ] Review error logs (weekly)
- [ ] Check performance metrics (weekly)

### Update Procedure
1. Test updates locally
2. Deploy to preview first
3. Run integration tests
4. Deploy to production during low-traffic period
5. Monitor for issues

---

**Support Contacts:**
- Vercel Support: support@vercel.com
- Supabase Support: support@supabase.com
- Internal Team: [Add your contact]