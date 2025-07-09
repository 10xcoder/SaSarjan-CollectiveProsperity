# 🚀 Deployment Guide: SaSarjan App Store

**Last Updated**: 08-Jul-2025, Tuesday 10:30 IST  
**Platform**: Multi-app monorepo (SaSarjan, TalentExcel, 10xGrowth, SevaPremi, Admin)

---

## 📋 Quick Start

### Development Testing
```bash
# Start all services
./scripts/dev-startup.sh

# Or manually
pnpm dev        # Start all apps
pnpm typecheck  # Check TypeScript
pnpm lint       # Check code quality
pnpm test       # Run E2E tests
```

### Production Build
```bash
pnpm build      # Build all apps
pnpm start      # Start production server
```

### Deployment Options
- **🔵 Vercel** (Primary) - Automated via GitHub Actions
- **🟠 Self-hosted** - Docker containers + reverse proxy
- **🟡 Manual** - Direct server deployment

---

## 📁 Documentation Structure

### Core Guides
- **[Testing Guide](./testing.md)** - How to test before deployment
- **[Build Guide](./build.md)** - Building for production
- **[Vercel Deployment](./vercel.md)** - Primary deployment platform
- **[Self-hosted Deployment](./self-hosted.md)** - Docker + server setup

### Configuration
- **[Environment Variables](./environment.md)** - All required env vars
- **[Database Setup](./database.md)** - Supabase configuration
- **[Security Configuration](./security.md)** - Headers, CORS, rate limiting

### Monitoring
- **[Monitoring & Alerts](./monitoring.md)** - Sentry, logs, metrics
- **[Troubleshooting](./troubleshooting.md)** - Common deployment issues

---

## 🎯 Deployment Checklist

### Pre-Deployment
- [ ] All tests passing (`pnpm test`)
- [ ] TypeScript compilation clean (`pnpm typecheck`)
- [ ] No linting errors (`pnpm lint`)
- [ ] Database migrations applied
- [ ] Environment variables configured
- [ ] Security headers enabled

### Production Deployment
- [ ] Build artifacts generated
- [ ] Database connections verified
- [ ] CDN/assets properly configured
- [ ] SSL certificates valid
- [ ] Monitoring tools active
- [ ] Backup systems operational

### Post-Deployment
- [ ] Health checks passing
- [ ] Performance metrics within targets
- [ ] Error rates below threshold
- [ ] User authentication working
- [ ] Payment systems functional
- [ ] Email notifications working

---

## 🔧 Quick Commands

### Development
```bash
pnpm dev                    # Start development servers
pnpm dev:web               # Start main SaSarjan app only
pnpm dev:talentexcel       # Start TalentExcel app only
pnpm dev:10xgrowth         # Start 10xGrowth app only
pnpm dev:sevapremi         # Start SevaPremi app only
pnpm dev:admin             # Start admin dashboard only
```

### Testing
```bash
pnpm test                  # Run all E2E tests
pnpm test:unit             # Run unit tests
pnpm test:integration      # Run integration tests
pnpm test:e2e              # Run end-to-end tests
```

### Building
```bash
pnpm build                 # Build all apps
pnpm build:web             # Build main app only
pnpm build:check           # Verify build artifacts
```

### Database
```bash
pnpm db:reset              # Reset local database
pnpm db:seed               # Seed with sample data
pnpm db:migrate            # Run pending migrations
pnpm db:generate           # Generate types from schema
```

---

## 🌍 Multi-App Architecture

### App Ports (Development)
- **SaSarjan Main**: `http://localhost:3000`
- **TalentExcel**: `http://localhost:3005`
- **10xGrowth**: `http://localhost:3003`
- **SevaPremi**: `http://localhost:3002`
- **Admin Dashboard**: `http://localhost:3004`

### Production Domains
- **SaSarjan**: `https://sasarjan.app`
- **TalentExcel**: `https://talentexcel.com`
- **10xGrowth**: `https://10xgrowth.com`
- **SevaPremi**: `https://sevapremi.com`
- **Admin**: `https://admin.sasarjan.app`

---

## 🔐 Security Considerations

### Essential Security Setup
1. **Environment Variables** - Never commit secrets
2. **HTTPS Only** - All production traffic encrypted
3. **CORS Configuration** - Restrict origins appropriately
4. **Rate Limiting** - Prevent abuse and DDoS
5. **Input Validation** - Sanitize all user inputs
6. **Error Handling** - Don't expose sensitive info

### Security Headers
```javascript
// Next.js security headers
{
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self'",
  'Strict-Transport-Security': 'max-age=31536000'
}
```

---

## 🚨 Emergency Procedures

### Rollback Process
1. **Vercel**: Use deployment history to rollback
2. **Self-hosted**: Switch to previous Docker image
3. **Database**: Restore from automated backup
4. **DNS**: Update records if needed

### Health Monitoring
- **Uptime**: `https://status.sasarjan.app`
- **Performance**: Lighthouse CI reports
- **Errors**: Sentry dashboard
- **Logs**: Vercel function logs

---

## 📞 Support & Troubleshooting

### Common Issues
- **Build Failures**: Check [troubleshooting.md](./troubleshooting.md)
- **Database Issues**: Verify connection strings
- **Performance**: Check [monitoring.md](./monitoring.md)
- **Security**: Review [security.md](./security.md)

### Getting Help
1. Check deployment logs first
2. Review relevant documentation section
3. Search existing GitHub issues
4. Contact development team

---

**🎯 Next Steps**: Choose your deployment method and follow the specific guide for detailed instructions.