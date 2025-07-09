# 🔧 Troubleshooting Guide

**Common deployment issues and their solutions**

---

## 🚀 Quick Diagnostics

### Health Check Commands
```bash
# Check all systems
pnpm health:check

# Check specific app
pnpm health:check:web
pnpm health:check:talentexcel
pnpm health:check:10xgrowth
pnpm health:check:sevapremi
pnpm health:check:admin

# Check dependencies
pnpm audit
pnpm outdated
```

### Log Analysis
```bash
# View deployment logs
vercel logs --follow

# Check specific function logs
vercel logs --function=api/auth/callback

# Local development logs
pnpm dev --verbose
```

---

## 🚨 Common Issues & Solutions

### 1. Build Failures

#### TypeScript Compilation Errors
```bash
# Problem: TypeScript errors preventing build
ERROR: Type 'string' is not assignable to type 'number'

# Solution: Fix TypeScript issues
pnpm typecheck
# Fix reported errors in code

# Quick fix for urgent deployment
# Add to tsconfig.json (temporary)
{
  "compilerOptions": {
    "noEmit": false,
    "skipLibCheck": true
  }
}
```

#### Dependency Resolution Issues
```bash
# Problem: Module not found errors
Module not found: Can't resolve 'some-package'

# Solution: Clear cache and reinstall
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install

# Or use specific commands
pnpm install --frozen-lockfile
pnpm dedupe
```

#### Memory Issues During Build
```bash
# Problem: JavaScript heap out of memory
FATAL ERROR: Ineffective mark-compacts near heap limit

# Solution: Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
pnpm build

# Or in package.json
{
  "scripts": {
    "build": "NODE_OPTIONS='--max-old-space-size=4096' next build"
  }
}
```

### 2. Database Connection Issues

#### Connection Refused
```bash
# Problem: Database connection refused
Error: connect ECONNREFUSED 127.0.0.1:5432

# Solution: Check database status
# 1. Verify database is running
pg_isready -h localhost -p 5432

# 2. Check connection string
echo $DATABASE_URL

# 3. Test connection
psql $DATABASE_URL -c "SELECT version();"
```

#### Connection Pool Exhausted
```bash
# Problem: Too many database connections
Error: remaining connection slots are reserved

# Solution: Optimize connection pooling
# In lib/db.js
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10, // Reduce max connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

# Or use connection pooling service
DATABASE_URL=postgresql://user:pass@pooler.supabase.co:6543/postgres
```

#### Migration Failures
```bash
# Problem: Database migration failed
Error: relation "users" already exists

# Solution: Reset migrations
pnpm db:reset
pnpm db:migrate

# Or apply specific migration
pnpm supabase migration up --target 20240101000000
```

### 3. Authentication Issues

#### NextAuth Configuration
```bash
# Problem: Authentication not working
Error: [next-auth][error][CONFIG_ERROR_INVALID_OPTION]

# Solution: Check NextAuth configuration
# 1. Verify environment variables
echo $NEXTAUTH_URL
echo $NEXTAUTH_SECRET

# 2. Check providers configuration
# In pages/api/auth/[...nextauth].js
export default NextAuth({
  providers: [
    // Ensure providers are properly configured
  ],
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
});
```

#### Session Issues
```bash
# Problem: Session not persisting
Error: Session is null

# Solution: Check session configuration
# 1. Verify database adapter
# 2. Check session strategy
# 3. Ensure cookies are properly set
```

### 4. Environment Variable Issues

#### Missing Environment Variables
```bash
# Problem: Environment variable not found
Error: Environment variable NEXT_PUBLIC_SUPABASE_URL is required

# Solution: Check environment files
# 1. Verify .env.local exists
ls -la .env.local

# 2. Check variable is set
grep NEXT_PUBLIC_SUPABASE_URL .env.local

# 3. For production, check Vercel dashboard
vercel env ls
```

#### Environment Variable Loading
```javascript
// Problem: Environment variables not loading
console.log(process.env.NEXT_PUBLIC_SUPABASE_URL); // undefined

// Solution: Check variable naming
// ✅ Client-side variables must start with NEXT_PUBLIC_
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co

// ❌ Server-side variables are not accessible on client
SUPABASE_SERVICE_KEY=your-service-key // Only available server-side
```

### 5. API Route Issues

#### API Route Not Found
```bash
# Problem: API route returns 404
GET /api/users -> 404 Not Found

# Solution: Check file structure
# 1. Verify file exists
ls -la pages/api/users.js

# 2. Check file exports default function
export default function handler(req, res) {
  res.status(200).json({ message: 'Hello' });
}
```

#### CORS Issues
```bash
# Problem: CORS error in browser
Access to fetch at 'api/users' from origin 'localhost:3000' has been blocked by CORS policy

# Solution: Configure CORS
# In next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: 'https://yourdomain.com',
          },
        ],
      },
    ];
  },
};
```

### 6. Performance Issues

#### Slow Page Load
```bash
# Problem: Pages loading slowly
Time to First Byte: 5.2s

# Solution: Optimize performance
# 1. Check bundle size
pnpm build:analyze

# 2. Optimize images
# Use Next.js Image component
import Image from 'next/image';

# 3. Implement code splitting
const DynamicComponent = dynamic(() => import('./HeavyComponent'));
```

#### Memory Leaks
```bash
# Problem: Memory usage increasing over time
Memory usage: 1.2GB and growing

# Solution: Identify memory leaks
# 1. Check for unclosed connections
# 2. Remove event listeners
# 3. Clear timers and intervals
# 4. Use React DevTools Profiler
```

### 7. Deployment Issues

#### Vercel Deployment Failures
```bash
# Problem: Deployment fails on Vercel
Error: Command "pnpm build" exited with 1

# Solution: Debug deployment
# 1. Check build locally
pnpm build

# 2. Check deployment logs
vercel logs --follow

# 3. Verify environment variables
vercel env ls
```

#### Static Files Not Found
```bash
# Problem: Static assets return 404
GET /images/logo.png -> 404 Not Found

# Solution: Check static file location
# 1. Ensure files are in public/ directory
ls -la public/images/

# 2. Use correct import paths
import logo from '../public/images/logo.png';

# 3. Check next.config.js assetPrefix
```

---

## 🔍 Debugging Techniques

### 1. Enable Debug Mode
```javascript
// Enable Next.js debug mode
// In next.config.js
module.exports = {
  experimental: {
    debug: true,
  },
};

// Enable database query logging
// In lib/db.js
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  log: (message) => console.log(message),
});
```

### 2. Add Logging
```javascript
// Add comprehensive logging
// lib/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

export default logger;
```

### 3. Performance Profiling
```javascript
// Add performance monitoring
// lib/performance.js
export function measurePerformance(fn, name) {
  return async (...args) => {
    const start = performance.now();
    const result = await fn(...args);
    const end = performance.now();
    
    console.log(`${name} took ${end - start} milliseconds`);
    return result;
  };
}

// Usage
const optimizedQuery = measurePerformance(databaseQuery, 'Database Query');
```

---

## 🚨 Emergency Procedures

### 1. Immediate Rollback
```bash
# Rollback Vercel deployment
vercel rollback

# Rollback to specific deployment
vercel rollback https://your-app-git-commit.vercel.app

# Rollback Git commit
git revert HEAD
git push origin main
```

### 2. Database Recovery
```bash
# Restore from backup
pg_restore -d sasarjan_appstore backup.sql

# Or using Supabase
supabase db reset --db-url=$DATABASE_URL
```

### 3. Clear Cache
```bash
# Clear Vercel cache
vercel build --force

# Clear browser cache
# Add cache-busting headers
res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
```

---

## 📊 Monitoring for Issues

### 1. Set Up Alerts
```javascript
// lib/monitoring.js
export async function checkSystemHealth() {
  const checks = {
    database: await checkDatabase(),
    api: await checkAPI(),
    external_services: await checkExternalServices(),
  };

  const issues = Object.entries(checks)
    .filter(([_, status]) => status !== 'healthy')
    .map(([service, status]) => `${service}: ${status}`);

  if (issues.length > 0) {
    await sendAlert('System Health Issues', issues.join('\n'));
  }

  return checks;
}
```

### 2. Log Analysis
```bash
# Analyze logs for patterns
grep "ERROR" logs/combined.log | tail -50
grep "SLOW QUERY" logs/combined.log | tail -20
grep "Memory" logs/combined.log | tail -10
```

---

## 🔧 Preventive Measures

### 1. Pre-deployment Checks
```bash
# Create pre-deployment script
cat > scripts/pre-deploy.sh << 'EOF'
#!/bin/bash
set -e

echo "Running pre-deployment checks..."

# Code quality
pnpm typecheck
pnpm lint
pnpm test

# Security
pnpm audit --audit-level moderate

# Performance
pnpm build:analyze

echo "All checks passed! Ready for deployment."
EOF

chmod +x scripts/pre-deploy.sh
```

### 2. Health Monitoring
```javascript
// Set up continuous health monitoring
// lib/health-monitor.js
setInterval(async () => {
  const health = await checkSystemHealth();
  
  if (health.status !== 'healthy') {
    console.error('Health check failed:', health);
    await sendAlert('Health Check Failed', JSON.stringify(health, null, 2));
  }
}, 5 * 60 * 1000); // Check every 5 minutes
```

### 3. Automated Recovery
```javascript
// Implement automatic recovery
// lib/auto-recovery.js
export async function attemptRecovery(error) {
  switch (error.type) {
    case 'database_connection':
      await restartDatabaseConnection();
      break;
    case 'memory_leak':
      await restartProcess();
      break;
    case 'api_timeout':
      await scaleUp();
      break;
    default:
      await sendAlert('Manual Intervention Required', error.message);
  }
}
```

---

## 📋 Troubleshooting Checklist

### Before Deployment
- [ ] All tests passing
- [ ] Build completes successfully
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Security checks passed

### During Deployment
- [ ] Monitor deployment logs
- [ ] Check health endpoints
- [ ] Verify database connectivity
- [ ] Test critical user flows
- [ ] Monitor error rates

### After Deployment
- [ ] All apps accessible
- [ ] Performance within targets
- [ ] No critical errors
- [ ] Monitoring systems active
- [ ] Alerts configured

### When Issues Occur
- [ ] Check recent changes
- [ ] Review deployment logs
- [ ] Test locally
- [ ] Check external services
- [ ] Verify environment variables
- [ ] Consider rollback if critical

---

## 📞 Getting Help

### 1. Check Documentation
- Review relevant deployment guides
- Check Next.js documentation
- Review Vercel deployment docs
- Check Supabase documentation

### 2. Community Resources
- Stack Overflow for specific errors
- GitHub issues for package problems
- Discord/Slack communities
- Official support channels

### 3. Internal Support
- Check internal runbooks
- Contact development team
- Escalate to senior engineers
- Document new issues for future reference

---

## 🎯 Common Error Patterns

### Error Pattern Recognition
```javascript
// Common error patterns and solutions
const errorPatterns = {
  'ECONNREFUSED': 'Database connection issue - check DATABASE_URL',
  'Module not found': 'Dependency issue - run pnpm install',
  'Heap out of memory': 'Memory issue - increase NODE_OPTIONS',
  'Permission denied': 'File permission issue - check file permissions',
  'Port already in use': 'Port conflict - kill process or use different port',
  'CORS error': 'Cross-origin issue - configure CORS headers',
  'Hydration mismatch': 'SSR/Client mismatch - check conditional rendering',
  'API route not found': 'File structure issue - verify API route exists',
};

export function diagnoseError(error) {
  const pattern = Object.keys(errorPatterns).find(pattern => 
    error.message.includes(pattern)
  );
  
  return pattern ? errorPatterns[pattern] : 'Unknown error pattern';
}
```

---

**✅ System is stable when all health checks pass and no critical errors are occurring.**