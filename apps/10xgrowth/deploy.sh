#!/bin/bash

# Deploy 10xgrowth app to Vercel
echo "🚀 Deploying 10xgrowth app..."

# Deploy from root directory with proper scope
cd ../.. && vercel --prod --scope=sasarjan-code10xs-projects --yes apps/10xgrowth