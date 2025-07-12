#!/bin/bash

echo "Deploying TalentExcel to Vercel..."

# Navigate to root directory for monorepo
cd ../..

# Deploy using Vercel CLI with correct settings
vercel --cwd apps/talentexcel --prod

echo "Deployment complete!"