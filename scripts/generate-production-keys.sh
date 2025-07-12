#!/bin/bash

# Generate secure keys for production environment
# This script generates cryptographically secure keys for production use

echo "🔐 Generating secure keys for production environment..."
echo ""
echo "⚠️  IMPORTANT: These keys are for production use only!"
echo "⚠️  Keep them secure and never commit them to version control!"
echo ""

# Function to generate a secure random key
generate_key() {
    openssl rand -base64 32 | tr -d "=\n" | tr '+/' '-_'
}

# Function to generate RSA key pair
generate_rsa_keys() {
    echo "Generating RSA key pair..."
    
    # Generate private key
    openssl genrsa -out jwt_private.pem 2048 2>/dev/null
    
    # Generate public key
    openssl rsa -in jwt_private.pem -pubout -out jwt_public.pem 2>/dev/null
    
    # Convert to single line format for environment variables
    JWT_PRIVATE_KEY=$(awk 'NF {sub(/\r/, ""); printf "%s\\n",$0;}' jwt_private.pem)
    JWT_PUBLIC_KEY=$(awk 'NF {sub(/\r/, ""); printf "%s\\n",$0;}' jwt_public.pem)
    
    # Clean up temporary files
    rm -f jwt_private.pem jwt_public.pem
    
    echo "✅ RSA keys generated"
}

# Generate symmetric keys
echo "🔑 Generating symmetric keys..."
JWT_SECRET=$(generate_key)
HMAC_SECRET_KEY=$(generate_key)
TOKEN_ENCRYPTION_KEY=$(generate_key)
COOKIE_SECRET=$(generate_key)

echo "✅ Symmetric keys generated"
echo ""

# Generate RSA keys
generate_rsa_keys
echo ""

# Create output file with timestamp
OUTPUT_FILE="production-keys-$(date +%Y%m%d-%H%M%S).env"

# Write keys to file
cat > "$OUTPUT_FILE" << EOF
# ========================================
# PRODUCTION SECURITY KEYS
# Generated on: $(date)
# ========================================
# ⚠️  KEEP THESE KEYS SECURE!
# ⚠️  NEVER COMMIT TO VERSION CONTROL!
# ========================================

# Symmetric Keys (Required)
JWT_SECRET=$JWT_SECRET
HMAC_SECRET_KEY=$HMAC_SECRET_KEY
TOKEN_ENCRYPTION_KEY=$TOKEN_ENCRYPTION_KEY
COOKIE_SECRET=$COOKIE_SECRET

# RSA Keys (Optional - for enhanced security)
JWT_PRIVATE_KEY=$JWT_PRIVATE_KEY
JWT_PUBLIC_KEY=$JWT_PUBLIC_KEY

# ========================================
# NEXT STEPS:
# 1. Copy these values to your .env.production file
# 2. Add them to Vercel environment variables
# 3. Delete this file after copying the values
# 4. Store a backup in a secure password manager
# ========================================
EOF

echo "✅ Keys saved to: $OUTPUT_FILE"
echo ""
echo "📋 Next steps:"
echo "1. Copy the values from $OUTPUT_FILE to your .env.production file"
echo "2. Add these values to Vercel environment variables for each app"
echo "3. Delete $OUTPUT_FILE after copying the values"
echo "4. Store a backup of these keys in a secure password manager"
echo ""
echo "⚠️  Remember: These keys should be different from your development keys!"

# Set restrictive permissions on the output file
chmod 600 "$OUTPUT_FILE"