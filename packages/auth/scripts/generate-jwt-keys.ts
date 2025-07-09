#!/usr/bin/env node

import { generateJWTKeyPair } from '../src/utils/jwt'
import { writeFileSync } from 'fs'
import { resolve } from 'path'

async function generateKeys() {
  console.log('🔐 Generating JWT key pair...\n')
  
  try {
    // Generate RS256 key pair
    const { privateKey, publicKey } = await generateJWTKeyPair('RS256')
    
    // Create .env.example content
    const envExample = `# JWT Keys for Authentication
# Generate new keys using: pnpm -F @sasarjan/auth generate-keys

# Private key for signing tokens (keep secret!)
JWT_PRIVATE_KEY="${privateKey}"

# Public key for verifying tokens (can be shared)
JWT_PUBLIC_KEY="${publicKey}"

# Cookie signing secret (generate a strong random string)
COOKIE_SECRET=your-strong-random-cookie-secret-here

# Optional: Cookie domain for cross-subdomain auth
# COOKIE_DOMAIN=.sasarjan.com
`

    // Save to .env.example
    const envPath = resolve(process.cwd(), '../../../.env.example')
    writeFileSync(envPath, envExample, 'utf8')
    
    console.log('✅ Keys generated successfully!\n')
    console.log('📄 Keys saved to: .env.example\n')
    console.log('⚠️  IMPORTANT: ')
    console.log('1. Copy .env.example to .env.local in each app')
    console.log('2. NEVER commit .env.local files')
    console.log('3. Keep JWT_PRIVATE_KEY secret!')
    console.log('4. Generate a strong COOKIE_SECRET value')
    console.log('\n📋 To use in your apps:')
    console.log('cp .env.example apps/web/.env.local')
    console.log('cp .env.example apps/admin/.env.local')
    console.log('cp .env.example apps/talentexcel/.env.local')
    console.log('cp .env.example apps/sevapremi/.env.local')
    console.log('cp .env.example apps/10xgrowth/.env.local')
    
  } catch (error) {
    console.error('❌ Failed to generate keys:', error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  generateKeys()
}

export { generateKeys }