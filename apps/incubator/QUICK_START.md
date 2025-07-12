# Incubator.in - Quick Start Guide

## 🚀 Quick Commands Reference

### Development
```bash
# From monorepo root (/home/happy/projects/SaSarjan-AppStore)
pnpm dev:incubator          # Start dev server on port 3006

# OR from app directory
cd apps/incubator
pnpm dev                    # Start dev server
```

### Building
```bash
# From monorepo root
pnpm build:incubator        # Build the incubator app

# OR from app directory  
cd apps/incubator
pnpm build                  # Build for production
```

### Deployment
```bash
# From app directory (first time)
cd apps/incubator
vercel                      # Deploy to preview
vercel --prod              # Deploy to production

# After first deployment
pnpm deploy:incubator      # From root directory
```

## 📋 Step-by-Step First Deployment

### 1. Initial Setup (One time only)
```bash
# From monorepo root
cd /home/happy/projects/SaSarjan-AppStore

# Install all dependencies
pnpm install

# Create the incubator app structure
mkdir -p apps/incubator
cd apps/incubator

# Copy the configuration files from the deployment guide
# (package.json, tsconfig.json, etc.)
```

### 2. Create Basic Files
```bash
# Create source directories
mkdir -p src/app

# Create the basic files as shown in deployment guide:
# - src/app/layout.tsx
# - src/app/page.tsx  
# - src/app/globals.css
# - vercel.json
# - next.config.js
# - tailwind.config.js
# - postcss.config.js
```

### 3. Test Locally
```bash
# From apps/incubator
pnpm dev
# Open http://localhost:3006
```

### 4. Deploy to Vercel
```bash
# Login to Vercel (first time only)
vercel login

# Deploy from apps/incubator directory
cd apps/incubator
vercel --prod

# Follow the prompts:
# - Link to existing project? No (first time)
# - What's your project name? incubator-in
# - In which directory is your code? ./ (current directory)
# - Want to override settings? No
```

### 5. Set Environment Variables
Go to Vercel Dashboard → Your Project → Settings → Environment Variables

Add these required variables:
```
NEXT_PUBLIC_SUPABASE_URL=<your-value>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-value>
JWT_SECRET=<your-value>
HMAC_SECRET_KEY=<your-value>
```

## 🔧 Common Tasks

### Update and Redeploy
```bash
# Make your changes, then:
cd apps/incubator
git add .
git commit -m "Update incubator app"
git push

# Vercel will auto-deploy if connected to GitHub
# OR manually deploy:
vercel --prod
```

### Check Logs
```bash
# From apps/incubator
vercel logs
```

### Add New Dependencies
```bash
# From apps/incubator
pnpm add <package-name>

# For dev dependencies
pnpm add -D <package-name>
```

### Clean Build
```bash
# From apps/incubator
pnpm clean
pnpm install
pnpm build
```

## 📱 Port Reference
- Web: 3000
- Incubator: 3006 ← Your app
- 10xgrowth: 3002
- Sevapremi: 3003
- Admin: 3004
- TalentExcel: 3005

## 🆘 Quick Fixes

**Port in use error:**
```bash
lsof -ti:3006 | xargs kill -9
```

**Module not found:**
```bash
cd ../..  # Go to root
pnpm install
pnpm build --filter=@sasarjan/ui --filter=@sasarjan/auth
```

**TypeScript errors:**
```bash
pnpm typecheck
```

**Clean everything:**
```bash
pnpm clean
rm -rf node_modules
pnpm install
```

---
Ready to build! 🚀 Start with `pnpm dev:incubator` from the root directory.