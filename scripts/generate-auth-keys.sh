#!/bin/bash

# Generate secure keys for auth configuration
echo "Generating secure auth keys..."
echo ""

# Generate HMAC secret (32 characters)
HMAC_SECRET=$(openssl rand -hex 32)
echo "HMAC_SECRET_KEY=$HMAC_SECRET"
echo ""

# Generate Token Encryption Key (32 characters)
TOKEN_KEY=$(openssl rand -hex 32)
echo "TOKEN_ENCRYPTION_KEY=$TOKEN_KEY"
echo ""

# Generate JWT Secret (for server-side)
JWT_SECRET=$(openssl rand -hex 32)
echo "JWT_SECRET=$JWT_SECRET"
echo ""

echo "# Add these to your .env.local file:"
echo "# ======================================="
echo "# Auth Security Keys"
echo "HMAC_SECRET_KEY=$HMAC_SECRET"
echo "TOKEN_ENCRYPTION_KEY=$TOKEN_KEY"
echo "JWT_SECRET=$JWT_SECRET"
echo ""
echo "# Cookie Configuration"
echo "NEXT_PUBLIC_COOKIE_DOMAIN=.localhost # For local development"
echo "# NEXT_PUBLIC_COOKIE_DOMAIN=.yourdomain.com # For production"
echo ""
echo "# App URLs (adjust ports as needed)"
echo "NEXT_PUBLIC_WEB_URL=http://localhost:3000"
echo "NEXT_PUBLIC_ADMIN_URL=http://localhost:3004"
echo "NEXT_PUBLIC_TALENTEXCEL_URL=http://localhost:3001"
echo "NEXT_PUBLIC_SEVAPREMI_URL=http://localhost:3002"
echo "NEXT_PUBLIC_10XGROWTH_URL=http://localhost:3003"