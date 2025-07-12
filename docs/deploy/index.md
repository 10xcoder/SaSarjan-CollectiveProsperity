# SaSarjan AppStore Deployment Documentation

## 📚 Overview

This directory contains comprehensive deployment documentation for all SaSarjan AppStore applications on Vercel. The platform consists of 5 Next.js applications deployed as a monorepo.

## 🗂️ Documentation Structure

### 📋 Core Guides

1. **[Vercel Deployment Plan](./vercel-deployment-plan.md)**
   - Executive overview of deployment strategy
   - Architecture and infrastructure details
   - Success metrics and monitoring

2. **[Step-by-Step Deployment Guide](./step-by-step-deployment-guide.md)**
   - Practical deployment instructions
   - Quick start commands
   - Domain configuration

3. **[Unified Deployment Guide](./unified-deployment-guide.md)** *(Existing)*
   - Original deployment documentation
   - Command reference
   - Best practices

### 🔧 Configuration Guides

4. **[Environment Variables Guide](./environment-variables-guide.md)**
   - Complete env var reference for all apps
   - Security best practices
   - Local development setup

5. **[CI/CD Guide](./ci-cd-guide.md)**
   - GitHub Actions workflows
   - Automated deployment setup
   - Advanced deployment strategies

### 🚨 Support Guides

6. **[Troubleshooting Guide](./troubleshooting-guide.md)**
   - Common deployment issues
   - Quick fixes and solutions
   - Debugging tools

## 🚀 Quick Start

### Deploy Any App in 3 Steps

1. **Set Environment Variables** (one-time)
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add SUPABASE_SERVICE_ROLE_KEY
   ```

2. **Deploy to Production**
   ```bash
   # From project root
   pnpm deploy:10xgrowth    # or any app name
   ```

3. **Verify Deployment**
   - Check the deployment URL
   - Test critical features
   - Monitor logs

## 📱 Applications

| App | Command | Domain | Guide Section |
|-----|---------|---------|--------------|
| Web | `pnpm deploy:web` | sasarjan.com | [Deploy Web](#) |
| 10xGrowth | `pnpm deploy:10xgrowth` | 10xgrowth.sasarjan.com | [Deploy 10xGrowth](#) |
| TalentExcel | `pnpm deploy:talentexcel` | talent.sasarjan.com | [Deploy TalentExcel](#) |
| SevaPremi | `pnpm deploy:sevapremi` | seva.sasarjan.com | [Deploy SevaPremi](#) |
| Admin | `pnpm deploy:admin` | admin.sasarjan.com | [Deploy Admin](#) |

## 🛠️ Common Tasks

### First-Time Setup
1. Read the [Step-by-Step Guide](./step-by-step-deployment-guide.md)
2. Configure [Environment Variables](./environment-variables-guide.md)
3. Set up [CI/CD](./ci-cd-guide.md) (optional)

### Regular Deployments
- Use the deployment commands from [Unified Guide](./unified-deployment-guide.md)
- Check [Troubleshooting](./troubleshooting-guide.md) for any issues

### Advanced Scenarios
- Multi-app deployments: See [CI/CD Guide](./ci-cd-guide.md)
- Performance optimization: Check [Deployment Plan](./vercel-deployment-plan.md)
- Security hardening: Review [Environment Variables Guide](./environment-variables-guide.md)

## 📊 Deployment Checklist

Before deploying any app:
- [ ] All tests pass locally
- [ ] Environment variables are set in Vercel
- [ ] Latest code is committed and pushed
- [ ] Previous deployment is stable
- [ ] Team is notified (for major updates)

## 🔗 External Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Turborepo Documentation](https://turbo.build/repo/docs)
- [pnpm Workspaces](https://pnpm.io/workspaces)

## 🤝 Contributing

To improve these docs:
1. Create a feature branch
2. Update relevant guides
3. Test your documentation
4. Submit a pull request

## 📞 Support

- **Deployment Issues**: Check [Troubleshooting Guide](./troubleshooting-guide.md)
- **Environment Setup**: See [Environment Variables Guide](./environment-variables-guide.md)
- **Automation Help**: Review [CI/CD Guide](./ci-cd-guide.md)

---

**Last Updated**: January 2025  
**Maintained by**: SaSarjan DevOps Team  
**Questions?** Contact the platform team or create an issue in the repository.