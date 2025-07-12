# Vercel Deployment Troubleshooting Guide

## 🚨 Common Deployment Issues & Solutions

This guide helps you quickly resolve common issues when deploying SaSarjan AppStore applications to Vercel.

## 📋 Quick Diagnosis Checklist

Before diving into specific issues:
- [ ] Check Vercel build logs for error messages
- [ ] Verify all environment variables are set
- [ ] Ensure local build works: `pnpm build --filter=@sasarjan/[app]`
- [ ] Check if issue is app-specific or affects all apps
- [ ] Review recent code changes that might cause issues

## 🔴 Build Failures

### 1. Module Not Found Errors

**Error Message:**
```
Module not found: Can't resolve '@sasarjan/ui'
```

**Solutions:**
```bash
# Solution 1: Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm build --filter=@sasarjan/[app-name]

# Solution 2: Check workspace dependencies
pnpm why @sasarjan/ui

# Solution 3: Ensure package is built first
pnpm build --filter=@sasarjan/ui
pnpm build --filter=@sasarjan/[app-name]
```

### 2. TypeScript Compilation Errors

**Error Message:**
```
Type error: Property 'X' does not exist on type 'Y'
```

**Solutions:**
```bash
# Run type check locally
pnpm typecheck

# Check for missing type definitions
pnpm add -D @types/[package-name]

# Update tsconfig.json if needed
{
  "compilerOptions": {
    "skipLibCheck": true,
    "strict": false // temporarily, fix types properly
  }
}
```

### 3. Out of Memory Errors

**Error Message:**
```
FATAL ERROR: Reached heap limit Allocation failed
```

**Solutions:**

Add to `package.json`:
```json
{
  "scripts": {
    "build": "NODE_OPTIONS='--max-old-space-size=4096' next build"
  }
}
```

Or in `vercel.json`:
```json
{
  "build": {
    "env": {
      "NODE_OPTIONS": "--max-old-space-size=4096"
    }
  }
}
```

### 4. Build Timeout

**Error Message:**
```
Error: The build exceeded the maximum time limit
```

**Solutions:**

1. **Optimize build process:**
```json
// next.config.js
module.exports = {
  swcMinify: true,
  experimental: {
    workerThreads: true,
    cpus: 4
  }
}
```

2. **Increase timeout in Vercel:**
   - Go to Project Settings → General
   - Increase Build & Development Settings timeout

3. **Use build cache:**
```json
// turbo.json
{
  "pipeline": {
    "build": {
      "cache": true,
      "outputs": [".next/**"]
    }
  }
}
```

## 🟡 Runtime Errors

### 1. Environment Variable Issues

**Error Message:**
```
Error: Missing required environment variable: SUPABASE_URL
```

**Solutions:**

1. **Verify variables in Vercel Dashboard:**
```bash
# List all variables
vercel env ls

# Pull to local .env
vercel env pull
```

2. **Check variable names (case-sensitive):**
```javascript
// ❌ Wrong
process.env.supabase_url

// ✅ Correct
process.env.SUPABASE_URL
```

3. **Ensure proper prefix for client variables:**
```env
# ❌ Won't work client-side
SUPABASE_URL=https://...

# ✅ Will work client-side
NEXT_PUBLIC_SUPABASE_URL=https://...
```

### 2. API Route Errors

**Error Message:**
```
Error: API handler should export a function
```

**Solutions:**

1. **Check API route exports:**
```typescript
// ❌ Wrong
export const handler = async (req, res) => {}

// ✅ Correct (App Router)
export async function GET(request: Request) {}
export async function POST(request: Request) {}

// ✅ Correct (Pages Router)
export default async function handler(req, res) {}
```

2. **Fix middleware issues:**
```typescript
// For App Router, use route handlers
// app/api/route/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ message: 'Hello' })
}
```

### 3. Database Connection Errors

**Error Message:**
```
Error: Connection timeout to database
```

**Solutions:**

1. **Add connection pooling:**
```typescript
// lib/db.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: ['error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

2. **Configure connection limits:**
```env
DATABASE_URL="postgresql://user:pass@host:5432/db?connection_limit=5&pool_timeout=0"
```

## 🔵 Deployment Configuration Issues

### 1. Wrong Output Directory

**Error Message:**
```
Error: No output directory found
```

**Solutions:**

Update `vercel.json`:
```json
{
  "outputDirectory": ".next",
  "buildCommand": "cd ../.. && pnpm build --filter=@sasarjan/app-name"
}
```

### 2. Monorepo Path Issues

**Error Message:**
```
Error: Cannot find package '@sasarjan/ui'
```

**Solutions:**

1. **Ensure correct build command:**
```json
{
  "buildCommand": "cd ../.. && pnpm build --filter=@sasarjan/app-name",
  "installCommand": "cd ../.. && pnpm install"
}
```

2. **Check pnpm workspace:**
```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

### 3. Function Size Limit Exceeded

**Error Message:**
```
Error: Function size exceeded 50MB limit
```

**Solutions:**

1. **Optimize imports:**
```javascript
// ❌ Imports entire library
import _ from 'lodash'

// ✅ Import only what's needed
import debounce from 'lodash/debounce'
```

2. **Use dynamic imports:**
```javascript
// Heavy component
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  ssr: false,
  loading: () => <p>Loading...</p>
})
```

3. **Externalize large dependencies:**
```javascript
// next.config.js
module.exports = {
  experimental: {
    outputFileTracingExcludes: {
      '*': ['node_modules/@swc/core-linux-x64-gnu'],
    },
  },
}
```

## 🟢 Performance Issues

### 1. Slow Build Times

**Solutions:**

1. **Enable Turborepo caching:**
```bash
# Local caching
turbo build --cache-dir=".turbo"

# Remote caching with Vercel
turbo build --token=$TURBO_TOKEN --team=$TURBO_TEAM
```

2. **Optimize Next.js build:**
```javascript
// next.config.js
module.exports = {
  experimental: {
    optimizeCss: true,
    legacyBrowsers: false,
  },
}
```

### 2. Large Bundle Sizes

**Solutions:**

1. **Analyze bundle:**
```bash
# Install analyzer
pnpm add -D @next/bundle-analyzer

# Run analysis
ANALYZE=true pnpm build
```

2. **Implement code splitting:**
```javascript
// Use dynamic imports
const Component = dynamic(() => import('./Component'))

// Route-based splitting
const Page = lazy(() => import('./pages/Page'))
```

## 🛠️ Debugging Tools

### 1. Vercel CLI Commands

```bash
# View deployment logs
vercel logs [deployment-url]

# List recent deployments
vercel list

# Inspect deployment
vercel inspect [deployment-url]

# Check project settings
vercel project
```

### 2. Build Logs Analysis

```bash
# Download build logs
vercel logs [deployment-url] > build.log

# Search for errors
grep -i "error" build.log
grep -i "failed" build.log

# Check memory usage
grep -i "heap" build.log
```

### 3. Local Reproduction

```bash
# Simulate Vercel build locally
VERCEL=1 pnpm build

# Test with production variables
NODE_ENV=production pnpm build
NODE_ENV=production pnpm start
```

## 📊 Monitoring & Alerts

### 1. Set Up Monitoring

```javascript
// app/api/health/route.ts
export async function GET() {
  try {
    // Check database
    await prisma.$queryRaw`SELECT 1`
    
    // Check external services
    const checks = {
      database: 'healthy',
      api: 'healthy',
      timestamp: new Date().toISOString()
    }
    
    return Response.json(checks)
  } catch (error) {
    return Response.json({ error: 'Unhealthy' }, { status: 500 })
  }
}
```

### 2. Error Tracking

```javascript
// lib/monitoring.ts
export function captureError(error: Error, context?: any) {
  console.error('Error:', error)
  
  // Send to monitoring service
  if (process.env.NODE_ENV === 'production') {
    // Sentry, LogRocket, etc.
  }
}
```

## 🚀 Quick Fixes

### Reset Everything
```bash
# Complete reset
rm -rf node_modules .next pnpm-lock.yaml
pnpm install
pnpm build
```

### Force Rebuild
```bash
# Clear Vercel cache and rebuild
vercel --force --prod
```

### Emergency Rollback
```bash
# List deployments
vercel list

# Promote previous deployment
vercel promote [deployment-url]
```

## 📞 Getting Help

1. **Check Vercel Status**: https://vercel-status.com/
2. **Vercel Documentation**: https://vercel.com/docs
3. **Next.js Discord**: https://discord.gg/nextjs
4. **Create Issue**: GitHub repository

---

**Pro Tip**: Always test deployments in preview environment first before promoting to production. Use `vercel --target preview` for safer deployments.