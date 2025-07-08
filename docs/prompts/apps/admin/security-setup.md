# Admin - Security Setup Prompts

## Quick Reference
- **Time Estimate**: 2-3 hours total
- **Dependencies**: None ✅
- **Apps Affected**: `/apps/admin`
- **Priority**: CRITICAL ⚠️

---

## 🔒 **Admin 2FA Implementation**

### **PROMPT 1: Two-Factor Authentication**
**Time**: 1-2 hours

```
Implement comprehensive 2FA for the SaSarjan admin dashboard:

1. **2FA Setup Flow**:
   - Create /apps/admin/src/app/auth/setup-2fa/page.tsx
   - Generate TOTP secret using otpauth-uri or speakeasy
   - Display QR code for Google Authenticator, Authy, or similar apps
   - Verify initial setup with test code before enabling

2. **Database Schema Updates**:
   - Add columns to admin_users table:
     * two_factor_secret (encrypted)
     * two_factor_enabled (boolean)
     * backup_codes (encrypted JSON array)
     * two_factor_setup_at (timestamp)

3. **Enhanced Login Flow**:
   - Modify /apps/admin/src/app/auth/login/page.tsx
   - After password verification, show 2FA code input
   - Verify TOTP codes with time tolerance (±1 period)
   - Handle backup code verification
   - Log all 2FA attempts to audit system

4. **Backup Codes System**:
   - Generate 10 single-use backup codes during 2FA setup
   - Allow download/print of backup codes
   - Mark codes as used after authentication
   - Regenerate used backup codes option

5. **Admin 2FA Management**:
   - Super admins can reset 2FA for other users
   - Email verification for 2FA reset requests
   - Audit logging for all 2FA operations
   - Forced 2FA setup for new admin accounts

6. **Recovery Mechanisms**:
   - "Lost device" recovery option
   - Email-based 2FA reset with admin approval
   - Emergency override codes for super admins
   - Account lockout after multiple failed attempts

Use the existing Supabase client and follow the current admin authentication patterns.
```

---

## 🔐 **Access Control & Permissions**

### **PROMPT 2: Role-Based Access Control**
**Time**: 1 hour

```
Implement granular role-based access control for the admin dashboard:

1. **Permission System**:
   - Define permissions: CREATE_USER, EDIT_USER, DELETE_USER, VIEW_ANALYTICS, etc.
   - Create roles: SUPER_ADMIN, USER_MANAGER, CONTENT_MODERATOR, ANALYST
   - Store role-permission mappings in database
   - Implement permission checking middleware

2. **Admin Role Management**:
   - Create /apps/admin/src/app/roles/page.tsx for role management
   - Allow super admins to assign/revoke roles
   - Prevent self-privilege escalation
   - Audit all role changes

3. **Feature-Level Protection**:
   - Protect routes based on required permissions
   - Hide UI elements user can't access
   - Implement usePermissions hook for components
   - Server-side permission validation for APIs

4. **Database Schema**:
   - admin_roles table: id, name, description, permissions[]
   - admin_user_roles table: user_id, role_id, granted_by, granted_at
   - Update existing admin authentication to check permissions

5. **Permission Checks**:
   - Create permission checking utilities
   - Implement route-level protection
   - Add component-level permission gates
   - Log permission denied attempts

Ensure backward compatibility with existing admin authentication.
```

---

## 🔍 **Audit & Monitoring**

### **PROMPT 3: Admin Activity Monitoring**
**Time**: 1 hour

```
Implement comprehensive monitoring for admin activities:

1. **Enhanced Audit Logging**:
   - Create detailed audit logs for all admin actions
   - Log: user management, role changes, content moderation, system settings
   - Include: timestamp, admin_id, action_type, target_resource, old_values, new_values
   - Store IP address, user agent, session information

2. **Real-Time Activity Feed**:
   - Create /apps/admin/src/app/activity/page.tsx
   - Show live admin activity stream
   - Filter by admin, action type, time range
   - Highlight suspicious or high-impact activities

3. **Admin Session Management**:
   - Track active admin sessions
   - Force logout suspicious sessions
   - Session timeout for inactive admins
   - Multiple device login alerts

4. **Security Alerts**:
   - Alert on multiple failed login attempts
   - Notify on privilege escalation attempts
   - Monitor for unusual access patterns
   - Alert on off-hours admin activity

5. **Compliance Reporting**:
   - Generate daily/weekly admin activity reports
   - Export audit logs for compliance audits
   - Data retention policies for audit logs
   - Automated compliance checking

6. **Admin Analytics Dashboard**:
   - Admin usage patterns and statistics
   - Security metric visualization
   - Alert summary and trends
   - System health indicators

Integrate with existing audit system and admin dashboard structure.
```

---

## 🛡️ **Session Security**

### **PROMPT 4: Secure Session Management**
**Time**: 30 minutes

```
Implement secure session management for admin users:

1. **Session Configuration**:
   - Shorter session timeouts for admins (2 hours vs 24 hours for users)
   - Secure session cookies with httpOnly, secure, sameSite
   - Session token rotation on sensitive operations
   - Device fingerprinting for session validation

2. **Multi-Device Management**:
   - Track admin sessions across devices
   - Show active sessions in admin profile
   - Allow remote session termination
   - Alert on new device logins

3. **Security Features**:
   - Auto-logout on browser close
   - Inactivity timeout with warning
   - Re-authentication for sensitive operations
   - Session invalidation on password change

4. **Session Monitoring**:
   - Log all session events
   - Monitor for session hijacking attempts
   - Alert on concurrent logins from different locations
   - Automatic session cleanup

Implement using Supabase Auth with custom session handling.
```

---

## 🚨 **Security Dashboard**

### **PROMPT 5: Admin Security Center**
**Time**: 1 hour

```
Create a comprehensive security dashboard for admin oversight:

1. **Security Overview Page** (/apps/admin/src/app/security/page.tsx):
   - Real-time security metrics
   - Active threats and alerts
   - Recent security events timeline
   - System security score

2. **Threat Detection**:
   - Failed login attempt tracking
   - Brute force attack detection
   - Unusual access pattern alerts
   - IP reputation checking

3. **Security Metrics**:
   - Authentication success/failure rates
   - 2FA adoption rate among admins
   - Session security compliance
   - Password strength statistics

4. **Incident Response**:
   - Security incident creation and tracking
   - Automated response triggers
   - Escalation procedures
   - Incident documentation

5. **Security Configuration**:
   - Security policy management
   - Rate limiting configuration
   - IP whitelist/blacklist management
   - Security header configuration

6. **Reporting & Analytics**:
   - Daily security reports
   - Trend analysis and predictions
   - Compliance status reporting
   - Security recommendation engine

Integrate with existing monitoring systems and provide actionable insights.
```

---

## ✅ **Success Criteria Checklist**

### **After PROMPT 1 (2FA)**
- [ ] Admin users can setup 2FA with QR code
- [ ] Login flow requires 2FA after password verification
- [ ] Backup codes work for emergency access
- [ ] 2FA setup is mandatory for new admin accounts
- [ ] Super admins can reset 2FA for other users

### **After PROMPT 2 (RBAC)**
- [ ] Different admin roles have different permissions
- [ ] UI elements are hidden based on permissions
- [ ] API endpoints check permissions server-side
- [ ] Role changes are audited and logged

### **After PROMPT 3 (Monitoring)**
- [ ] All admin actions are logged in detail
- [ ] Activity feed shows real-time admin actions
- [ ] Security alerts trigger for suspicious activity
- [ ] Compliance reports can be generated

### **After PROMPT 4 (Sessions)**
- [ ] Admin sessions timeout appropriately
- [ ] Multiple devices are tracked and manageable
- [ ] Session security measures are enforced
- [ ] Session events are logged

### **After PROMPT 5 (Dashboard)**
- [ ] Security dashboard shows real-time metrics
- [ ] Threat detection systems are active
- [ ] Security incidents can be tracked
- [ ] Security configuration is manageable

---

## 🧪 **Testing Scenarios**

### **2FA Testing**
```bash
# Test 2FA setup flow
1. Create new admin account
2. Force 2FA setup on first login
3. Verify QR code generation
4. Test with authenticator app
5. Verify backup codes work

# Test 2FA bypass attempts
1. Try to access admin without 2FA
2. Test with invalid codes
3. Verify account lockout
```

### **Permission Testing**
```bash
# Test role-based access
1. Create different admin roles
2. Assign different permissions
3. Verify UI elements show/hide correctly
4. Test API endpoint access restrictions
```

### **Session Security Testing**
```bash
# Test session management
1. Login from multiple devices
2. Test session timeout
3. Verify session invalidation
4. Test concurrent session limits
```

---

## 📁 **Related Files**

### **New Files to Create**
- `/apps/admin/src/app/auth/setup-2fa/page.tsx`
- `/apps/admin/src/app/roles/page.tsx`
- `/apps/admin/src/app/activity/page.tsx`
- `/apps/admin/src/app/security/page.tsx`
- `/apps/admin/src/lib/permissions.ts`
- `/apps/admin/src/lib/2fa.ts`
- `/apps/admin/src/hooks/usePermissions.ts`

### **Database Migrations**
- `/supabase/migrations/*_admin_2fa.sql`
- `/supabase/migrations/*_admin_roles.sql`
- `/supabase/migrations/*_admin_audit.sql`

### **Modified Files**
- `/apps/admin/src/app/auth/login/page.tsx`
- `/apps/admin/src/middleware.ts`
- `/apps/admin/src/lib/supabase.ts`

---

## 🚨 **Security Warnings**

### **Critical Security Notes**
- 🔒 Never store 2FA secrets in plain text
- 🔒 Always encrypt backup codes
- 🔒 Validate all permissions server-side
- 🔒 Log all security-related events
- 🔒 Use secure session configurations

### **Before Production Deployment**
- [ ] Security audit completed
- [ ] Penetration testing performed
- [ ] All security measures tested
- [ ] Incident response procedures documented
- [ ] Security team trained on new features

---

**🛡️ Admin security is the foundation of platform security - implement these features with highest priority! 🔒**