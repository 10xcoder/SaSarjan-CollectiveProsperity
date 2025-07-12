# Vercel Deployment Guide for SaSarjan AppStore

## Manual Deployment via Vercel Dashboard (Recommended)

Since CLI deployment is having issues with the monorepo structure, use the Vercel Dashboard:

### For 10xgrowth App:

1. Go to https://vercel.com/new
2. Import your Git repository
3. Configure with these settings:
   - **Root Directory**: `apps/10xgrowth`
   - **Framework Preset**: Next.js
   - **Build Command**: `cd ../.. && pnpm install --frozen-lockfile && pnpm build --filter=@sasarjan/10xgrowth`
   - **Output Directory**: `.next`
   - **Install Command**: `pnpm install --frozen-lockfile`
   - **Node Version**: 20.x

### For TalentExcel App:

1. Go to https://vercel.com/new
2. Import your Git repository
3. Configure with these settings:
   - **Root Directory**: `apps/talentexcel`
   - **Framework Preset**: Next.js
   - **Build Command**: `cd ../.. && pnpm install --frozen-lockfile && pnpm build --filter=@sasarjan/talentexcel`
   - **Output Directory**: `.next`
   - **Install Command**: `pnpm install --frozen-lockfile`
   - **Node Version**: 20.x

## Environment Variables

Make sure to add these in Vercel Dashboard for each app:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Any other app-specific variables

## Alternative: CLI Deployment

If you want to use CLI, first unlink any existing projects:

```bash
# From each app directory
cd apps/10xgrowth
vercel unlink

cd ../talentexcel
vercel unlink
```

Then deploy fresh:

```bash
# From root directory
vercel apps/10xgrowth --prod
# Follow prompts to set up new project with correct settings

vercel apps/talentexcel --prod
# Follow prompts to set up new project with correct settings
```