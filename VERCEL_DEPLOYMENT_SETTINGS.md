# Vercel Deployment Settings for SaSarjan Apps

## When deploying, use these EXACT settings:

### For 10xGrowth App

Run: `pnpm deploy:10xgrowth`

When Vercel asks for configuration:
1. **Set up and deploy?** → Yes
2. **Which scope?** → SaSarjan Code10x's projects (or your personal account)
3. **Link to existing project?** → No (create new)
4. **What's your project's name?** → sasarjan-10xgrowth
5. **In which directory is your code located?** → `./` (just press enter, use current directory)
6. **Want to modify these settings?** → Yes

Then set:
- **Build Command**: `pnpm install && pnpm build --filter=@sasarjan/10xgrowth`
- **Output Directory**: `.next`
- **Install Command**: Leave blank (handled by build command)
- **Development Command**: `pnpm dev --filter=@sasarjan/10xgrowth`

### For TalentExcel App

Run: `pnpm deploy:talentexcel`

When Vercel asks for configuration:
1. **Set up and deploy?** → Yes
2. **Which scope?** → SaSarjan Code10x's projects (or your personal account)
3. **Link to existing project?** → No (create new)
4. **What's your project's name?** → sasarjan-talentexcel
5. **In which directory is your code located?** → `./` (just press enter, use current directory)
6. **Want to modify these settings?** → Yes

Then set:
- **Build Command**: `pnpm install && pnpm build --filter=@sasarjan/talentexcel`
- **Output Directory**: `.next`
- **Install Command**: Leave blank (handled by build command)
- **Development Command**: `pnpm dev --filter=@sasarjan/talentexcel`

## Important Notes:

1. We're deploying from the app directory but telling Vercel to install and build from the monorepo root
2. The build command includes `pnpm install` to ensure dependencies are installed
3. We use `--filter` to build only the specific app
4. The output directory is relative to the app directory (`.next`)

## If Deployment Fails:

1. Check that you're in the root directory of the monorepo
2. Ensure all dependencies are installed: `pnpm install`
3. Test the build locally: `pnpm build --filter=@sasarjan/10xgrowth`
4. Make sure you have the required environment variables set in Vercel

## Environment Variables to Set in Vercel Dashboard:

After deployment, go to the project settings and add:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
JWT_SECRET=your-jwt-secret
HMAC_SECRET_KEY=your-hmac-secret
TOKEN_ENCRYPTION_KEY=your-encryption-key
COOKIE_SECRET=your-cookie-secret
NEXT_PUBLIC_COOKIE_DOMAIN=.sasarjan.com
NODE_ENV=production
```