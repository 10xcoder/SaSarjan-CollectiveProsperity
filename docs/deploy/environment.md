# 🌍 Environment Configuration Guide

**Complete environment variable setup for all apps and environments**

---

## 🚀 Quick Setup

### Copy Environment Files
```bash
# Copy example files
cp .env.example .env.local
cp apps/web/.env.example apps/web/.env.local
cp apps/talentexcel/.env.example apps/talentexcel/.env.local
cp apps/10x-growth/.env.example apps/10x-growth/.env.local
cp apps/sevapremi/.env.example apps/sevapremi/.env.local
cp apps/admin/.env.example apps/admin/.env.local
```

### Generate Required Secrets
```bash
# Generate secure secrets
openssl rand -base64 32  # For NEXTAUTH_SECRET
openssl rand -base64 32  # For JWT_SECRET
openssl rand -base64 32  # For ENCRYPTION_KEY
```

---

## 📋 Environment Variables by Category

### 🔐 Authentication & Security
```bash
# NextAuth.js configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-here

# JWT configuration
JWT_SECRET=your-jwt-secret-here
JWT_EXPIRES_IN=7d

# Encryption key for sensitive data
ENCRYPTION_KEY=your-encryption-key-here

# Admin authentication
ADMIN_SECRET=your-admin-secret-here
```

### 🗄️ Database Configuration
```bash
# Supabase configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# Direct database connection
DATABASE_URL=postgresql://postgres:password@localhost:5432/sasarjan_appstore
DATABASE_DIRECT_URL=postgresql://postgres:password@localhost:5432/sasarjan_appstore

# Connection pooling
DATABASE_POOL_URL=postgresql://postgres:password@localhost:6543/sasarjan_appstore
```

### 🌐 App Configuration
```bash
# App URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_TALENTEXCEL_URL=http://localhost:3005
NEXT_PUBLIC_10XGROWTH_URL=http://localhost:3003
NEXT_PUBLIC_SEVAPREMI_URL=http://localhost:3002
NEXT_PUBLIC_ADMIN_URL=http://localhost:3004

# API endpoints
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### 💳 Payment Configuration
```bash
# Stripe configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Razorpay configuration (for Indian market)
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_key_id
```

### 📧 Email Configuration
```bash
# SMTP configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Email service (SendGrid, Mailgun, etc.)
SENDGRID_API_KEY=your-sendgrid-api-key
MAILGUN_API_KEY=your-mailgun-api-key
MAILGUN_DOMAIN=your-mailgun-domain
```

### 🗄️ Storage Configuration
```bash
# AWS S3 configuration
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=sasarjan-assets

# Cloudinary configuration
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
```

### 📊 Analytics & Monitoring
```bash
# Google Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Sentry error tracking
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# Vercel Analytics
VERCEL_ANALYTICS_ID=your-vercel-analytics-id
```

### 🔄 External Services
```bash
# Redis configuration
REDIS_URL=redis://localhost:6379

# OpenAI API (for AI features)
OPENAI_API_KEY=sk-your-openai-api-key

# Google Maps API (for location services)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Social media API keys
FACEBOOK_APP_ID=your-facebook-app-id
TWITTER_API_KEY=your-twitter-api-key
LINKEDIN_CLIENT_ID=your-linkedin-client-id
```

---

## 🎯 App-Specific Configuration

### SaSarjan Main App
```bash
# apps/web/.env.local
NEXT_PUBLIC_APP_NAME=SaSarjan
NEXT_PUBLIC_APP_DESCRIPTION=India's Premier App Store
NEXT_PUBLIC_APP_VERSION=1.0.0

# Features
NEXT_PUBLIC_PROSPERITY_WHEEL_ENABLED=true
NEXT_PUBLIC_BUNDLE_SYSTEM_ENABLED=true
NEXT_PUBLIC_LOCATION_SERVICES_ENABLED=true
```

### TalentExcel App
```bash
# apps/talentexcel/.env.local
NEXT_PUBLIC_APP_NAME=TalentExcel
NEXT_PUBLIC_APP_DESCRIPTION=Excel in Your Career Journey

# Features
NEXT_PUBLIC_INTERNSHIP_FINDER_ENABLED=true
NEXT_PUBLIC_SKILL_ASSESSMENT_ENABLED=true
NEXT_PUBLIC_CAREER_GUIDANCE_ENABLED=true
```

### 10xGrowth App
```bash
# apps/10x-growth/.env.local
NEXT_PUBLIC_APP_NAME=10xGrowth
NEXT_PUBLIC_APP_DESCRIPTION=Accelerate Your Business Growth

# Features
NEXT_PUBLIC_LANDING_PAGE_BUILDER_ENABLED=true
NEXT_PUBLIC_ANALYTICS_DASHBOARD_ENABLED=true
NEXT_PUBLIC_A_B_TESTING_ENABLED=true
```

### SevaPremi App
```bash
# apps/sevapremi/.env.local
NEXT_PUBLIC_APP_NAME=SevaPremi
NEXT_PUBLIC_APP_DESCRIPTION=Premium Service Platform

# Features
NEXT_PUBLIC_SERVICE_BOOKING_ENABLED=true
NEXT_PUBLIC_LOCATION_BASED_SERVICES_ENABLED=true
```

### Admin Dashboard
```bash
# apps/admin/.env.local
NEXT_PUBLIC_APP_NAME=SaSarjan Admin
NEXT_PUBLIC_APP_DESCRIPTION=Administrative Dashboard

# Admin features
NEXT_PUBLIC_USER_MANAGEMENT_ENABLED=true
NEXT_PUBLIC_CONTENT_MODERATION_ENABLED=true
NEXT_PUBLIC_ANALYTICS_ENABLED=true
NEXT_PUBLIC_SYSTEM_MONITORING_ENABLED=true
```

---

## 🌍 Environment-Specific Settings

### Development Environment
```bash
# .env.local
NODE_ENV=development
NEXT_PUBLIC_ENV=development

# Debug settings
DEBUG=true
NEXT_PUBLIC_DEBUG=true
LOG_LEVEL=debug

# Development URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Development database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/sasarjan_dev
```

### Staging Environment
```bash
# .env.staging
NODE_ENV=production
NEXT_PUBLIC_ENV=staging

# Staging URLs
NEXT_PUBLIC_APP_URL=https://staging.sasarjan.app
NEXT_PUBLIC_API_URL=https://staging.sasarjan.app/api

# Staging database
DATABASE_URL=postgresql://user:pass@staging-db.supabase.co:5432/postgres
```

### Production Environment
```bash
# .env.production (Vercel environment variables)
NODE_ENV=production
NEXT_PUBLIC_ENV=production

# Production URLs
NEXT_PUBLIC_APP_URL=https://sasarjan.app
NEXT_PUBLIC_API_URL=https://sasarjan.app/api

# Production database
DATABASE_URL=postgresql://user:pass@db.supabase.co:5432/postgres
```

---

## 🔧 Environment Variable Validation

### Schema Validation
```javascript
// lib/env.js
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production']),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_KEY: z.string().min(1),
  DATABASE_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url(),
});

export const env = envSchema.parse(process.env);
```

### Runtime Validation
```javascript
// lib/check-env.js
export function validateEnvironment() {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_KEY',
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}
```

---

## 🔐 Security Best Practices

### Secret Management
```bash
# Never commit secrets to git
echo "*.env*" >> .gitignore
echo "!.env.example" >> .gitignore

# Use different secrets for each environment
# Rotate secrets regularly
# Use strong, randomly generated secrets
```

### Environment Variable Security
```javascript
// Only expose necessary variables to client
const publicEnvVars = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
};

// Keep sensitive variables server-side only
const privateEnvVars = {
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,
  DATABASE_URL: process.env.DATABASE_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
};
```

### Encryption for Sensitive Data
```javascript
// lib/encryption.js
import crypto from 'crypto';

const algorithm = 'aes-256-gcm';
const key = Buffer.from(process.env.ENCRYPTION_KEY, 'base64');

export function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher(algorithm, key);
  cipher.setAAD(Buffer.from('SaSarjan'));
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const tag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${encrypted}:${tag.toString('hex')}`;
}
```

---

## 🛠️ Environment Management Tools

### Load Environment Variables
```javascript
// lib/load-env.js
import dotenv from 'dotenv';
import path from 'path';

// Load environment-specific file
const envFile = process.env.NODE_ENV === 'production' 
  ? '.env.production' 
  : '.env.local';

dotenv.config({ path: path.resolve(process.cwd(), envFile) });
```

### Environment Variable Helper
```javascript
// lib/env-helper.js
export function getEnvVar(name, defaultValue = null) {
  const value = process.env[name];
  
  if (!value && defaultValue === null) {
    throw new Error(`Environment variable ${name} is required`);
  }
  
  return value || defaultValue;
}

export function getBooleanEnvVar(name, defaultValue = false) {
  const value = process.env[name];
  return value ? value.toLowerCase() === 'true' : defaultValue;
}

export function getNumberEnvVar(name, defaultValue = 0) {
  const value = process.env[name];
  return value ? parseInt(value, 10) : defaultValue;
}
```

---

## 📋 Environment Setup Checklist

### Development Setup
- [ ] Copy `.env.example` to `.env.local`
- [ ] Generate secure secrets
- [ ] Configure database connection
- [ ] Set up authentication providers
- [ ] Configure payment providers (test mode)
- [ ] Set up email service (development)
- [ ] Configure analytics (development)

### Staging Setup
- [ ] Create staging database
- [ ] Set up staging domains
- [ ] Configure staging services
- [ ] Set up monitoring
- [ ] Test payment flows
- [ ] Verify email delivery

### Production Setup
- [ ] Create production database
- [ ] Configure production domains
- [ ] Set up SSL certificates
- [ ] Configure production services
- [ ] Set up monitoring and alerts
- [ ] Configure backup systems
- [ ] Test all integrations

---

## 🚨 Troubleshooting

### Common Issues

#### Missing Environment Variables
```bash
# Check if variables are loaded
node -e "console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)"

# Verify file exists
ls -la .env.local
```

#### Database Connection Issues
```bash
# Test database connection
node -e "
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query('SELECT NOW()', (err, res) => {
  console.log(err ? err : res.rows[0]);
  pool.end();
});
"
```

#### Environment Variable Loading
```javascript
// Debug environment loading
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Loaded env vars:', Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC_')));
```

---

## 🔧 Environment Variable Templates

### `.env.example` Template
```bash
# Copy this file to .env.local and fill in your values

# Database
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
DATABASE_URL=postgresql://postgres:password@localhost:5432/sasarjan_appstore

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=SaSarjan App Store

# Payment (Test Keys)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Storage
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=sasarjan-assets

# Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# Redis
REDIS_URL=redis://localhost:6379
```

---

**✅ Environment properly configured when all required variables are set and validation passes.**