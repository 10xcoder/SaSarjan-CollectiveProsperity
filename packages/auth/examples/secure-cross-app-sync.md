# Secure Cross-App Sync Implementation

This guide demonstrates how to use the enhanced cross-app synchronization with HMAC signing and replay protection.

## Features

- **HMAC Signing**: All messages are signed with HMAC-SHA256
- **Replay Protection**: Nonce-based system prevents message replay
- **Message Age Validation**: Messages expire after 5 minutes
- **Secure Key Exchange**: Optional ECDH key exchange for encrypted communication
- **Trusted App Registry**: Only registered apps can communicate

## Basic Setup

### 1. Enable Secure Cross-App Sync in Your App

```tsx
// app/providers.tsx
import { UnifiedAuthProvider } from '@sasarjan/auth/client'

export function Providers({ children }: ProvidersProps) {
  const authConfig = {
    appId: 'your-app-id',
    appName: 'Your App Name',
    appUrl: process.env.NEXT_PUBLIC_APP_URL,
    
    // Enable secure cross-app sync
    enableSecureCrossAppSync: true,
    
    // Optional: Provide custom HMAC secret (recommended for production)
    hmacSecret: process.env.HMAC_SECRET_KEY,
    
    // Other auth config...
    useSecureTokens: true,
    cookieDomain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN,
  }
  
  return (
    <UnifiedAuthProvider config={authConfig}>
      {children}
    </UnifiedAuthProvider>
  )
}
```

### 2. Environment Variables

Add these to your `.env.local`:

```bash
# HMAC Secret for signing messages (generate a strong random key)
HMAC_SECRET_KEY=your-very-secure-random-key-at-least-32-chars

# App URLs for production
NEXT_PUBLIC_WEB_URL=https://sasarjan.com
NEXT_PUBLIC_ADMIN_URL=https://admin.sasarjan.com
NEXT_PUBLIC_TALENTEXCEL_URL=https://talentexcel.com
NEXT_PUBLIC_SEVAPREMI_URL=https://sevapremi.com
NEXT_PUBLIC_10XGROWTH_URL=https://10xgrowth.com
```

## Security Features in Action

### 1. HMAC Message Signing

All cross-app messages are automatically signed:

```typescript
// Behind the scenes, messages are signed like this:
const signedMessage = {
  type: 'SESSION_UPDATE',
  source: 'app-1',
  payload: { session },
  timestamp: 1703001234567,
  nonce: '1703001234567-abc123',
  signature: 'hmac-sha256-signature-here'
}
```

### 2. Replay Attack Prevention

Each message includes a unique nonce that can only be used once:

```typescript
// Nonces are tracked and validated
// Duplicate messages are automatically rejected
if (!nonceManager.validateAndConsume(message.nonce)) {
  console.warn('Duplicate message detected!')
  return // Message rejected
}
```

### 3. Message Age Validation

Messages older than 5 minutes are rejected:

```typescript
// Messages include timestamp
// Old messages are automatically rejected
if (Date.now() - message.timestamp > 5 * 60 * 1000) {
  console.warn('Message too old!')
  return // Message rejected
}
```

## Advanced: Encrypted Communication

For highly sensitive data, enable encrypted communication between apps:

### 1. Generate Key Pairs

```typescript
import { getKeyExchange } from '@sasarjan/auth/utils'

// Each app generates its own key pair
const keyExchange = getKeyExchange()
const { publicKey, privateKey } = await keyExchange.generateKeyPair()

// Share public key with other apps (can be done during registration)
// Keep private key secure
```

### 2. Establish Shared Secrets

```typescript
import { getSecureMessaging } from '@sasarjan/auth/utils'

const messaging = getSecureMessaging()

// When receiving another app's public key
await messaging.establishSharedSecret(
  'other-app-id',
  otherAppPublicKey,
  ourPrivateKey
)
```

### 3. Send Encrypted Messages

```typescript
// Create encrypted message
const secureMessage = await messaging.createMessage(
  'our-app-id',
  'other-app-id',
  { sensitiveData: 'secret-session-info' },
  { encrypt: true, sign: true }
)

// Message payload is now encrypted
console.log(secureMessage.encryptedData) // Encrypted base64
console.log(secureMessage.payload) // undefined (removed)
```

### 4. Receive and Decrypt Messages

```typescript
// Verify and decrypt received message
const result = await messaging.verifyMessage(
  receivedMessage,
  'expected-sender-id'
)

if (result.valid) {
  console.log('Decrypted payload:', result.payload)
} else {
  console.error('Invalid message:', result.error)
}
```

## Security Best Practices

1. **Use Strong HMAC Secrets**
   - Generate cryptographically random keys
   - Use different keys for different environments
   - Rotate keys periodically

2. **Register Trusted Apps**
   - Only registered apps can communicate
   - Verify app origins in production
   - Use strict permission controls

3. **Monitor Security Events**
   - Log failed signature verifications
   - Track replay attempts
   - Monitor for suspicious patterns

4. **Handle Errors Gracefully**
   - Don't expose security details in errors
   - Fail closed (deny by default)
   - Implement rate limiting

## Troubleshooting

### Message Not Received

1. Check if apps are registered as trusted
2. Verify HMAC secrets match
3. Check browser console for security warnings
4. Ensure BroadcastChannel is supported

### Signature Verification Failed

1. Ensure same HMAC secret across apps
2. Check message hasn't been modified
3. Verify timestamp is correct

### Nonce Already Used

1. This is expected for duplicate messages
2. Check if message is being sent multiple times
3. Verify nonce generation is working correctly

## Migration from Basic Cross-App Sync

To migrate from basic to secure cross-app sync:

1. Update auth config:
   ```tsx
   // Change from:
   enableCrossAppSync: true
   
   // To:
   enableSecureCrossAppSync: true
   hmacSecret: process.env.HMAC_SECRET_KEY
   ```

2. Deploy all apps with the same HMAC secret

3. The system maintains backward compatibility during migration