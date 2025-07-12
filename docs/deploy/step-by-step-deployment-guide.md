# Step-by-Step Vercel Deployment Guide

## 🚀 Quick Start Deployment

This guide provides practical, step-by-step instructions for deploying any SaSarjan AppStore application to Vercel.

## 📋 Pre-Deployment Checklist

Before deploying, ensure:
- [ ] You have Vercel CLI installed: `npm i -g vercel`
- [ ] You're logged into Vercel: `vercel login`
- [ ] You have access to the Vercel team/organization
- [ ] All code changes are committed to git
- [ ] Local build works: `pnpm build --filter=@sasarjan/[app-name]`

## 🎯 Deployment Steps

### Step 1: Initial Project Setup (First Time Only)

#### 1.1 Link Your Local Project to Vercel
```bash
# Navigate to project root
cd /path/to/SaSarjan-AppStore

# Link to Vercel (follow prompts)
vercel link
```

#### 1.2 Create App-Specific Vercel Configuration

For apps without vercel.json, create one:

**For 10xGrowth** (`apps/10xgrowth/vercel.json`):
```json
{
  "framework": "nextjs",
  "buildCommand": "cd ../.. && pnpm build --filter=@sasarjan/10xgrowth",
  "installCommand": "cd ../.. && pnpm install",
  "outputDirectory": ".next"
}
```

**For Web** (`apps/web/vercel.json`):
```json
{
  "framework": "nextjs",
  "buildCommand": "cd ../.. && pnpm build --filter=@sasarjan/web",
  "installCommand": "cd ../.. && pnpm install",
  "outputDirectory": ".next"
}
```

**For SevaPremi** (`apps/sevapremi/vercel.json`):
```json
{
  "framework": "nextjs",
  "buildCommand": "cd ../.. && pnpm build --filter=@sasarjan/sevapremi",
  "installCommand": "cd ../.. && pnpm install",
  "outputDirectory": ".next"
}
```

### Step 2: Configure Environment Variables

#### 2.1 Access Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Select your project
3. Navigate to Settings → Environment Variables

#### 2.2 Add Required Variables

**For ALL Apps**:
```bash
# Production Environment
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

**For 10xGrowth**:
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe (if using payments)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# App Config
USE_CMS_HOMEPAGE=false
NEXT_PUBLIC_APP_URL=https://10xgrowth.sasarjan.com
```

**For TalentExcel**:
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Maps
MAPBOX_ACCESS_TOKEN=pk_xxx

# Payments (India)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxx
RAZORPAY_KEY_SECRET=your-secret

# App Config
NEXT_PUBLIC_APP_URL=https://talent.sasarjan.com
```

### Step 3: Deploy Your App

#### 3.1 Using NPM Scripts (Recommended)

**Production Deployment**:
```bash
# From project root
pnpm deploy:10xgrowth    # For 10xGrowth
pnpm deploy:talentexcel  # For TalentExcel
pnpm deploy:web          # For main web
pnpm deploy:sevapremi    # For SevaPremi
pnpm deploy:admin        # For Admin
```

**Preview Deployment** (for testing):
```bash
pnpm deploy:preview:10xgrowth
pnpm deploy:preview:talentexcel
# ... etc
```

#### 3.2 Using Vercel CLI Directly

```bash
# Production deployment with scope
vercel --prod --scope=sasarjan-10xgrowth

# Preview deployment
vercel --scope=sasarjan-10xgrowth
```

#### 3.3 Deployment from App Directory

```bash
# Navigate to app directory
cd apps/10xgrowth

# Deploy using app-specific config
vercel --prod
```

### Step 4: Monitor Deployment

#### 4.1 Watch Build Logs
- Terminal will show real-time build progress
- Look for any errors or warnings
- Build typically takes 2-5 minutes

#### 4.2 Common Build Stages
1. **Installing dependencies** - pnpm install
2. **Running build** - Next.js build process
3. **Generating pages** - Static page generation
4. **Uploading** - Sending to Vercel

### Step 5: Verify Deployment

#### 5.1 Check Deployment URL
After successful deployment, you'll see:
```
✅ Production: https://your-app.vercel.app
```

#### 5.2 Test Critical Features
- [ ] Homepage loads correctly
- [ ] Navigation works
- [ ] API routes respond (check /api/health if available)
- [ ] Authentication works (login/logout)
- [ ] Database connections work
- [ ] Payment integrations work (if applicable)

### Step 6: Configure Custom Domain

#### 6.1 Add Domain in Vercel
1. Go to your project in Vercel Dashboard
2. Navigate to Settings → Domains
3. Add your custom domain:
   - 10xgrowth.sasarjan.com
   - talent.sasarjan.com
   - etc.

#### 6.2 Update DNS Records
Add CNAME record in your DNS provider:
```
Type: CNAME
Name: 10xgrowth (or subdomain)
Value: cname.vercel-dns.com
TTL: 3600
```

#### 6.3 Wait for Propagation
- DNS changes can take 0-48 hours
- Vercel will automatically provision SSL certificates

## 🔧 Advanced Deployment Options

### Deploy Specific Git Branch
```bash
# Deploy from feature branch
git checkout feature/new-feature
vercel --scope=sasarjan-10xgrowth
```

### Deploy with Build Environment Variables
```bash
vercel --prod \
  --scope=sasarjan-10xgrowth \
  --build-env NODE_ENV=production \
  --build-env ANALYZE=true
```

### Deploy with Alias
```bash
# Deploy and create custom alias
vercel --prod --alias beta-10xgrowth.sasarjan.com
```

## 🚨 Troubleshooting

### Build Fails with "Module not found"
```bash
# Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm build --filter=@sasarjan/10xgrowth
```

### Environment Variables Not Working
1. Check variable names match exactly (case-sensitive)
2. Ensure variables are set for correct environment (Production/Preview/Development)
3. Redeploy after adding variables

### Build Timeout
Add to vercel.json:
```json
{
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 60
    }
  }
}
```

### TypeScript Errors
```bash
# Check types locally first
pnpm typecheck

# Fix any errors before deploying
```

## 📊 Post-Deployment

### Monitor Performance
1. Check Vercel Analytics dashboard
2. Monitor Web Vitals scores
3. Set up alerts for errors

### Enable Vercel Features
- **Analytics**: Track page views and performance
- **Speed Insights**: Monitor Core Web Vitals
- **Edge Config**: Store configuration at edge
- **Cron Jobs**: Schedule functions

### Rollback if Needed
```bash
# List recent deployments
vercel ls

# Rollback to previous deployment
vercel rollback [deployment-url]
```

## 🎉 Success!

Your app is now deployed! Remember to:
- Test all critical features
- Monitor error logs
- Set up uptime monitoring
- Document any app-specific deployment steps

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Monorepo Guide](https://vercel.com/docs/monorepos)
- [Environment Variables](https://vercel.com/docs/environment-variables)

---

**Need Help?** 
- Check build logs in Vercel Dashboard
- Run `vercel logs` for recent logs
- Contact DevOps team for assistance