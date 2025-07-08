# Infrastructure - Security Prompts

## Quick Reference
- **Time Estimate**: 3-4 hours total
- **Dependencies**: None ✅
- **Apps Affected**: All apps, primarily Admin
- **Priority**: CRITICAL ⚠️

---

## 🔒 **2FA Authentication**

### **PROMPT 1: Admin 2FA Implementation**
**Time**: 1-2 hours

```
Implement 2FA for admin authentication in the SaSarjan platform:

1. **2FA Setup Flow**:
   - Add 2FA setup page in /apps/admin/src/app/auth/setup-2fa
   - Generate TOTP secret using `speakeasy` or `otpauth`
   - Display QR code for Google Authenticator setup
   - Verify initial setup with test code

2. **Login Integration**:
   - Modify login flow in /apps/admin/src/app/auth/login
   - Add 2FA code input field after password verification
   - Verify TOTP codes against stored secret
   - Handle 2FA failures with proper error messages

3. **Backup Codes**:
   - Generate 10 single-use backup codes
   - Store encrypted backup codes in database
   - Allow backup code usage during login
   - Provide backup code download/print option

4. **Database Schema**:
   - Add 2fa_secret, 2fa_enabled, backup_codes to admin_users table
   - Create audit log for 2FA events
   - Store last used backup codes to prevent reuse

5. **Recovery Flow**:
   - "Lost device" recovery option
   - Admin super-user can reset 2FA for other admins
   - Email verification for 2FA reset requests

Use the existing Supabase authentication system and admin dashboard structure.
```

---

## 🛡️ **Security Headers**

### **PROMPT 2: Comprehensive Security Headers**
**Time**: 30 minutes

```
Implement comprehensive security headers across all SaSarjan apps:

1. **Next.js Security Headers** (in next.config.mjs for each app):
   - Content Security Policy (CSP) with proper script-src, style-src
   - X-Frame-Options: DENY
   - X-Content-Type-Options: nosniff
   - Referrer-Policy: strict-origin-when-cross-origin
   - Permissions-Policy for camera, microphone, geolocation

2. **HSTS Headers**:
   - Strict-Transport-Security with max-age=31536000
   - Include subdomains in HSTS policy
   - Preload directive for major browsers

3. **CORS Configuration**:
   - Restrict origins to known domains
   - Limit allowed methods to necessary ones
   - Configure credentials policy
   - Add preflight handling

4. **API Security Headers**:
   - Add security headers to all API routes
   - Create middleware for consistent header application
   - Implement in /apps/*/src/middleware.ts

Apply to all apps: web, admin, 10x-growth, talentexcel, sevapremi.
```

---

## ⚡ **Rate Limiting**

### **PROMPT 3: API Rate Limiting**
**Time**: 1 hour

```
Implement rate limiting for all API endpoints in the SaSarjan platform:

1. **Rate Limiting Middleware**:
   - Create reusable rate limiting middleware
   - Use memory-based limiter (upgrade to Redis later)
   - Implement sliding window algorithm
   - Different limits for different endpoint types

2. **Rate Limit Configurations**:
   - Authentication endpoints: 5 requests/minute
   - General API endpoints: 100 requests/minute
   - File upload endpoints: 10 requests/minute
   - Admin endpoints: 200 requests/minute

3. **Rate Limit Response**:
   - Return 429 Too Many Requests status
   - Include Retry-After header
   - Provide clear error messages
   - Log rate limit violations

4. **Implementation Points**:
   - /apps/*/src/middleware.ts for route-level limiting
   - Individual API routes for endpoint-specific limits
   - Create /apps/*/src/lib/rate-limiter.ts utility

5. **Rate Limit Bypass**:
   - Whitelist for admin users
   - Environment-based bypass for development
   - IP whitelist for known services

6. **Monitoring**:
   - Log rate limit hits to audit system
   - Dashboard showing rate limit statistics
   - Alerts for suspicious activity patterns

Apply to all apps with appropriate limits for each app's usage patterns.
```

---

## 📊 **Audit Logging**

### **PROMPT 4: Comprehensive Audit System**
**Time**: 1-2 hours

```
Implement comprehensive audit logging for the SaSarjan platform:

1. **Audit Log Database Schema**:
   - Create audit_logs table in Supabase with:
     * id, timestamp, user_id, app_name, action, resource_type
     * resource_id, old_values, new_values, ip_address, user_agent
     * success, error_message, session_id

2. **Audit Middleware**:
   - Create audit logging middleware for all apps
   - Automatically log API requests and responses
   - Capture user context and session information
   - Filter sensitive data (passwords, tokens)

3. **Admin Action Logging**:
   - Log all admin dashboard actions
   - User creation, modification, deletion
   - Permission changes and role assignments
   - System configuration changes
   - Bulk operations and data exports

4. **Authentication Event Logging**:
   - Login attempts (success/failure)
   - Password changes and resets
   - 2FA setup, usage, and failures
   - Session creation and termination
   - Account lockouts and unlocks

5. **Audit Log Viewer**:
   - Create audit log page in admin dashboard
   - Filtering by user, action, date range, app
   - Export audit logs to CSV/JSON
   - Real-time audit log streaming

6. **Security Event Detection**:
   - Multiple failed login attempts
   - Admin actions outside business hours
   - Bulk data modifications
   - Unusual IP address patterns
   - Privilege escalation attempts

7. **Data Retention**:
   - Retain audit logs for 1 year
   - Archive older logs to separate storage
   - Automated cleanup of expired logs

Implement across all apps with focus on admin dashboard and authentication flows.
```

---

## 🔐 **Data Encryption**

### **PROMPT 5: Data Protection**
**Time**: 1 hour

```
Implement data encryption for sensitive information:

1. **At-Rest Encryption**:
   - Encrypt PII fields in database
   - Use AES-256 encryption for sensitive data
   - Store encryption keys in environment variables
   - Implement field-level encryption helpers

2. **In-Transit Encryption**:
   - Ensure all API calls use HTTPS
   - Implement certificate pinning where possible
   - Use secure WebSocket connections (WSS)

3. **Application-Level Encryption**:
   - Encrypt user profile data
   - Encrypt file uploads before storage
   - Encrypt API keys and tokens
   - Hash passwords with bcrypt (salt rounds 12)

4. **Key Management**:
   - Rotate encryption keys regularly
   - Use different keys for different data types
   - Implement key derivation functions
   - Secure key storage and access logging

5. **Sensitive Data Handling**:
   - Identify and classify sensitive data
   - Implement data masking in logs
   - Secure data transmission protocols
   - Regular security audits of data handling

Focus on user data, payment information, and admin credentials.
```

---

## 🚨 **Security Monitoring**

### **PROMPT 6: Threat Detection**
**Time**: 1 hour

```
Implement security monitoring and threat detection:

1. **Security Event Monitoring**:
   - Real-time monitoring of suspicious activities
   - Failed authentication attempt tracking
   - Unusual access pattern detection
   - Admin privilege usage monitoring

2. **Automated Alerts**:
   - Email alerts for critical security events
   - Slack/Discord notifications for admin team
   - SMS alerts for emergency situations
   - Escalation procedures for unresponded alerts

3. **Intrusion Detection**:
   - Monitor for SQL injection attempts
   - Detect XSS attack patterns
   - Track unusual API usage patterns
   - Monitor for brute force attacks

4. **Security Dashboard**:
   - Real-time security metrics
   - Threat level indicators
   - Recent security events timeline
   - Security score and recommendations

5. **Incident Response**:
   - Automated account lockout procedures
   - IP blocking for malicious actors
   - Security incident logging
   - Breach notification procedures

6. **Regular Security Checks**:
   - Daily security report generation
   - Weekly security review meetings
   - Monthly penetration testing
   - Quarterly security audits

Integrate with existing monitoring systems and admin dashboard.
```

---

## ✅ **Success Criteria Checklist**

### **After PROMPT 1 (2FA)**
- [ ] Admin users can setup 2FA with QR code
- [ ] Login requires 2FA code after password
- [ ] Backup codes work for emergency access
- [ ] 2FA can be disabled/reset by super admin

### **After PROMPT 2 (Security Headers)**
- [ ] All apps return proper security headers
- [ ] CSP prevents inline scripts and styles
- [ ] HSTS enforces HTTPS connections
- [ ] CORS restricts cross-origin requests

### **After PROMPT 3 (Rate Limiting)**
- [ ] API endpoints enforce rate limits
- [ ] 429 responses include proper headers
- [ ] Different limits for different endpoint types
- [ ] Rate limit bypass works for admins

### **After PROMPT 4 (Audit Logging)**
- [ ] All admin actions are logged
- [ ] Authentication events are tracked
- [ ] Audit log viewer shows filtered results
- [ ] Security events trigger alerts

### **After PROMPT 5 (Encryption)**
- [ ] Sensitive data is encrypted at rest
- [ ] All communications use HTTPS
- [ ] Passwords are properly hashed
- [ ] Encryption keys are securely managed

### **After PROMPT 6 (Monitoring)**
- [ ] Security events are monitored
- [ ] Alerts fire for suspicious activity
- [ ] Security dashboard shows real-time data
- [ ] Incident response procedures documented

---

## 🧪 **Testing Commands**

```bash
# Test security headers
curl -I https://localhost:3000

# Test rate limiting
for i in {1..10}; do curl -X POST http://localhost:3000/api/auth/login; done

# Test 2FA setup
# Manual testing in admin dashboard

# Test audit logging
# Check admin dashboard audit log viewer

# Test encryption
# Verify database contains encrypted values
```

---

## 📁 **Related Files**

### **Security Configuration**
- `/apps/*/next.config.mjs` - Security headers
- `/apps/*/src/middleware.ts` - Rate limiting and CORS
- `/apps/*/src/lib/rate-limiter.ts` - Rate limiting utility
- `/apps/*/src/lib/encryption.ts` - Encryption helpers

### **2FA Implementation**
- `/apps/admin/src/app/auth/setup-2fa/page.tsx`
- `/apps/admin/src/app/auth/login/page.tsx`
- `/apps/admin/src/lib/2fa.ts` - 2FA utilities

### **Audit System**
- `/apps/admin/src/app/audit/page.tsx` - Audit log viewer
- `/apps/*/src/lib/audit.ts` - Audit logging utility
- `/supabase/migrations/*_audit_system.sql` - Database schema

### **Monitoring**
- `/apps/admin/src/app/security/page.tsx` - Security dashboard
- `/apps/*/src/lib/monitoring.ts` - Security monitoring

---

## 🚨 **Security Checklist**

### **Before Deployment**
- [ ] All security headers implemented
- [ ] Rate limiting tested and working
- [ ] 2FA mandatory for admin users
- [ ] Audit logging captures all events
- [ ] Encryption keys properly managed
- [ ] Security monitoring active

### **Regular Security Tasks**
- [ ] Weekly security review
- [ ] Monthly penetration testing
- [ ] Quarterly security audit
- [ ] Annual security assessment

### **Incident Response**
- [ ] Security incident procedures documented
- [ ] Emergency contact list updated
- [ ] Breach notification process ready
- [ ] Recovery procedures tested

---

**🔒 Security is not optional - implement these features before any production deployment! 🛡️**