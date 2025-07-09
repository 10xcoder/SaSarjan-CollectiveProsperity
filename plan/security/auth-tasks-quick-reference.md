# Auth Security Tasks - Quick Reference

**Created**: 08-Jul-2025, Tuesday 21:45 IST  
**Purpose**: Quick lookup for all authentication security tasks

## Task IDs for Todo System

### Phase 1: Critical Security Fixes (HIGH PRIORITY)
- `auth-phase1-cookies` ✅ COMPLETED - Secure cookie implementation
- `auth-phase1-token-rotation` - JWT signing with RS256/ES256
- `auth-phase1-encryption` - Web Crypto API (AES-GCM)

### Phase 2: Centralized Auth (HIGH/MEDIUM)
- `auth-phase2-unify` - Update all apps to use @sasarjan/auth
- `auth-phase2-sessions` - Redis session management
- `auth-phase2-crossapp` - HMAC signing for cross-app sync

### Phase 3: Advanced Security (MEDIUM)
- `auth-phase3-ratelimit` - Rate limiting & fraud detection
- `auth-phase3-headers` - CSP and security headers
- `auth-phase3-audit` - Logging and monitoring

### Phase 4: Testing & Docs (LOW)
- `auth-phase4-testing` - Security testing
- `auth-phase4-docs` - Documentation

## Quick Commands

```bash
# View all auth tasks
cd /home/happy/projects/SaSarjan-AppStore
grep -A3 "auth-phase" plan/claude-todos/active-todos.json

# Build auth package
cd packages/auth && pnpm build

# Test cookie implementation
pnpm dev
# Check DevTools > Application > Cookies

# Run specific app with new auth
pnpm dev --filter=@sasarjan/web
```

## Key Files

### Implementation Files
- `/packages/auth/src/utils/cookie-storage.ts` - Client cookie handling
- `/packages/auth/src/server/cookie-handler.ts` - Server cookie handling
- `/packages/auth/src/server/csrf-middleware.ts` - CSRF protection
- `/packages/auth/src/client/token-manager.ts` - Updated for cookies

### Documentation
- `/plan/security/auth-security-implementation-plan.md` - Full plan
- `/packages/auth/docs/secure-cookies-implementation.md` - Phase 1.1 docs
- `/plan/claude-todos/active-todos.json` - All tasks tracked

## Next Session Checklist

1. [ ] Read auth security plan
2. [ ] Start with `auth-phase1-token-rotation`
3. [ ] Install jose package for JWT: `pnpm add jose`
4. [ ] Create JWT utilities in `/packages/auth/src/utils/jwt.ts`
5. [ ] Update TokenManager for JWT signing
6. [ ] Test token rotation with device fingerprints

## Environment Variables Needed

```env
# Add to all app .env files
COOKIE_SECRET=generate-strong-random-string
JWT_PRIVATE_KEY=generate-rsa-private-key
JWT_PUBLIC_KEY=corresponding-public-key
```

## Dependencies Map

```
Phase 1.1 (DONE) → Phase 1.2 → Phase 1.3
                         ↓
                    Phase 2.1
                         ↓
              ┌─────────┼─────────┐
         Phase 2.2  Phase 2.3     │
              ↓                   │
         Phase 3.1                │
         Phase 3.2                │
         Phase 3.3                │
              ↓                   │
         Phase 4.1 ←──────────────┘
              ↓
         Phase 4.2
```