# Web Crypto API Encryption Implementation Guide

## Overview
Phase 1.3 has been successfully completed. We've replaced the weak XOR encryption with industry-standard Web Crypto API using AES-GCM encryption and PBKDF2 key derivation.

## New Features

### 1. Web Crypto Utilities (`crypto.ts`)
- **AES-GCM Encryption**: Military-grade 256-bit encryption
- **PBKDF2 Key Derivation**: 100,000 iterations for strong key generation
- **Secure Random Generation**: Cryptographically secure random bytes
- **HMAC Authentication**: Message authentication codes
- **Constant-Time Comparison**: Prevents timing attacks

### 2. Secure Storage (`secure-storage.ts`)
- **Encrypted Storage**: Automatic encryption/decryption of stored data
- **Multiple Backends**: Supports cookies, localStorage, and memory
- **Expiration Support**: Auto-expiring stored items
- **Batch Operations**: Efficient multi-item operations
- **Type Safety**: Full TypeScript support

### 3. Encrypted Token Manager (`encrypted-token-manager.ts`)
- **Token Encryption**: All tokens encrypted at rest
- **Automatic Migration**: Moves tokens from localStorage to cookies
- **Secure Caching**: In-memory cache with encryption
- **CSRF Integration**: Includes CSRF tokens automatically

### 4. Node.js Crypto (`crypto-node.ts`)
- **Server-Side Encryption**: Native Node.js crypto implementation
- **Key Management**: Environment-based master key system
- **Compatible API**: Same interface as browser crypto

## Implementation Details

### Encryption Process
```
1. Generate random salt (256 bits)
2. Derive key using PBKDF2 (100k iterations)
3. Generate random IV (96 bits for GCM)
4. Encrypt with AES-256-GCM
5. Store: ciphertext + salt + iv + tag
```

### Key Derivation
```typescript
PBKDF2(
  password,
  salt,
  iterations: 100000,
  keyLength: 256 bits,
  hash: SHA-256
)
```

### Encrypted Data Structure
```typescript
{
  ciphertext: string,  // Base64 encoded
  salt: string,        // Base64 encoded
  iv: string,          // Base64 encoded
  algorithm: "AES-GCM",
  iterations: 100000,
  keyLength: 256
}
```

## Usage Examples

### Client-Side Encryption
```typescript
import { encrypt, decrypt, generateEncryptionKey } from '@sasarjan/auth'

// Encrypt sensitive data
const encrypted = await encrypt('sensitive data', 'user-password')

// Decrypt data
const decrypted = await decrypt(encrypted, 'user-password')

// Generate secure key
const key = await generateEncryptionKey(256)
```

### Secure Storage
```typescript
import { getSecureStorage } from '@sasarjan/auth'

// Initialize secure storage
const storage = getSecureStorage({
  storageType: 'cookie',
  encryptionEnabled: true,
  encryptionPassword: process.env.STORAGE_ENCRYPTION_KEY
})

// Store encrypted data
await storage.setItem('user-prefs', {
  theme: 'dark',
  language: 'en'
}, {
  encrypt: true,
  expires: Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days
})

// Retrieve and decrypt
const prefs = await storage.getItem('user-prefs')
```

### Encrypted Token Manager
```typescript
import { getEncryptedTokenManager } from '@sasarjan/auth'

// Initialize with encryption
const tokenManager = getEncryptedTokenManager({
  encryptionPassword: process.env.TOKEN_ENCRYPTION_KEY,
  useCookies: true
})

// Store tokens (automatically encrypted)
await tokenManager.storeToken('access', token, expiresIn)

// Get decrypted token
const accessToken = await tokenManager.getAccessToken()
```

### Server-Side (Node.js)
```typescript
import { encryptNode, decryptNode, keyManager } from '@sasarjan/auth'

// Encrypt with custom password
const encrypted = await encryptNode('sensitive data', 'password')

// Decrypt
const decrypted = await decryptNode(encrypted, 'password')

// Use master key encryption
const masterEncrypted = await keyManager.encryptWithMasterKey('data')
const masterDecrypted = await keyManager.decryptWithMasterKey(masterEncrypted)
```

## Security Improvements

### Before (XOR Encryption)
- Simple XOR with hardcoded key
- No salt or IV
- Vulnerable to frequency analysis
- No authentication tag
- Weak key derivation

### After (Web Crypto API)
- AES-256-GCM encryption
- Random salt and IV for each encryption
- PBKDF2 with 100k iterations
- Built-in authentication (AEAD)
- Cryptographically secure

## Environment Variables

```env
# Master encryption key for server-side
MASTER_ENCRYPTION_KEY=<base64-encoded-256-bit-key>

# Token encryption password
TOKEN_ENCRYPTION_KEY=<strong-password>

# Storage encryption password
STORAGE_ENCRYPTION_KEY=<strong-password>
```

### Generate Keys
```bash
# Generate 256-bit key
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Generate strong password
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Migration Guide

### 1. Update Token Manager
```typescript
// Old
import { getTokenManager } from '@sasarjan/auth'
const tokenManager = getTokenManager()

// New - with encryption
import { getEncryptedTokenManager } from '@sasarjan/auth'
const tokenManager = getEncryptedTokenManager({
  encryptionPassword: process.env.TOKEN_ENCRYPTION_KEY
})
```

### 2. Use Secure Storage
```typescript
// Old - localStorage
localStorage.setItem('key', value)

// New - encrypted storage
const storage = getSecureStorage()
await storage.setItem('key', value, { encrypt: true })
```

### 3. Server-Side Encryption
```typescript
// Instead of custom encryption
import { encryptNode, decryptNode } from '@sasarjan/auth'

// Encrypt sensitive data before storing
const encrypted = await encryptNode(data, password)
await db.save({ data: encrypted })

// Decrypt when retrieving
const record = await db.find(id)
const data = await decryptNode(record.data, password)
```

## Best Practices

1. **Key Management**:
   - Never hardcode encryption keys
   - Use environment variables
   - Rotate keys periodically
   - Use different keys for different purposes

2. **Password Requirements**:
   - Minimum 128 bits of entropy
   - Use password managers for generation
   - Consider using passphrases

3. **Storage Security**:
   - Always encrypt sensitive data at rest
   - Use cookies for auth tokens
   - Set appropriate expiration times
   - Clear data on logout

4. **Performance Considerations**:
   - Cache decrypted data in memory
   - Use batch operations when possible
   - Consider async encryption for large data

## Compatibility

- **Browsers**: All modern browsers with Web Crypto API support
- **Node.js**: Version 14+ (uses native crypto module)
- **React Native**: Requires polyfill for Web Crypto API

## Next Steps

- Phase 2.1: Update all apps to use the new secure auth system
- Phase 2.2: Implement Redis-based session management
- Phase 2.3: Enhanced cross-app synchronization with HMAC