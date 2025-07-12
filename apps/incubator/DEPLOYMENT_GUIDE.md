# Incubator.in Deployment Guide

## Prerequisites
- Node.js 18+ installed
- pnpm installed (`npm install -g pnpm`)
- Vercel CLI installed (`npm install -g vercel`)
- Access to Supabase project
- Git repository access

## Step 1: Initial Setup

### 1.1 First, create the basic app structure
```bash
# From the monorepo root directory
cd /home/happy/projects/SaSarjan-AppStore

# Create the incubator app directory
mkdir -p apps/incubator/src/app
cd apps/incubator
```

### 1.2 Create package.json for the incubator app
```bash
# In apps/incubator directory
# Create this package.json file
```

Create `apps/incubator/package.json`:
```json
{
  "name": "@sasarjan/incubator",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3006",
    "build": "next build",
    "start": "next start -p 3006",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "clean": "rm -rf .next .turbo node_modules"
  },
  "dependencies": {
    "@sasarjan/auth": "workspace:*",
    "@sasarjan/database": "workspace:*",
    "@sasarjan/ui": "workspace:*",
    "@sasarjan/assets": "workspace:*",
    "@radix-ui/react-dialog": "^1.1.4",
    "@radix-ui/react-dropdown-menu": "^2.1.4",
    "@radix-ui/react-label": "^2.1.1",
    "@radix-ui/react-slot": "^1.1.1",
    "@supabase/ssr": "^0.5.2",
    "@supabase/supabase-js": "^2.47.3",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "framer-motion": "^11.15.0",
    "lucide-react": "^0.469.0",
    "mapbox-gl": "^3.8.0",
    "next": "15.2.1",
    "next-themes": "^0.4.5",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "tailwind-merge": "^2.6.0",
    "zustand": "^5.0.2"
  },
  "devDependencies": {
    "@types/mapbox-gl": "^3.4.1",
    "@types/node": "^22.5.4",
    "@types/react": "^19.0.2",
    "@types/react-dom": "^19.0.2",
    "autoprefixer": "^10.4.20",
    "eslint": "^8.57.0",
    "eslint-config-next": "15.2.1",
    "postcss": "^8.5.2",
    "tailwindcss": "^3.5.6",
    "typescript": "5.6.3"
  }
}
```

### 1.3 Create necessary configuration files

Create `apps/incubator/tsconfig.json`:
```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "target": "ES2015",
    "lib": ["dom", "dom.iterable", "esnext"],
    "plugins": [
      {
        "name": "next"
      }
    ],
    "strictNullChecks": true
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts"
  ],
  "exclude": ["node_modules"]
}
```

Create `apps/incubator/tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("@sasarjan/ui/tailwind.config")],
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}"
  ]
}
```

Create `apps/incubator/next.config.js`:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@sasarjan/ui", "@sasarjan/auth", "@sasarjan/database"],
  images: {
    domains: ['localhost', 'rvsxblqkjssvsccxvwbl.supabase.co'],
  },
}

module.exports = nextConfig
```

Create `apps/incubator/postcss.config.js`:
```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

Create `apps/incubator/.eslintrc.json`:
```json
{
  "extends": "next/core-web-vitals"
}
```

## Step 2: Create Basic App Structure

### 2.1 Create the root layout
Create `apps/incubator/src/app/layout.tsx`:
```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Incubator.in - Find Your Perfect Incubator Match',
  description: 'AI-powered discovery platform connecting startups with incubators, accelerators, and the innovation ecosystem',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
```

### 2.2 Create globals.css
Create `apps/incubator/src/app/globals.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 2.3 Create a basic home page
Create `apps/incubator/src/app/page.tsx`:
```typescript
export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">Incubator.in</h1>
      <p className="mt-4 text-lg text-gray-600">Coming Soon</p>
    </main>
  )
}
```

## Step 3: Vercel Deployment Configuration

### 3.1 Create vercel.json
Create `apps/incubator/vercel.json`:
```json
{
  "buildCommand": "cd ../.. && pnpm install --frozen-lockfile && pnpm build --filter=@sasarjan/incubator",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "installCommand": "echo 'Skipping install'",
  "env": {
    "NODE_ENV": "production"
  }
}
```

### 3.2 Create .vercelignore
Create `apps/incubator/.vercelignore`:
```
.env*.local
.git
.gitignore
README.md
.next
node_modules
```

### 3.3 Create .gitignore
Create `apps/incubator/.gitignore`:
```
# dependencies
node_modules
.pnp
.pnp.js

# testing
coverage

# next.js
.next/
out/

# production
build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# local env files
.env*.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
```

### 3.4 Create deployment script
Create `apps/incubator/deploy.sh`:
```bash
#!/bin/bash
echo "Deploying Incubator.in to Vercel..."
vercel --prod --yes
```

Make it executable:
```bash
chmod +x apps/incubator/deploy.sh
```

## Step 4: Update Root Configuration

### 4.1 Add incubator to root package.json scripts
In the root `package.json`, add these scripts:
```json
{
  "scripts": {
    // ... existing scripts
    "dev:incubator": "pnpm --filter @sasarjan/incubator dev",
    "build:incubator": "pnpm --filter @sasarjan/incubator build",
    "deploy:incubator": "pnpm --filter @sasarjan/incubator deploy"
  }
}
```

## Step 5: Build and Deploy Commands

### 5.1 Local Development
```bash
# From monorepo root
cd /home/happy/projects/SaSarjan-AppStore

# Install dependencies
pnpm install

# Start development server (runs on port 3006)
pnpm dev:incubator

# Or from the app directory
cd apps/incubator
pnpm dev
```

### 5.2 Build for Production
```bash
# From monorepo root
pnpm build:incubator

# Or from app directory
cd apps/incubator
pnpm build
```

### 5.3 Deploy to Vercel

#### Option 1: Using Vercel CLI (Recommended for first deployment)
```bash
# From monorepo root
cd apps/incubator

# Login to Vercel (first time only)
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

#### Option 2: Using deployment script
```bash
# From monorepo root
pnpm deploy:incubator

# Or from app directory
cd apps/incubator
./deploy.sh
```

#### Option 3: Connect to GitHub and auto-deploy
1. Push your code to GitHub
2. Go to https://vercel.com
3. Import your repository
4. Configure:
   - Root Directory: `apps/incubator`
   - Build Command: `cd ../.. && pnpm install --frozen-lockfile && pnpm build --filter=@sasarjan/incubator`
   - Output Directory: `.next`
   - Install Command: `echo 'Skipping install'`

## Step 6: Environment Variables

### 6.1 Create .env.local for development
Create `apps/incubator/.env.local`:
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App URLs
NEXT_PUBLIC_APP_URL=http://localhost:3006
NEXT_PUBLIC_WEB_URL=http://localhost:3000

# Security
JWT_SECRET=your_jwt_secret
HMAC_SECRET_KEY=your_hmac_secret

# Cookie settings
NEXT_PUBLIC_COOKIE_DOMAIN=localhost

# Optional
MAPBOX_ACCESS_TOKEN=your_mapbox_token
OPENAI_API_KEY=your_openai_key
```

### 6.2 Add environment variables in Vercel
1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add all the required variables for production

## Step 7: Verify Deployment

### 7.1 Check build locally
```bash
cd apps/incubator
pnpm build
pnpm start
# Visit http://localhost:3006
```

### 7.2 Check deployment
After deploying to Vercel, you'll get a URL like:
- Preview: `https://incubator-[hash].vercel.app`
- Production: `https://incubator.vercel.app` (or your custom domain)

## Troubleshooting

### Common Issues:

1. **Build fails with module not found**
   ```bash
   # From root directory
   pnpm install
   pnpm build --filter=@sasarjan/ui --filter=@sasarjan/auth --filter=@sasarjan/database
   ```

2. **Port already in use**
   - Change the port in package.json or use a different port
   - Kill the process: `lsof -ti:3006 | xargs kill -9`

3. **TypeScript errors**
   ```bash
   # Check types
   cd apps/incubator
   pnpm typecheck
   ```

4. **Vercel deployment fails**
   - Check build logs in Vercel dashboard
   - Ensure all environment variables are set
   - Verify package.json name matches filter in build command

## Next Steps
1. Set up database migrations for incubator tables
2. Implement the homepage components
3. Add authentication integration
4. Configure Mapbox for interactive maps
5. Set up monitoring and analytics

---

**Note**: Always test builds locally before deploying to production!