# SaSarjan AppStore - Production Deployment Planning Session
**Date**: January 11, 2025  
**Topic**: Database synchronization and authentication deployment strategy

## Session Overview

This conversation covered planning the live deployment of the SaSarjan AppStore platform with a focus on:
- Database schema synchronization between local and production
- Authentication setup across multiple apps
- Production deployment procedures
- Security considerations

## Key Findings

### Database Architecture
- **Technology**: PostgreSQL with Supabase (no Prisma ORM)
- **Schema Management**: Git-versioned SQL migrations in `/supabase/migrations/`
- **Type Generation**: Manual TypeScript types from database schema
- **Environment Strategy**: Local → Staging → Production pipeline

### Authentication System
- **Architecture**: Centralized auth package (`@sasarjan/auth`) shared across apps
- **Cross-App SSO**: Cookie-based with `.sasarjan.com` domain
- **Security**: JWT tokens, HMAC signatures, encryption, CSRF protection
- **Session Management**: Activity tracking, automatic refresh, timeout handling

### Deployment Infrastructure
- **Hosting**: Vercel for apps, Supabase for database
- **Cost**: ~₹4,000/month total (₹2,500 Supabase + ₹1,500 Vercel)
- **Domains**: Main domain with subdomains for each app
- **CI/CD**: GitHub integration with Vercel auto-deployment

## Deliverables Created

### 1. Environment Configuration
- `.env.production.example` - Template with all required production variables
- Covers Supabase, security keys, URLs, and cookie configuration

### 2. Security Tools
- `scripts/generate-production-keys.sh` - Generates cryptographic keys
- Creates both symmetric keys and optional RSA key pairs
- Outputs to timestamped file with security warnings

### 3. Database Management Scripts
- `scripts/verify-database-schema.sh` - Compares local vs production schemas
- `scripts/deploy-database-production.sh` - Production migration with safety checks
- Includes backup creation, dry-run, and verification steps

### 4. Admin Setup Tools
- `scripts/setup-production-admin.sh` - Interactive admin user creation
- `scripts/create-production-admin.sql` - SQL template for admin users
- Secure password generation and credential management

### 5. Documentation
- `docs/deploy/production-deployment-checklist.md` - Complete deployment checklist
- `docs/deploy/vercel-deployment-guide.md` - Detailed Vercel setup instructions
- `docs/deploy/deployment-summary.md` - Infrastructure overview

## Key Decisions & Recommendations

### Data Migration Strategy
**Decision**: Fresh start approach - no test data migration to production
- Start with clean production database
- Create admin users manually
- Let real users register naturally
- Never expose production data to developers

### Security Measures
1. Generate unique security keys for production
2. Use HTTPS for all domains
3. Implement Row Level Security on all tables
4. Service role key only for admin app
5. Regular key rotation schedule

### Deployment Order
1. Infrastructure setup (Supabase, Vercel, domains)
2. Database deployment with schema verification
3. Admin app deployment and testing
4. Remaining apps in sequence
5. Cross-app SSO verification

## Technical Specifications

### Environment Variables Required
```bash
# Core (all apps)
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
JWT_SECRET
HMAC_SECRET_KEY
TOKEN_ENCRYPTION_KEY
COOKIE_SECRET
NEXT_PUBLIC_COOKIE_DOMAIN=.sasarjan.com

# App URLs
NEXT_PUBLIC_WEB_URL=https://sasarjan.com
NEXT_PUBLIC_ADMIN_URL=https://admin.sasarjan.com
NEXT_PUBLIC_TALENTEXCEL_URL=https://talent.sasarjan.com
NEXT_PUBLIC_SEVAPREMI_URL=https://seva.sasarjan.com
NEXT_PUBLIC_10XGROWTH_URL=https://10xgrowth.sasarjan.com

# Admin only
SUPABASE_SERVICE_ROLE_KEY
ADMIN_EMAIL_WHITELIST
```

### Vercel Project Configuration
```
Build Command: pnpm build --filter=@sasarjan/[app-name]
Output Directory: apps/[app-name]/.next
Install Command: pnpm install
```

## Action Items

### Immediate Next Steps
1. Run `./scripts/generate-production-keys.sh` to create security keys
2. Create production Supabase project
3. Configure DNS for all domains
4. Set up Vercel projects

### Pre-Deployment Checklist
1. Review all migration files
2. Test build locally for each app
3. Verify environment variables
4. Create initial admin users
5. Set up monitoring

### Post-Deployment
1. Monitor for 24 hours
2. Test all critical paths
3. Verify cross-app authentication
4. Document any issues
5. Plan maintenance windows

## Risk Mitigation

### Rollback Strategy
- Vercel instant rollback for apps
- Database migration rollback procedures
- Staging environment as reference
- Backup before any changes

### Security Considerations
- No production credentials in code
- Encrypted environment variables
- Access logging and monitoring
- Rate limiting on all endpoints

## Cost Analysis
- **Development**: Free (local Supabase)
- **Staging**: ~₹2,000/month (shared environment)
- **Production**: ~₹4,000/month total
  - Supabase: ~₹2,500/month
  - Vercel: ~₹1,500/month (if Pro needed)

## Conclusion

The deployment infrastructure is now ready with:
- Comprehensive documentation and checklists
- Automated tools for security and deployment
- Clear separation between environments
- Strong focus on security and data protection
- Cost-effective architecture

The zero-test-data approach ensures production integrity while the migration-based schema management provides version control and rollback capabilities.