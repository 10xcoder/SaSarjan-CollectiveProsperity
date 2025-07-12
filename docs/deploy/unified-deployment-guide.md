# Unified Vercel Deployment Guide

## 🚀 **Overview**
This guide covers the unified deployment strategy for all SaSarjan AppStore applications using a centralized Vercel configuration.

## 📋 **Prerequisites**
- Vercel CLI installed: `npm i -g vercel`
- Vercel account with appropriate access
- Environment variables configured

## 🛠️ **Deployment Commands**

### **From Root Directory**
```bash
# Production deployments
pnpm deploy:web              # Deploy main web app
pnpm deploy:10xgrowth        # Deploy 10xGrowth app
pnpm deploy:talentexcel      # Deploy TalentExcel app
pnpm deploy:sevapremi        # Deploy SevaPremi app
pnpm deploy:admin            # Deploy Admin app

# Preview deployments
pnpm deploy:preview:web
pnpm deploy:preview:10xgrowth
pnpm deploy:preview:talentexcel
pnpm deploy:preview:sevapremi
pnpm deploy:preview:admin
```

### **Alternative: Direct Vercel Commands**
```bash
# From root directory
vercel --prod --scope=sasarjan-10xgrowth
vercel --prod --scope=sasarjan-talentexcel
vercel --prod --scope=sasarjan-web
vercel --prod --scope=sasarjan-sevapremi
vercel --prod --scope=sasarjan-admin
```

## ⚙️ **Configuration**

### **Root-Level Files**
- `vercel.json` - Unified configuration for all apps
- `.vercelignore` - Shared ignore patterns

### **Environment Variables**
Each app requires specific environment variables in Vercel dashboard:

**10xGrowth App:**
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
USE_CMS_HOMEPAGE=false
```

**TalentExcel App:**
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
MAPBOX_ACCESS_TOKEN=your_mapbox_token
```

## 🔧 **Build Configuration**

### **Monorepo Structure**
```
vercel.json (root)
├── apps/web/
├── apps/10xgrowth/
├── apps/talentexcel/
├── apps/sevapremi/
└── apps/admin/
```

### **Build Commands**
Each app uses Turbo build with filters:
```bash
cd ../.. && pnpm build --filter=@sasarjan/APP_NAME
```

## 📊 **Deployment Verification**

### **Build Success Checklist**
- [ ] TypeScript compilation passes
- [ ] All imports resolve correctly
- [ ] Environment variables loaded
- [ ] Static generation completes
- [ ] No critical ESLint errors

### **Post-Deployment Tests**
- [ ] Homepage loads correctly
- [ ] API routes respond
- [ ] Database connections work
- [ ] Authentication flows function
- [ ] Mobile responsiveness confirmed

## 🌐 **Domain Configuration**

### **Recommended Domains**
```
sasarjan.com           → Main web app
10xgrowth.sasarjan.com → 10xGrowth app
talent.sasarjan.com    → TalentExcel app
seva.sasarjan.com      → SevaPremi app
admin.sasarjan.com     → Admin app
```

## 🚨 **Troubleshooting**

### **Common Issues**
1. **Build Timeouts**: Increase Vercel timeout settings
2. **Missing Dependencies**: Check workspace dependencies
3. **Environment Variables**: Verify all required vars are set
4. **TypeScript Errors**: Fix type issues before deployment

### **Debug Commands**
```bash
# Local build test
pnpm build --filter=@sasarjan/10xgrowth

# Check environment
vercel env ls

# View deployment logs
vercel logs
```

## 🔄 **CI/CD Integration**

### **GitHub Actions Example**
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
      - name: Deploy 10xGrowth
        run: pnpm deploy:10xgrowth
```

## 📈 **Best Practices**

### **Pre-Deployment**
1. Always test builds locally first
2. Verify environment variables
3. Check for breaking changes
4. Run type checking

### **Post-Deployment**
1. Monitor deployment logs
2. Test critical user flows
3. Check performance metrics
4. Verify SEO metadata

---

**This unified approach ensures consistent deployment experience across all SaSarjan AppStore applications while maintaining proper monorepo structure and build optimization.**