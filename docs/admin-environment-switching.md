# Admin Panel Environment Switching

This document explains how to switch between different environments (local, staging, production) for the SaSarjan Admin Panel.

## Overview

The admin panel supports multiple environments with separate database configurations:

- **Local**: Local Supabase development instance
- **Staging**: Cloud Supabase staging environment
- **Production**: Cloud Supabase production environment

## Environment Files

Each environment has its own configuration file:

```
apps/admin/
├── .env.local.development  # Local development (active by default)
├── .env.local.staging      # Staging environment
├── .env.local.production   # Production environment
├── .env.local.example      # Template for new environments
└── .env.local              # Active environment (auto-generated)
```

## Quick Start

### Check Current Environment

```bash
# From project root
pnpm env:status

# Or from admin directory
cd apps/admin && pnpm env:status
```

### Switch Environments

```bash
# Switch to local development
pnpm env:local

# Switch to staging
pnpm env:staging

# Switch to production
pnpm env:production
```

### Manual Script Usage

```bash
# Using the script directly
./scripts/switch-env.sh local
./scripts/switch-env.sh staging
./scripts/switch-env.sh production

# Show current environment
./scripts/switch-env.sh
```

## Setting Up Cloud Environments

### 1. Create Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project for staging/production
3. Note down the project reference ID

### 2. Get API Keys

1. Go to Settings > API in your Supabase project
2. Copy the Project URL
3. Copy the `anon` key
4. Copy the `service_role` key

### 3. Configure Environment File

```bash
# Copy example file
cp apps/admin/.env.local.example apps/admin/.env.local.production

# Edit the file with your values
nano apps/admin/.env.local.production
```

Example configuration:

```bash
# Production Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://abcdefgh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...

# Environment
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://admin.yourdomain.com

# Database URL (get from Supabase Dashboard > Settings > Database)
DATABASE_URL=postgresql://postgres.abcdefgh:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres

# Environment marker
NEXT_PUBLIC_ENVIRONMENT=production
```

### 4. Deploy Schema to Cloud

```bash
# Link to your cloud project
supabase link --project-ref your-project-ref

# Push local schema to cloud
supabase db push

# Create admin user in cloud database
# (You'll need to run the admin setup SQL manually in cloud)
```

## Creating Admin Users in Cloud

After switching to cloud environment, you'll need to create admin users:

### Option 1: Using Supabase Dashboard

1. Go to Authentication > Users in Supabase Dashboard
2. Click "Add user"
3. Enter email and password
4. Go to Table Editor > admin_users
5. Insert a new record with the user's email

### Option 2: Using SQL (Recommended)

```sql
-- Insert admin user record
INSERT INTO admin_users (
  email,
  full_name,
  role,
  permissions,
  status
) VALUES (
  'admin@yourdomain.com',
  'Admin User',
  'super_admin',
  ARRAY['read', 'write', 'delete', 'manage_users', 'manage_apps', 'manage_revenue'],
  'active'
);

-- Then create auth user via Supabase Dashboard or API
```

## Development Workflow

### Daily Development

```bash
# Start with local environment
pnpm env:local
pnpm dev:admin
```

### Testing on Staging

```bash
# Switch to staging
pnpm env:staging
pnpm dev:admin

# Test your changes
# Switch back to local
pnpm env:local
```

### Production Deployment

```bash
# Switch to production for final testing
pnpm env:production
pnpm build:admin

# Deploy (using your preferred deployment method)
```

## Environment Variables Reference

| Variable                        | Description                | Example                          |
| ------------------------------- | -------------------------- | -------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project URL       | `https://abc.supabase.co`        |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public API key             | `eyJhbGci...`                    |
| `SUPABASE_SERVICE_ROLE_KEY`     | Service role key (admin)   | `eyJhbGci...`                    |
| `NODE_ENV`                      | Node environment           | `development`, `production`      |
| `NEXT_PUBLIC_APP_URL`           | Admin panel URL            | `http://localhost:3004`          |
| `DATABASE_URL`                  | Direct database connection | `postgresql://...`               |
| `NEXT_PUBLIC_ENVIRONMENT`       | Environment marker         | `local`, `staging`, `production` |

## Troubleshooting

### Environment Not Switching

```bash
# Check if script is executable
chmod +x scripts/switch-env.sh

# Check if environment file exists
ls -la apps/admin/.env.local.*
```

### Admin Login Issues

1. Verify admin user exists in `admin_users` table
2. Check user has `status = 'active'`
3. Ensure auth user exists in Supabase Auth
4. Verify environment is correctly configured

### Database Connection Issues

1. Check `NEXT_PUBLIC_SUPABASE_URL` is correct
2. Verify API keys are valid
3. Ensure database is accessible
4. Check network connectivity to Supabase

## Security Notes

- Never commit environment files to git
- Use different databases for staging and production
- Rotate API keys regularly
- Limit service role key usage to admin functions only
- Use strong passwords for admin accounts

## Scripts Reference

| Command                          | Description                      |
| -------------------------------- | -------------------------------- |
| `pnpm env:local`                 | Switch to local development      |
| `pnpm env:staging`               | Switch to staging environment    |
| `pnpm env:production`            | Switch to production environment |
| `pnpm env:status`                | Show current environment         |
| `./scripts/switch-env.sh --help` | Show script help                 |
