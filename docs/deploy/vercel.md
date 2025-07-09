# 🔵 Vercel Deployment Guide

**Primary deployment platform for SaSarjan App Store**

---

## 🚀 Quick Deployment

### Automatic Deployment
```bash
# Push to main branch triggers deployment
git push origin main

# Manual deployment
vercel --prod
```

### Project Setup
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Link project
vercel link
```

---

## 📋 Vercel Configuration

### Project Settings
```json
{
  "name": "sasarjan-appstore",
  "version": 2,
  "framework": "nextjs",
  "buildCommand": "pnpm build",
  "outputDirectory": ".next",
  "installCommand": "pnpm install",
  "devCommand": "pnpm dev"
}
```

### Environment Variables
```bash
# Production environment variables
NEXT_PUBLIC_APP_URL=https://sasarjan.app
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=your-auth-secret
NEXTAUTH_URL=https://sasarjan.app
```

---

## 🎯 Multi-App Deployment

### App Configurations

#### SaSarjan Main App
```json
{
  "name": "sasarjan-main",
  "builds": [
    {
      "src": "apps/web/package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "apps/web/$1"
    }
  ]
}
```

#### TalentExcel App
```json
{
  "name": "talentexcel",
  "builds": [
    {
      "src": "apps/talentexcel/package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "apps/talentexcel/$1"
    }
  ]
}
```

#### 10xGrowth App
```json
{
  "name": "10xgrowth",
  "builds": [
    {
      "src": "apps/10x-growth/package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "apps/10x-growth/$1"
    }
  ]
}
```

#### SevaPremi App
```json
{
  "name": "sevapremi",
  "builds": [
    {
      "src": "apps/sevapremi/package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "apps/sevapremi/$1"
    }
  ]
}
```

#### Admin Dashboard
```json
{
  "name": "sasarjan-admin",
  "builds": [
    {
      "src": "apps/admin/package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "apps/admin/$1"
    }
  ]
}
```

---

## 🔧 GitHub Actions Integration

### Deployment Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v3
        with:
          version: 9

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'pnpm'

      - name: Install Vercel CLI
        run: npm install --global vercel@latest

      - name: Pull Vercel Environment
        run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}

      - name: Build Project
        run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}

      - name: Deploy to Vercel
        run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
```

### Required Secrets
```bash
# GitHub repository secrets
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-org-id
VERCEL_PROJECT_ID=your-project-id
```

---

## 🌐 Domain Configuration

### Production Domains
```bash
# Add custom domains
vercel domains add sasarjan.app
vercel domains add talentexcel.com
vercel domains add 10xgrowth.com
vercel domains add sevapremi.com
vercel domains add admin.sasarjan.app
```

### DNS Configuration
```dns
# DNS records for each domain
sasarjan.app        A     76.76.19.19
www.sasarjan.app    CNAME sasarjan.app
talentexcel.com     A     76.76.19.19
www.talentexcel.com CNAME talentexcel.com
10xgrowth.com       A     76.76.19.19
www.10xgrowth.com   CNAME 10xgrowth.com
sevapremi.com       A     76.76.19.19
www.sevapremi.com   CNAME sevapremi.com
admin.sasarjan.app  A     76.76.19.19
```

### SSL Certificates
```bash
# Automatic SSL via Vercel
# No manual configuration needed
# Certificates auto-renew
```

---

## ⚡ Performance Optimization

### Edge Functions
```javascript
// middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
  // Add performance headers
  const response = NextResponse.next();
  response.headers.set('X-Edge-Location', request.geo?.city || 'unknown');
  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

### CDN Configuration
```javascript
// next.config.js
module.exports = {
  images: {
    domains: ['cdn.sasarjan.app'],
    loader: 'custom',
    loaderFile: './lib/vercel-image-loader.js',
  },
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
  ],
};
```

### Image Optimization
```javascript
// lib/vercel-image-loader.js
export default function vercelImageLoader({ src, width, quality }) {
  return `https://cdn.sasarjan.app/${src}?w=${width}&q=${quality || 75}`;
}
```

---

## 📊 Monitoring & Analytics

### Vercel Analytics
```javascript
// pages/_app.js
import { Analytics } from '@vercel/analytics/react';

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  );
}
```

### Performance Monitoring
```javascript
// lib/vercel-insights.js
import { track } from '@vercel/analytics';

export function trackPerformance(event, data) {
  track(event, data);
}
```

### Error Tracking
```javascript
// lib/error-tracking.js
import { captureException } from '@sentry/nextjs';

export function reportError(error) {
  if (process.env.NODE_ENV === 'production') {
    captureException(error);
  }
}
```

---

## 🔐 Security Configuration

### Security Headers
```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
        ],
      },
    ];
  },
};
```

### Environment Security
```bash
# Secure environment variables
# Never commit these to repository
SUPABASE_SERVICE_KEY=your-service-key
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=your-auth-secret
STRIPE_SECRET_KEY=your-stripe-secret
```

---

## 🚨 Deployment Troubleshooting

### Common Issues

#### Build Failures
```bash
# Check build logs
vercel logs your-deployment-url

# Debug build locally
vercel dev
```

#### Environment Variables
```bash
# List environment variables
vercel env ls

# Add new environment variable
vercel env add VARIABLE_NAME
```

#### Domain Issues
```bash
# Check domain status
vercel domains ls

# Verify DNS propagation
dig sasarjan.app
```

#### Function Timeouts
```javascript
// Increase timeout for serverless functions
export const config = {
  maxDuration: 30, // seconds
};
```

### Rollback Process
```bash
# Rollback to previous deployment
vercel rollback

# Rollback to specific deployment
vercel rollback https://your-deployment-url.vercel.app
```

---

## 🔄 Deployment Workflow

### Branch-based Deployment
```bash
# Main branch -> Production
git push origin main

# Feature branch -> Preview
git push origin feature/new-feature
```

### Preview Deployments
```bash
# Every PR gets preview deployment
# Automatic URL: https://your-app-git-branch.vercel.app
```

### Production Deployment
```bash
# Manual production deployment
vercel --prod

# With alias
vercel --prod --alias sasarjan.app
```

---

## 📈 Scaling Configuration

### Serverless Functions
```javascript
// api/heavy-computation.js
export const config = {
  maxDuration: 30,
  memory: 3008, // MB
  regions: ['iad1', 'sfo1'], // Multiple regions
};
```

### Database Connections
```javascript
// lib/db.js
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### CDN Optimization
```javascript
// Static asset optimization
module.exports = {
  assetPrefix: 'https://cdn.sasarjan.app',
  images: {
    loader: 'custom',
    loaderFile: './lib/cdn-loader.js',
  },
};
```

---

## 🎯 Production Checklist

### Pre-deployment
- [ ] Build passes locally
- [ ] All tests pass
- [ ] Environment variables configured
- [ ] Domain DNS configured
- [ ] SSL certificates ready

### Deployment
- [ ] GitHub Actions workflow passes
- [ ] All apps deployed successfully
- [ ] Database migrations applied
- [ ] Health checks passing

### Post-deployment
- [ ] All domains accessible
- [ ] SSL certificates active
- [ ] Performance monitoring active
- [ ] Error tracking functional
- [ ] Analytics collecting data

---

## 🔧 Vercel CLI Commands

### Project Management
```bash
# List projects
vercel projects

# Switch project
vercel switch

# Remove project
vercel remove
```

### Environment Management
```bash
# List environments
vercel env ls

# Add environment variable
vercel env add

# Remove environment variable
vercel env rm
```

### Deployment Management
```bash
# List deployments
vercel deployments

# Inspect deployment
vercel inspect https://your-deployment-url.vercel.app

# Cancel deployment
vercel cancel
```

---

**✅ Production deployment complete when all apps are accessible and monitoring shows healthy status.**