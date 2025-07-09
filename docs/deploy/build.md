# 🏗️ Build Guide: Production Build Process

**Purpose**: Build all apps for production deployment with optimization and validation

---

## 🚀 Quick Build Commands

### Production Build
```bash
# Build all apps
pnpm build

# Build specific app
pnpm build:web          # SaSarjan main app
pnpm build:talentexcel  # TalentExcel app
pnpm build:10xgrowth    # 10xGrowth app
pnpm build:sevapremi    # SevaPremi app
pnpm build:admin        # Admin dashboard
```

### Build Verification
```bash
# Check build artifacts
pnpm build:check

# Analyze bundle sizes
pnpm build:analyze

# Test production build locally
pnpm build && pnpm start
```

---

## 📋 Pre-Build Checklist

### Environment Setup
- [ ] **Node.js**: Version 22+ installed
- [ ] **pnpm**: Version 9+ installed
- [ ] **Dependencies**: `pnpm install` completed
- [ ] **Environment Variables**: All required vars set

### Code Quality
- [ ] **TypeScript**: `pnpm typecheck` passes
- [ ] **Linting**: `pnpm lint` passes
- [ ] **Tests**: `pnpm test` passes
- [ ] **Security**: `pnpm audit` clean

### Configuration
- [ ] **Next.js Config**: Production settings applied
- [ ] **Tailwind**: Purged unused styles
- [ ] **ESLint**: Production rules enabled
- [ ] **TypeScript**: Strict mode enabled

---

## 🔧 Build Process Details

### Turborepo Build Pipeline
```bash
# Turborepo handles dependencies and caching
pnpm build
```

**Build Order:**
1. `packages/ui` - Shared UI components
2. `packages/config` - Shared configuration
3. `packages/lib` - Shared utilities
4. `apps/web` - SaSarjan main app
5. `apps/talentexcel` - TalentExcel app
6. `apps/10x-growth` - 10xGrowth app
7. `apps/sevapremi` - SevaPremi app
8. `apps/admin` - Admin dashboard

### Next.js Build Configuration
```javascript
// next.config.js
module.exports = {
  output: 'standalone',
  experimental: {
    outputFileTracingRoot: path.join(__dirname, '../../'),
  },
  env: {
    NEXT_PHASE: 'production',
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sasarjan.app',
      },
    ],
  },
};
```

---

## 📊 Build Optimization

### Bundle Analysis
```bash
# Analyze bundle sizes
pnpm build:analyze

# View bundle analyzer
open apps/web/.next/analyze/client.html
```

### Tree Shaking
```javascript
// Ensure proper tree shaking
import { specificFunction } from 'library';  // ✅ Good
import * as library from 'library';         // ❌ Bad
```

### Code Splitting
```javascript
// Dynamic imports for code splitting
const DynamicComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <div>Loading...</div>,
  ssr: false,
});
```

### Image Optimization
```javascript
// Optimized images
import Image from 'next/image';

<Image
  src="/hero-image.jpg"
  alt="Hero"
  width={1200}
  height={600}
  priority
  placeholder="blur"
/>
```

---

## 🎯 Build Targets

### SaSarjan Main App
```bash
cd apps/web
pnpm build
```

**Build Output:**
- `.next/standalone/` - Standalone server
- `.next/static/` - Static assets
- `public/` - Public assets

**Key Features:**
- Prosperity wheel components
- Bundle selection interface
- Impact metrics dashboard
- Mobile-first responsive design

### TalentExcel App
```bash
cd apps/talentexcel
pnpm build
```

**Build Output:**
- Internship finder interface
- Location-based filtering
- Application management
- Profile system

### 10xGrowth App
```bash
cd apps/10x-growth
pnpm build
```

**Build Output:**
- Landing page builder
- Admin dashboard
- Analytics system
- SEO optimization

### SevaPremi App
```bash
cd apps/sevapremi
pnpm build
```

**Build Output:**
- Basic app structure
- Authentication system
- Core features
- Mobile optimization

### Admin Dashboard
```bash
cd apps/admin
pnpm build
```

**Build Output:**
- User management interface
- Content moderation tools
- Analytics dashboard
- System monitoring

---

## 🔍 Build Verification

### Artifact Validation
```bash
# Check build completeness
ls -la apps/web/.next/
ls -la apps/talentexcel/.next/
ls -la apps/10x-growth/.next/
ls -la apps/sevapremi/.next/
ls -la apps/admin/.next/
```

### Bundle Size Check
```bash
# Verify bundle sizes are reasonable
du -sh apps/*/next/static/chunks/
```

**Size Targets:**
- Main bundle: < 200KB
- Vendor bundle: < 500KB
- Total bundle: < 1MB
- Images: WebP/AVIF optimized

### Performance Validation
```bash
# Test production build locally
pnpm build
pnpm start

# Check performance
curl -o /dev/null -s -w "Time: %{time_total}s\n" http://localhost:3000
```

---

## 🚨 Build Troubleshooting

### Common Build Errors

#### TypeScript Errors
```bash
# Check TypeScript compilation
pnpm typecheck

# Fix common issues
pnpm typecheck --noEmit
```

#### Memory Issues
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
pnpm build
```

#### Dependency Issues
```bash
# Clear node_modules and reinstall
rm -rf node_modules
pnpm install
pnpm build
```

#### Cache Issues
```bash
# Clear Turborepo cache
pnpm turbo clean
rm -rf .turbo
pnpm build
```

### Build Optimization Issues

#### Large Bundle Size
```bash
# Analyze what's making bundle large
pnpm build:analyze

# Common fixes:
# 1. Remove unused dependencies
# 2. Use dynamic imports
# 3. Optimize images
# 4. Enable tree shaking
```

#### Slow Build Times
```bash
# Enable Turborepo caching
pnpm turbo build --cache-dir=.turbo

# Use parallel builds
pnpm build --parallel
```

---

## 🔐 Security in Build

### Environment Variables
```bash
# Build-time variables (public)
NEXT_PUBLIC_APP_URL=https://sasarjan.app
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Runtime variables (private)
SUPABASE_SERVICE_KEY=your-service-key
DATABASE_URL=postgresql://...
```

### Content Security Policy
```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval';"
          }
        ]
      }
    ];
  }
};
```

### Security Headers
```javascript
// middleware.ts
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  
  return response;
}
```

---

## 📦 Build Artifacts

### Docker Build
```dockerfile
# Dockerfile
FROM node:22-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
```

### Serverless Build
```bash
# Vercel build
vercel build --prod

# AWS Lambda build
pnpm build
zip -r function.zip .next/
```

---

## 🎯 Build Automation

### GitHub Actions
```yaml
# .github/workflows/build.yml
name: Build
on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Build application
        run: pnpm build
        env:
          NODE_ENV: production
      
      - name: Upload artifacts
        uses: actions/upload-artifact@v4
        with:
          name: build-output
          path: apps/*/next/
```

### Local Build Automation
```bash
# Create build script
cat > build.sh << 'EOF'
#!/bin/bash
set -e

echo "🏗️  Starting production build..."

# Pre-build checks
pnpm typecheck
pnpm lint
pnpm test:unit

# Build all apps
pnpm build

# Verify build
pnpm build:check

echo "✅ Build completed successfully!"
EOF

chmod +x build.sh
./build.sh
```

---

## 📈 Build Monitoring

### Build Analytics
```bash
# Track build metrics
pnpm build --profile

# Bundle analysis
pnpm build:stats
```

### Performance Monitoring
```javascript
// Track build performance
const buildStart = Date.now();
// ... build process ...
const buildTime = Date.now() - buildStart;
console.log(`Build completed in ${buildTime}ms`);
```

---

## 🎯 Production Readiness

### Build Validation Checklist
- [ ] All apps build successfully
- [ ] Bundle sizes within limits
- [ ] No TypeScript errors
- [ ] No security vulnerabilities
- [ ] Performance targets met
- [ ] All environment variables set

### Final Build Command
```bash
# Production-ready build
NODE_ENV=production pnpm build
```

---

**✅ Ready for deployment when build completes successfully and all validations pass.**