# CI/CD Guide for Vercel Deployments

## 🚀 Overview

This guide covers setting up automated deployments for SaSarjan AppStore using GitHub Actions and Vercel's Git integration.

## 🔧 Deployment Strategies

### 1. Vercel Git Integration (Recommended)
- Automatic deployments on push
- Preview deployments for PRs
- Zero configuration needed

### 2. GitHub Actions (Advanced)
- More control over deployment process
- Conditional deployments
- Custom build steps

### 3. Hybrid Approach
- Use Vercel for previews
- GitHub Actions for production

## 📋 Option 1: Vercel Git Integration

### Setup Steps

1. **Connect GitHub Repository**
   ```
   Vercel Dashboard → Import Project → Import Git Repository
   Select: SaSarjan-AppStore
   ```

2. **Configure Project Settings**
   - Root Directory: `./`
   - Framework Preset: Next.js
   - Build Command: `pnpm build --filter=@sasarjan/[app-name]`
   - Install Command: `pnpm install`

3. **Set Deploy Hooks**
   ```
   Production Branch: main
   Preview Branches: All other branches
   ```

### Per-App Configuration

Create `.vercel/project.json` in each app:

```json
{
  "projectId": "prj_xxxxx",
  "orgId": "team_xxxxx",
  "settings": {
    "framework": "nextjs",
    "buildCommand": "cd ../.. && pnpm build --filter=@sasarjan/10xgrowth",
    "installCommand": "cd ../.. && pnpm install",
    "outputDirectory": ".next"
  }
}
```

## 📋 Option 2: GitHub Actions

### Basic Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
  TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
  TURBO_TEAM: ${{ secrets.TURBO_TEAM }}

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 9.15.0
          
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'pnpm'
          
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
        
      - name: Build
        run: pnpm build
        
      - name: Deploy to Vercel
        run: |
          if [[ "${{ github.ref }}" == "refs/heads/main" ]]; then
            vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
          else
            vercel --token=${{ secrets.VERCEL_TOKEN }}
          fi
```

### Advanced Multi-App Workflow

```yaml
name: Deploy Apps

on:
  workflow_dispatch:
    inputs:
      app:
        description: 'App to deploy'
        required: true
        type: choice
        options:
          - all
          - web
          - 10xgrowth
          - talentexcel
          - sevapremi
          - admin
      environment:
        description: 'Deployment environment'
        required: true
        type: choice
        options:
          - production
          - preview
          - development

jobs:
  deploy:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        app: ${{ fromJson(github.event.inputs.app == 'all' && '["web", "10xgrowth", "talentexcel", "admin"]' || format('["{0}"]', github.event.inputs.app)) }}
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Environment
        uses: ./.github/actions/setup
        
      - name: Build ${{ matrix.app }}
        run: pnpm build --filter=@sasarjan/${{ matrix.app }}
        
      - name: Run Tests
        run: pnpm test --filter=@sasarjan/${{ matrix.app }}
        
      - name: Deploy ${{ matrix.app }}
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
        run: |
          if [[ "${{ github.event.inputs.environment }}" == "production" ]]; then
            pnpm deploy:${{ matrix.app }}
          else
            pnpm deploy:preview:${{ matrix.app }}
          fi
          
      - name: Notify Deployment
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `✅ Deployed ${{ matrix.app }} to ${{ github.event.inputs.environment }}`
            })
```

### Monorepo-Aware Deployment

```yaml
name: Smart Deploy

on:
  push:
    branches: [main]

jobs:
  detect-changes:
    runs-on: ubuntu-latest
    outputs:
      apps: ${{ steps.filter.outputs.changes }}
    steps:
      - uses: actions/checkout@v3
      
      - uses: dorny/paths-filter@v2
        id: filter
        with:
          filters: |
            web:
              - 'apps/web/**'
              - 'packages/**'
            10xgrowth:
              - 'apps/10xgrowth/**'
              - 'packages/**'
            talentexcel:
              - 'apps/talentexcel/**'
              - 'packages/**'
            admin:
              - 'apps/admin/**'
              - 'packages/**'
  
  deploy:
    needs: detect-changes
    if: ${{ needs.detect-changes.outputs.apps != '[]' }}
    runs-on: ubuntu-latest
    strategy:
      matrix:
        app: ${{ fromJson(needs.detect-changes.outputs.apps) }}
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy ${{ matrix.app }}
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
        run: pnpm deploy:${{ matrix.app }}
```

## 🔒 Setting Up Secrets

### Required GitHub Secrets

1. **Go to GitHub Repository Settings → Secrets**

2. **Add these secrets:**
   ```
   VERCEL_TOKEN          # Get from Vercel account settings
   VERCEL_ORG_ID         # Get from Vercel project settings
   VERCEL_PROJECT_ID     # Get from Vercel project settings
   TURBO_TOKEN          # For build caching (optional)
   TURBO_TEAM           # For build caching (optional)
   ```

3. **Per-app secrets (if needed):**
   ```
   VERCEL_PROJECT_ID_WEB
   VERCEL_PROJECT_ID_10XGROWTH
   VERCEL_PROJECT_ID_TALENTEXCEL
   VERCEL_PROJECT_ID_ADMIN
   ```

### Getting Vercel Tokens

```bash
# Get Vercel token
# Go to: https://vercel.com/account/tokens
# Create new token with appropriate scope

# Get project and org IDs
vercel project ls
# Or check .vercel/project.json after linking
```

## 🎯 Deployment Workflows

### 1. Feature Branch Workflow

```yaml
name: Feature Branch Deploy

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  deploy-preview:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy Preview
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
        run: |
          DEPLOYMENT_URL=$(vercel --token=$VERCEL_TOKEN --confirm)
          echo "Preview: $DEPLOYMENT_URL" >> $GITHUB_STEP_SUMMARY
          
      - name: Comment PR
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `🚀 Preview deployment ready: ${process.env.DEPLOYMENT_URL}`
            })
```

### 2. Production Release Workflow

```yaml
name: Production Release

on:
  release:
    types: [published]

jobs:
  deploy-all:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup
        uses: ./.github/actions/setup
        
      - name: Run Tests
        run: pnpm test
        
      - name: Build All Apps
        run: pnpm build
        
      - name: Deploy to Production
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
        run: |
          pnpm deploy:web
          pnpm deploy:10xgrowth
          pnpm deploy:talentexcel
          pnpm deploy:admin
          
      - name: Tag Deployment
        run: |
          git tag -a "deploy-${{ github.event.release.tag_name }}" -m "Production deployment"
          git push origin "deploy-${{ github.event.release.tag_name }}"
```

### 3. Scheduled Deployment

```yaml
name: Nightly Deploy

on:
  schedule:
    - cron: '0 2 * * *' # 2 AM UTC daily
  workflow_dispatch:

jobs:
  deploy-staging:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          ref: develop
          
      - name: Deploy to Staging
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
        run: |
          vercel --prod --token=$VERCEL_TOKEN --env=staging
```

## 🔄 Advanced CI/CD Features

### 1. Build Caching

```yaml
- name: Cache pnpm store
  uses: actions/cache@v3
  with:
    path: ~/.pnpm-store
    key: ${{ runner.os }}-pnpm-${{ hashFiles('**/pnpm-lock.yaml') }}
    restore-keys: |
      ${{ runner.os }}-pnpm-

- name: Cache Next.js build
  uses: actions/cache@v3
  with:
    path: |
      ${{ github.workspace }}/.next/cache
      ${{ github.workspace }}/**/.next/cache
    key: ${{ runner.os }}-nextjs-${{ hashFiles('**/pnpm-lock.yaml') }}
```

### 2. Parallel Deployments

```yaml
jobs:
  deploy-apps:
    strategy:
      matrix:
        include:
          - app: web
            scope: sasarjan-web
          - app: 10xgrowth
            scope: sasarjan-10xgrowth
          - app: talentexcel
            scope: sasarjan-talentexcel
      max-parallel: 3
    
    steps:
      - name: Deploy ${{ matrix.app }}
        run: vercel --prod --scope=${{ matrix.scope }}
```

### 3. Environment-Specific Deployments

```yaml
- name: Set Environment Variables
  run: |
    if [[ "${{ github.ref }}" == "refs/heads/main" ]]; then
      echo "ENVIRONMENT=production" >> $GITHUB_ENV
      echo "API_URL=https://api.sasarjan.com" >> $GITHUB_ENV
    elif [[ "${{ github.ref }}" == "refs/heads/develop" ]]; then
      echo "ENVIRONMENT=staging" >> $GITHUB_ENV
      echo "API_URL=https://staging-api.sasarjan.com" >> $GITHUB_ENV
    else
      echo "ENVIRONMENT=preview" >> $GITHUB_ENV
      echo "API_URL=https://preview-api.sasarjan.com" >> $GITHUB_ENV
    fi

- name: Deploy with Environment
  run: |
    vercel --prod \
      --env NEXT_PUBLIC_API_URL=${{ env.API_URL }} \
      --env NEXT_PUBLIC_ENVIRONMENT=${{ env.ENVIRONMENT }}
```

## 📊 Monitoring Deployments

### 1. Deployment Status Check

```yaml
- name: Check Deployment Status
  run: |
    DEPLOYMENT_URL=$(vercel --token=${{ secrets.VERCEL_TOKEN }} --confirm)
    
    # Wait for deployment to be ready
    for i in {1..30}; do
      STATUS=$(curl -s -o /dev/null -w "%{http_code}" $DEPLOYMENT_URL)
      if [[ $STATUS -eq 200 ]]; then
        echo "Deployment successful!"
        break
      fi
      echo "Waiting for deployment... (attempt $i/30)"
      sleep 10
    done
```

### 2. Post-Deployment Tests

```yaml
- name: Run E2E Tests
  run: |
    DEPLOYMENT_URL=$(vercel inspect --token=${{ secrets.VERCEL_TOKEN }} | grep "Preview:" | awk '{print $2}')
    CYPRESS_BASE_URL=$DEPLOYMENT_URL pnpm test:e2e
```

### 3. Deployment Notifications

```yaml
- name: Notify Slack
  if: success()
  uses: slackapi/slack-github-action@v1
  with:
    payload: |
      {
        "text": "Deployment Successful",
        "blocks": [{
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": "✅ *${{ matrix.app }}* deployed to production\n🔗 ${{ env.DEPLOYMENT_URL }}"
          }
        }]
      }
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

## 🛡️ Security Best Practices

1. **Use Environment-Specific Secrets**
2. **Enable Required Status Checks**
3. **Implement Deployment Approvals**
4. **Audit Deployment Logs**
5. **Rotate Tokens Regularly**

## 📚 Additional Resources

- [Vercel CLI Documentation](https://vercel.com/docs/cli)
- [GitHub Actions Documentation](https://docs.github.com/actions)
- [Turborepo Remote Caching](https://turbo.build/repo/docs/core-concepts/remote-caching)

---

**Pro Tip**: Start with Vercel Git Integration for simplicity, then add GitHub Actions for specific advanced workflows as needed.