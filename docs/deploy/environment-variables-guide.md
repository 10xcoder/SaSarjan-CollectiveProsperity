# Environment Variables & Secrets Management Guide

## 🔐 Overview

This guide covers best practices for managing environment variables and secrets across all SaSarjan AppStore applications on Vercel.

## 📋 Environment Variable Types

### 1. Public Variables (Client-side)
- Prefixed with `NEXT_PUBLIC_`
- Exposed to browser/client
- Used for non-sensitive configuration
- Examples: API URLs, public keys, feature flags

### 2. Private Variables (Server-side)
- No prefix required
- Only available server-side
- Used for sensitive data
- Examples: API secrets, database URLs, private keys

## 🗂️ Per-App Environment Variables

### 🌐 Web App (@sasarjan/web)

```env
# Public Variables
NEXT_PUBLIC_APP_URL=https://sasarjan.com
NEXT_PUBLIC_APP_NAME=SaSarjan AppStore
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Private Variables
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### 📈 10xGrowth App (@sasarjan/10xgrowth)

```env
# Public Variables
NEXT_PUBLIC_APP_URL=https://10xgrowth.sasarjan.com
NEXT_PUBLIC_APP_NAME=10x Growth
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
USE_CMS_HOMEPAGE=false

# Private Variables
SUPABASE_SERVICE_ROLE_KEY=eyJ...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
OPENAI_API_KEY=sk-...
RESEND_API_KEY=re_...
```

### 🎓 TalentExcel App (@sasarjan/talentexcel)

```env
# Public Variables
NEXT_PUBLIC_APP_URL=https://talent.sasarjan.com
NEXT_PUBLIC_APP_NAME=TalentExcel
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_...
MAPBOX_ACCESS_TOKEN=pk_...

# Private Variables
SUPABASE_SERVICE_ROLE_KEY=eyJ...
RAZORPAY_KEY_SECRET=...
SMS_API_KEY=...
EMAIL_SERVICE_KEY=...
```

### 🤝 SevaPremi App (@sasarjan/sevapremi)

```env
# Public Variables
NEXT_PUBLIC_APP_URL=https://seva.sasarjan.com
NEXT_PUBLIC_APP_NAME=SevaPremi
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Private Variables
SUPABASE_SERVICE_ROLE_KEY=eyJ...
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
SENDGRID_API_KEY=...
```

### 🛠️ Admin App (@sasarjan/admin)

```env
# Public Variables
NEXT_PUBLIC_APP_URL=https://admin.sasarjan.com
NEXT_PUBLIC_APP_NAME=Admin Dashboard
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Private Variables
SUPABASE_SERVICE_ROLE_KEY=eyJ...
ADMIN_EMAIL_WHITELIST=admin1@example.com,admin2@example.com
ADMIN_SECRET_KEY=...
MONITORING_API_KEY=...
```

## 🔧 Setting Environment Variables in Vercel

### Method 1: Vercel Dashboard (Recommended)

1. **Navigate to Project Settings**
   ```
   Vercel Dashboard → [Your Project] → Settings → Environment Variables
   ```

2. **Add Variables**
   - Click "Add New"
   - Enter Key and Value
   - Select environments:
     - ✅ Production
     - ✅ Preview
     - ⬜ Development (optional)

3. **Save and Redeploy**
   - Variables take effect on next deployment
   - Trigger redeployment for immediate effect

### Method 2: Vercel CLI

```bash
# Add a variable
vercel env add VARIABLE_NAME

# Add for specific environments
vercel env add VARIABLE_NAME production
vercel env add VARIABLE_NAME preview

# List all variables
vercel env ls

# Remove a variable
vercel env rm VARIABLE_NAME
```

### Method 3: Import from .env file

```bash
# Create .env.production file
echo "NEXT_PUBLIC_APP_URL=https://10xgrowth.sasarjan.com" > .env.production

# Import to Vercel
vercel env pull .env.production
```

## 🛡️ Security Best Practices

### 1. Never Commit Secrets
```bash
# Add to .gitignore
.env
.env.local
.env.production
.env.*.local
```

### 2. Use Different Values per Environment
```env
# Production
NEXT_PUBLIC_API_URL=https://api.sasarjan.com

# Preview/Staging  
NEXT_PUBLIC_API_URL=https://staging-api.sasarjan.com

# Development
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. Rotate Secrets Regularly
- API keys: Every 90 days
- Database passwords: Every 60 days
- Payment keys: As per provider guidelines

### 4. Principle of Least Privilege
- Only add variables needed by each app
- Don't share service keys across apps
- Use read-only keys where possible

## 📝 Local Development Setup

### 1. Create .env.local file
```bash
# For each app
cd apps/10xgrowth
touch .env.local
```

### 2. Add Development Variables
```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://[dev-project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### 3. Load Variables
```javascript
// Next.js automatically loads .env.local
// Access in code:
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Server only
```

## 🔄 Environment Variable Workflow

### Adding New Variables

1. **Define in Local Development**
   ```bash
   # Add to .env.local
   echo "NEW_API_KEY=dev_key_here" >> .env.local
   ```

2. **Test Locally**
   ```bash
   pnpm dev
   ```

3. **Add to Vercel**
   ```bash
   vercel env add NEW_API_KEY production
   ```

4. **Update Documentation**
   - Add to this guide
   - Update app-specific docs

### Updating Existing Variables

1. **Update in Vercel Dashboard**
2. **Trigger Redeployment**
   ```bash
   vercel --prod --force
   ```

3. **Verify Changes**
   - Check application logs
   - Test affected features

## 🚨 Common Issues & Solutions

### Variable Not Available
```javascript
// Debug: Log all env vars (dev only!)
console.log(process.env)

// Check if variable is defined
if (!process.env.MY_VARIABLE) {
  throw new Error('MY_VARIABLE is not defined')
}
```

### Variable Shows as Undefined
- Ensure correct prefix for client variables (`NEXT_PUBLIC_`)
- Restart dev server after adding variables
- Check variable is set for correct environment

### Build Fails Due to Missing Variable
```javascript
// Add validation in next.config.js
const requiredEnvVars = ['DATABASE_URL', 'API_KEY']
requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`)
  }
})
```

## 📊 Environment Variable Audit

### Regular Checks
- [ ] Review all variables quarterly
- [ ] Remove unused variables
- [ ] Update variable documentation
- [ ] Verify no secrets in code
- [ ] Check for hardcoded values

### Audit Commands
```bash
# List all variables
vercel env ls

# Check for exposed secrets
git secrets --scan

# Search for hardcoded values
grep -r "sk_live" --include="*.js" --include="*.ts"
```

## 🔗 Integration with CI/CD

### GitHub Actions
```yaml
env:
  VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
  NEXT_PUBLIC_APP_URL: ${{ vars.NEXT_PUBLIC_APP_URL }}
```

### Environment-Specific Deployments
```yaml
- name: Deploy to Production
  if: github.ref == 'refs/heads/main'
  run: vercel --prod --token=$VERCEL_TOKEN
  
- name: Deploy to Preview
  if: github.ref != 'refs/heads/main'
  run: vercel --token=$VERCEL_TOKEN
```

## 📚 Reference

### Naming Conventions
- Use UPPER_SNAKE_CASE
- Prefix public vars with NEXT_PUBLIC_
- Use descriptive names
- Group related variables

### Variable Templates
```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/db
REDIS_URL=redis://user:pass@host:6379

# Authentication
AUTH_SECRET=random-32-char-string
JWT_SECRET=another-random-string

# External Services
STRIPE_SECRET_KEY=sk_live_...
SENDGRID_API_KEY=SG...
TWILIO_AUTH_TOKEN=...

# Feature Flags
ENABLE_NEW_FEATURE=true
MAINTENANCE_MODE=false
```

---

**Security Note**: This document contains example values only. Never share actual secret values. Always use Vercel's encrypted environment variables for production secrets.