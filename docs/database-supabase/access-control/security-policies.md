# Database Security Policies

**Last Updated**: 06-Jul-2025 (Sunday, 00:35 IST)  
**Purpose**: Comprehensive security policies for SaSarjan database environments  
**Compliance**: SOC 2, GDPR, and Indian data protection standards

## 🛡️ Security Framework Overview

### **Defense in Depth Strategy**

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SaSarjan Security Layers                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  PERIMETER            ACCESS CONTROL         DATA PROTECTION        │
│  ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐    │
│  │ Network         │   │ Authentication  │   │ Encryption      │    │
│  │ • VPN Required  │   │ • MFA Enforced  │   │ • At Rest       │    │
│  │ • IP Whitelist  │   │ • Role-Based    │   │ • In Transit    │    │
│  │ • WAF Protection│   │ • Session Mgmt  │   │ • Application   │    │
│  └─────────────────┘   └─────────────────┘   └─────────────────┘    │
│           │                      │                      │           │
│           ▼                      ▼                      ▼           │
│  ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐    │
│  │ Application     │   │ Database        │   │ Monitoring      │    │
│  │ • Input Valid   │   │ • RLS Policies  │   │ • Audit Logs    │    │
│  │ • CSRF Protect  │   │ • Query Limits  │   │ • Alert System │    │
│  │ • Rate Limiting │   │ • Backup Encrypt│   │ • Incident Resp │    │
│  └─────────────────┘   └─────────────────┘   └─────────────────┘    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### **Security Principles**

1. **Zero Trust**: Never trust, always verify
2. **Least Privilege**: Minimum necessary access only
3. **Defense in Depth**: Multiple security layers
4. **Continuous Monitoring**: Real-time threat detection
5. **Data Minimization**: Collect and retain only necessary data
6. **Transparency**: Clear security practices and incident reporting

---

## 🔐 Access Control Policies

### **Authentication Requirements**

#### **Multi-Factor Authentication (MFA)**

```bash
# Required for all team members
□ Admin Level: Hardware security keys (YubiKey) + SMS backup
□ Senior Level: Authenticator app (Google/Authy) + SMS backup
□ Junior Level: Authenticator app (Google/Authy)

# MFA enforcement checklist:
□ Supabase account (organization level)
□ GitHub account (repository access)
□ Production environment access
□ VPN access (if applicable)
□ Email accounts (company domain)
```

#### **Password Policy**

```bash
# Minimum requirements:
- Length: 16+ characters
- Complexity: Mix of uppercase, lowercase, numbers, symbols
- Uniqueness: No reuse of last 12 passwords
- Expiration: 90 days for admin accounts, 180 days for others
- No dictionary words or personal information

# Recommended tools:
- Password manager: 1Password, Bitwarden, or similar
- Password generation: High entropy, random generation
- Secure storage: Never store in plain text or browsers
```

#### **Session Management**

```bash
# Session security requirements:
- Maximum session duration: 8 hours (admin), 24 hours (others)
- Automatic logout on inactivity: 30 minutes
- Concurrent session limit: 3 per user
- Session invalidation on password change
- Secure session storage (httpOnly, secure flags)

# Implementation in environment files:
JWT_EXPIRY=28800  # 8 hours for admin
REFRESH_TOKEN_ROTATION=true
SESSION_INACTIVITY_TIMEOUT=1800  # 30 minutes
```

### **Authorization Framework**

#### **Role-Based Access Control (RBAC)**

```sql
-- Database roles implementation
CREATE ROLE sasarjan_admin;
CREATE ROLE sasarjan_senior_dev;
CREATE ROLE sasarjan_junior_dev;
CREATE ROLE sasarjan_readonly;

-- Grant permissions by role
GRANT ALL PRIVILEGES ON DATABASE sasarjan TO sasarjan_admin;
GRANT CONNECT, USAGE ON SCHEMA public TO sasarjan_senior_dev;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO sasarjan_senior_dev;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO sasarjan_readonly;

-- User assignment (examples)
GRANT sasarjan_admin TO admin_user;
GRANT sasarjan_senior_dev TO senior_developer;
GRANT sasarjan_junior_dev TO junior_developer;
```

#### **Row Level Security (RLS) Policies**

**User Data Protection:**

```sql
-- Users can only access their own data
CREATE POLICY "users_own_data" ON public.users
  FOR ALL USING (auth.uid() = id);

-- Career profiles privacy
CREATE POLICY "career_profiles_privacy" ON public.user_career_profiles
  FOR ALL USING (
    auth.uid() = user_id
    OR auth.jwt() ->> 'role' = 'admin'
    OR (
      auth.jwt() ->> 'role' = 'mentor'
      AND EXISTS (
        SELECT 1 FROM public.mentorship_sessions
        WHERE mentor_id = auth.uid()
        AND mentee_id = user_id
      )
    )
  );
```

**Organization-Based Access:**

```sql
-- Multi-tenant data isolation
CREATE POLICY "organization_isolation" ON public.sensitive_data
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id
      FROM public.user_organizations
      WHERE user_id = auth.uid()
    )
  );

-- Admin override for emergency access
CREATE POLICY "admin_emergency_access" ON public.sensitive_data
  FOR SELECT USING (
    auth.jwt() ->> 'role' = 'admin'
    AND current_setting('app.emergency_access', true) = 'true'
  );
```

**Development Environment Isolation:**

```sql
-- Ensure staging/production separation
CREATE POLICY "environment_isolation" ON public.all_tables
  FOR ALL USING (
    CASE
      WHEN current_setting('app.environment', true) = 'production' THEN
        auth.jwt() ->> 'role' IN ('admin', 'production_user')
      WHEN current_setting('app.environment', true) = 'staging' THEN
        auth.jwt() ->> 'role' IN ('admin', 'senior_dev', 'staging_user')
      ELSE
        true  -- Local development
    END
  );
```

---

## 🔒 Data Protection Policies

### **Encryption Standards**

#### **Data at Rest**

```bash
# Database encryption (Supabase managed):
□ AES-256 encryption for all data
□ Encrypted backups with separate key management
□ Encrypted file storage for user uploads
□ Hardware security modules (HSM) for key storage

# Application-level encryption for sensitive fields:
CREATE TABLE public.user_sensitive_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id),

  -- Encrypted fields (use application-level encryption)
  ssn_encrypted TEXT,  -- Social Security Number (encrypted)
  bank_account_encrypted TEXT,  -- Bank details (encrypted)
  medical_info_encrypted TEXT,  -- Health information (encrypted)

  -- Encryption metadata
  encryption_key_id TEXT NOT NULL,
  encrypted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **Data in Transit**

```bash
# TLS/SSL requirements:
□ TLS 1.3 minimum for all connections
□ HSTS headers enforced
□ Certificate pinning for mobile apps
□ No mixed content allowed

# API security headers:
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'
```

#### **Application-Level Encryption**

```typescript
// Example: Sensitive data encryption service
import { createCipher, createDecipher } from 'crypto';

class EncryptionService {
  private static readonly ALGORITHM = 'aes-256-gcm';

  static encrypt(plaintext: string, keyId: string): {
    encrypted: string;
    iv: string;
    tag: string;
    keyId: string;
  } {
    const key = this.getEncryptionKey(keyId);
    const iv = crypto.randomBytes(16);
    const cipher = createCipher(this.ALGORITHM, key, iv);

    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: cipher.getAuthTag().toString('hex'),
      keyId
    };
  }

  static decrypt(encryptedData: EncryptedData): string {
    const key = this.getEncryptionKey(encryptedData.keyId);
    const decipher = createDecipher(this.ALGORITHM, key, Buffer.from(encryptedData.iv, 'hex'));

    decipher.setAuthTag(Buffer.from(encryptedData.tag, 'hex'));

    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}
```

### **Data Classification and Handling**

#### **Data Classification Levels**

**Level 1: Public Data**

```sql
-- Examples: Marketing content, public app listings
-- Security requirements: Basic integrity protection
-- Access: Anyone can view
-- Storage: Standard database tables
-- Backup: Standard retention policies

COMMENT ON TABLE public.apps IS 'Level 1: Public app listings';
COMMENT ON TABLE public.blog_posts IS 'Level 1: Public marketing content';
```

**Level 2: Internal Data**

```sql
-- Examples: User preferences, non-sensitive analytics
-- Security requirements: Authentication required
-- Access: Authenticated users only
-- Storage: RLS policies enforced
-- Backup: Encrypted backups

CREATE POLICY "internal_data_access" ON public.user_preferences
  FOR ALL USING (auth.uid() IS NOT NULL);

COMMENT ON TABLE public.user_preferences IS 'Level 2: Internal user data';
```

**Level 3: Sensitive Data**

```sql
-- Examples: Email addresses, names, career information
-- Security requirements: Strong authentication + authorization
-- Access: User's own data + authorized mentors/admins
-- Storage: RLS + audit logging
-- Backup: Encrypted + access logging

CREATE POLICY "sensitive_data_access" ON public.user_career_profiles
  FOR ALL USING (
    auth.uid() = user_id
    OR has_authorized_access(auth.uid(), user_id)
  );

COMMENT ON TABLE public.user_career_profiles IS 'Level 3: Sensitive personal data';
```

**Level 4: Highly Sensitive Data**

```sql
-- Examples: Payment information, government IDs, health data
-- Security requirements: Application-level encryption + MFA
-- Access: Strict need-to-know basis
-- Storage: Encrypted fields + comprehensive audit trail
-- Backup: Encrypted + geographic restrictions

CREATE TABLE public.user_payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id),

  -- Encrypted sensitive fields
  card_number_encrypted TEXT NOT NULL,
  card_holder_encrypted TEXT NOT NULL,
  billing_address_encrypted TEXT NOT NULL,

  -- Non-sensitive metadata
  card_brand TEXT,
  last_four_digits CHAR(4),
  expiry_month INTEGER,
  expiry_year INTEGER,

  -- Audit fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES public.users(id),

  CONSTRAINT valid_expiry CHECK (
    expiry_month BETWEEN 1 AND 12
    AND expiry_year >= EXTRACT(year FROM NOW())
  )
);

-- Highly restrictive RLS policy
CREATE POLICY "payment_methods_owner_only" ON public.user_payment_methods
  FOR ALL USING (
    auth.uid() = user_id
    AND auth.jwt() ->> 'mfa_verified' = 'true'  -- Require MFA
  );

COMMENT ON TABLE public.user_payment_methods IS 'Level 4: Highly sensitive payment data';
```

#### **Data Retention Policies**

**Retention Schedule:**

```sql
-- User data retention policy
CREATE TABLE public.data_retention_policies (
  table_name TEXT PRIMARY KEY,
  classification_level INTEGER NOT NULL,
  retention_period_days INTEGER NOT NULL,
  deletion_method TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO public.data_retention_policies VALUES
('user_career_profiles', 3, 2555, 'secure_delete'),  -- 7 years
('user_payment_methods', 4, 2190, 'cryptographic_erasure'),  -- 6 years
('user_sessions', 2, 90, 'standard_delete'),  -- 90 days
('audit_logs', 3, 2555, 'secure_delete'),  -- 7 years
('user_preferences', 2, 1095, 'standard_delete');  -- 3 years
```

**Automated Data Deletion:**

```sql
-- Automated cleanup function
CREATE OR REPLACE FUNCTION cleanup_expired_data()
RETURNS void AS $$
DECLARE
  policy RECORD;
BEGIN
  FOR policy IN SELECT * FROM public.data_retention_policies LOOP
    EXECUTE format(
      'DELETE FROM %I WHERE created_at < NOW() - INTERVAL ''%s days''',
      policy.table_name,
      policy.retention_period_days
    );

    -- Log cleanup activity
    INSERT INTO public.audit_logs (
      action,
      table_name,
      details,
      created_at
    ) VALUES (
      'data_cleanup',
      policy.table_name,
      jsonb_build_object('retention_days', policy.retention_period_days),
      NOW()
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule cleanup (run monthly)
SELECT cron.schedule('cleanup-expired-data', '0 0 1 * *', 'SELECT cleanup_expired_data();');
```

---

## 📊 Monitoring and Audit Policies

### **Comprehensive Audit Logging**

#### **Database Activity Logging**

```sql
-- Comprehensive audit log table
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- User context
  user_id UUID REFERENCES auth.users(id),
  user_email TEXT,
  user_role TEXT,
  session_id TEXT,

  -- Action details
  action TEXT NOT NULL,  -- SELECT, INSERT, UPDATE, DELETE, LOGIN, etc.
  table_name TEXT,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,

  -- Request context
  ip_address INET,
  user_agent TEXT,
  request_id TEXT,

  -- Environment context
  environment TEXT DEFAULT current_setting('app.environment', true),
  application TEXT,

  -- Security context
  mfa_verified BOOLEAN DEFAULT false,
  risk_score INTEGER DEFAULT 0,

  -- Additional metadata
  details JSONB DEFAULT '{}',

  -- Compliance fields
  gdpr_lawful_basis TEXT,
  data_classification INTEGER
);

-- Indexes for performance
CREATE INDEX idx_audit_logs_timestamp ON public.audit_logs(timestamp);
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX idx_audit_logs_table_name ON public.audit_logs(table_name);
CREATE INDEX idx_audit_logs_environment ON public.audit_logs(environment);
```

#### **Automated Audit Triggers**

```sql
-- Generic audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
  -- Only audit in production and staging
  IF current_setting('app.environment', true) IN ('production', 'staging') THEN
    INSERT INTO public.audit_logs (
      user_id,
      user_email,
      user_role,
      action,
      table_name,
      record_id,
      old_values,
      new_values,
      ip_address,
      user_agent,
      request_id
    ) VALUES (
      auth.uid(),
      auth.jwt() ->> 'email',
      auth.jwt() ->> 'role',
      TG_OP,
      TG_TABLE_NAME,
      COALESCE(NEW.id, OLD.id),
      CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
      CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END,
      inet_client_addr(),
      current_setting('request.headers.user-agent', true),
      current_setting('request.id', true)
    );
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers to sensitive tables
CREATE TRIGGER audit_user_career_profiles
  AFTER INSERT OR UPDATE OR DELETE ON public.user_career_profiles
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_user_payment_methods
  AFTER INSERT OR UPDATE OR DELETE ON public.user_payment_methods
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
```

### **Security Monitoring**

#### **Real-Time Threat Detection**

```sql
-- Suspicious activity detection
CREATE OR REPLACE FUNCTION detect_suspicious_activity()
RETURNS void AS $$
BEGIN
  -- Detect multiple failed login attempts
  WITH recent_failures AS (
    SELECT
      user_email,
      ip_address,
      COUNT(*) as failure_count
    FROM public.audit_logs
    WHERE
      action = 'LOGIN_FAILED'
      AND timestamp > NOW() - INTERVAL '15 minutes'
    GROUP BY user_email, ip_address
    HAVING COUNT(*) >= 5
  )
  INSERT INTO public.security_alerts (
    alert_type,
    severity,
    details,
    requires_action
  )
  SELECT
    'BRUTE_FORCE_ATTEMPT',
    'HIGH',
    jsonb_build_object(
      'user_email', user_email,
      'ip_address', ip_address,
      'failure_count', failure_count
    ),
    true
  FROM recent_failures;

  -- Detect unusual data access patterns
  WITH unusual_access AS (
    SELECT
      user_id,
      COUNT(DISTINCT table_name) as tables_accessed,
      COUNT(*) as total_queries
    FROM public.audit_logs
    WHERE
      action = 'SELECT'
      AND timestamp > NOW() - INTERVAL '1 hour'
    GROUP BY user_id
    HAVING
      COUNT(DISTINCT table_name) > 10
      OR COUNT(*) > 1000
  )
  INSERT INTO public.security_alerts (
    alert_type,
    severity,
    details,
    requires_action
  )
  SELECT
    'UNUSUAL_DATA_ACCESS',
    'MEDIUM',
    jsonb_build_object(
      'user_id', user_id,
      'tables_accessed', tables_accessed,
      'total_queries', total_queries
    ),
    true
  FROM unusual_access;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Run threat detection every 5 minutes
SELECT cron.schedule('threat-detection', '*/5 * * * *', 'SELECT detect_suspicious_activity();');
```

#### **Security Alert Management**

```sql
-- Security alerts table
CREATE TABLE public.security_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  details JSONB NOT NULL,
  requires_action BOOLEAN DEFAULT false,

  -- Status tracking
  status TEXT DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'INVESTIGATING', 'RESOLVED', 'FALSE_POSITIVE')),
  assigned_to UUID REFERENCES auth.users(id),
  resolution_notes TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Alert escalation rules
CREATE TABLE public.alert_escalation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  escalation_delay_minutes INTEGER NOT NULL,
  escalation_method TEXT NOT NULL,  -- EMAIL, SMS, SLACK, PAGER
  recipient TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Example escalation rules
INSERT INTO public.alert_escalation_rules VALUES
(gen_random_uuid(), 'BRUTE_FORCE_ATTEMPT', 'HIGH', 5, 'EMAIL', 'security@sasarjan.com'),
(gen_random_uuid(), 'BRUTE_FORCE_ATTEMPT', 'HIGH', 15, 'SMS', '+1234567890'),
(gen_random_uuid(), 'DATA_BREACH_SUSPECTED', 'CRITICAL', 0, 'PAGER', 'oncall-security'),
(gen_random_uuid(), 'UNUSUAL_DATA_ACCESS', 'MEDIUM', 30, 'EMAIL', 'dba@sasarjan.com');
```

---

## 🚨 Incident Response Policies

### **Security Incident Classification**

#### **Incident Severity Levels**

**Level 1: Critical (Response Time: Immediate)**

```bash
# Examples:
- Active data breach
- Production database compromise
- Payment system failure
- Authentication system failure

# Response protocol:
□ Immediate notification to security team
□ Activate incident response team
□ Isolate affected systems if needed
□ Begin containment procedures
□ Notify legal and compliance teams
□ Document all actions taken
```

**Level 2: High (Response Time: 15 minutes)**

```bash
# Examples:
- Suspected data breach
- Multiple failed admin login attempts
- Unauthorized access attempt
- System performance anomalies

# Response protocol:
□ Notify security team within 15 minutes
□ Begin investigation procedures
□ Monitor affected systems closely
□ Prepare containment measures
□ Alert relevant stakeholders
```

**Level 3: Medium (Response Time: 1 hour)**

```bash
# Examples:
- Unusual user activity patterns
- Failed backup procedures
- Non-critical system errors
- Policy violations

# Response protocol:
□ Log incident in tracking system
□ Begin standard investigation
□ Monitor for escalation signs
□ Schedule resolution within 24 hours
```

**Level 4: Low (Response Time: 24 hours)**

```bash
# Examples:
- Minor configuration issues
- Documentation discrepancies
- Process improvement opportunities

# Response protocol:
□ Create ticket in issue tracking
□ Schedule resolution within 1 week
□ Review in next team meeting
```

### **Incident Response Procedures**

#### **Immediate Response (First 30 minutes)**

```bash
# Step 1: Assessment and Classification (5 minutes)
□ Determine incident severity level
□ Identify affected systems and data
□ Estimate impact on users and operations
□ Classify type of security incident

# Step 2: Notification (5 minutes)
□ Alert incident response team
□ Notify management (Critical/High incidents)
□ Document initial findings
□ Start incident response call if needed

# Step 3: Containment (20 minutes)
□ Isolate affected systems if needed
□ Prevent further damage or data loss
□ Preserve evidence for investigation
□ Maintain business continuity
```

#### **Investigation Phase (1-24 hours)**

```bash
# Forensic Investigation:
□ Collect and preserve logs
□ Analyze attack vectors
□ Identify compromised accounts/systems
□ Determine extent of data exposure
□ Document timeline of events

# Evidence Collection:
□ Database logs and audit trails
□ Application logs and error messages
□ Network traffic logs
□ System access logs
□ User activity logs
```

#### **Recovery Phase (Varies)**

```bash
# System Recovery:
□ Remove threats from systems
□ Patch vulnerabilities that enabled incident
□ Restore systems from clean backups if needed
□ Update security configurations
□ Test all systems before returning to service

# Data Recovery:
□ Assess data integrity
□ Restore corrupted data from backups
□ Verify data consistency across environments
□ Update data classification if needed
```

#### **Post-Incident Activities**

```bash
# Documentation:
□ Complete incident report
□ Document lessons learned
□ Update incident response procedures
□ Create preventive measures

# Communication:
□ Notify affected users (if required)
□ Report to regulatory authorities (if required)
□ Update stakeholders on resolution
□ Conduct post-incident review meeting
```

---

## 📜 Compliance and Legal Policies

### **Data Protection Compliance**

#### **GDPR Compliance Requirements**

```sql
-- GDPR compliance tracking
CREATE TABLE public.gdpr_compliance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id),

  -- Consent management
  consent_given BOOLEAN DEFAULT false,
  consent_timestamp TIMESTAMP WITH TIME ZONE,
  consent_version TEXT,
  consent_ip_address INET,

  -- Data processing lawful basis
  lawful_basis TEXT NOT NULL CHECK (lawful_basis IN (
    'consent', 'contract', 'legal_obligation',
    'vital_interests', 'public_task', 'legitimate_interests'
  )),

  -- Data subject rights
  data_export_requests JSONB DEFAULT '[]',
  data_deletion_requests JSONB DEFAULT '[]',
  data_correction_requests JSONB DEFAULT '[]',

  -- Retention management
  retention_period_days INTEGER,
  deletion_scheduled_date DATE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Data processing activities log
CREATE TABLE public.data_processing_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_name TEXT NOT NULL,
  purpose TEXT NOT NULL,
  lawful_basis TEXT NOT NULL,
  data_categories TEXT[] NOT NULL,
  data_sources TEXT[] NOT NULL,
  recipients TEXT[] DEFAULT '{}',
  retention_period TEXT NOT NULL,
  security_measures TEXT[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **User Rights Implementation**

```sql
-- Right to access (data export)
CREATE OR REPLACE FUNCTION export_user_data(target_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  user_data JSONB := '{}';
BEGIN
  -- Verify user can access this data
  IF auth.uid() != target_user_id AND auth.jwt() ->> 'role' != 'admin' THEN
    RAISE EXCEPTION 'Unauthorized access to user data';
  END IF;

  -- Collect user data from all relevant tables
  SELECT jsonb_build_object(
    'profile', (SELECT row_to_json(u) FROM public.users u WHERE u.id = target_user_id),
    'career_profile', (SELECT row_to_json(cp) FROM public.user_career_profiles cp WHERE cp.user_id = target_user_id),
    'preferences', (SELECT row_to_json(up) FROM public.user_preferences up WHERE up.user_id = target_user_id),
    'export_timestamp', NOW()
  ) INTO user_data;

  -- Log the export request
  INSERT INTO public.audit_logs (
    user_id, action, details
  ) VALUES (
    target_user_id, 'DATA_EXPORT',
    jsonb_build_object('exported_data_size', length(user_data::text))
  );

  RETURN user_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Right to erasure (data deletion)
CREATE OR REPLACE FUNCTION delete_user_data(target_user_id UUID, deletion_reason TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Verify user can delete this data
  IF auth.uid() != target_user_id AND auth.jwt() ->> 'role' != 'admin' THEN
    RAISE EXCEPTION 'Unauthorized deletion attempt';
  END IF;

  -- Log deletion before performing it
  INSERT INTO public.audit_logs (
    user_id, action, details
  ) VALUES (
    target_user_id, 'DATA_DELETION_REQUEST',
    jsonb_build_object('reason', deletion_reason, 'timestamp', NOW())
  );

  -- Perform secure deletion
  DELETE FROM public.user_preferences WHERE user_id = target_user_id;
  DELETE FROM public.user_career_profiles WHERE user_id = target_user_id;
  -- Note: Keep audit logs for compliance

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### **Indian Data Protection Compliance**

#### **Digital Personal Data Protection Act (DPDPA) Requirements**

```sql
-- DPDPA compliance tracking
CREATE TABLE public.dpdpa_compliance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id),

  -- Consent management (more granular for Indian law)
  consent_categories JSONB NOT NULL,  -- Different types of consent
  consent_language TEXT DEFAULT 'en',  -- Language of consent
  verifiable_consent BOOLEAN DEFAULT false,

  -- Data fiduciary obligations
  data_processing_notice_provided BOOLEAN DEFAULT false,
  notice_language TEXT,
  notice_version TEXT,

  -- Data principal rights
  grievance_officer_contact TEXT DEFAULT 'grievance@sasarjan.com',
  complaint_mechanism TEXT DEFAULT 'email',

  -- Cross-border transfer compliance
  transfer_jurisdictions TEXT[] DEFAULT '{}',
  adequacy_decisions JSONB DEFAULT '{}',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 🔄 Security Review and Updates

### **Regular Security Assessments**

#### **Monthly Security Reviews**

```bash
# Security review checklist (performed monthly):
□ Review user access and permissions
□ Audit recent security incidents
□ Update threat intelligence
□ Review and test backup procedures
□ Validate encryption implementation
□ Check compliance with regulations
□ Update security documentation
□ Review third-party security reports

# Review deliverables:
- Security metrics dashboard
- Incident summary report
- Compliance status update
- Risk assessment update
- Action items for next month
```

#### **Quarterly Security Audits**

```bash
# Comprehensive audit checklist (performed quarterly):
□ Full penetration testing
□ Code security review
□ Infrastructure vulnerability assessment
□ Database security configuration review
□ Access control effectiveness review
□ Incident response plan testing
□ Business continuity plan testing
□ Third-party security assessment

# Audit deliverables:
- Vulnerability assessment report
- Penetration testing report
- Compliance audit results
- Risk register updates
- Security improvement roadmap
```

#### **Annual Security Certification**

```bash
# Annual certification requirements:
□ SOC 2 Type II audit
□ ISO 27001 assessment (planned)
□ GDPR compliance audit
□ DPDPA compliance review
□ Third-party security certification
□ Business continuity certification
□ Disaster recovery certification

# Certification deliverables:
- Formal audit reports
- Certification documents
- Compliance attestations
- Executive security briefing
- Annual security strategy update
```

### **Continuous Improvement Process**

#### **Security Metrics and KPIs**

```sql
-- Security metrics tracking
CREATE TABLE public.security_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  measurement_period DATE NOT NULL,
  target_value NUMERIC,
  unit TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Key security metrics to track:
INSERT INTO public.security_metrics (metric_name, category) VALUES
('failed_login_attempts_per_day', 'authentication'),
('security_incidents_resolved_within_sla', 'incident_response'),
('percentage_users_with_mfa_enabled', 'access_control'),
('vulnerability_patch_time_hours', 'vulnerability_management'),
('backup_success_rate', 'data_protection'),
('audit_log_completeness_percentage', 'monitoring'),
('compliance_violations_count', 'compliance');
```

#### **Security Training and Awareness**

```bash
# Monthly security training topics:
Month 1: Password security and MFA
Month 2: Phishing awareness and reporting
Month 3: Data classification and handling
Month 4: Incident response procedures
Month 5: Database security best practices
Month 6: GDPR and privacy compliance
Month 7: Secure coding practices
Month 8: Social engineering awareness
Month 9: Business continuity planning
Month 10: Threat intelligence and trends
Month 11: Third-party risk management
Month 12: Annual security review and planning

# Training requirements:
□ All team members: Monthly 30-minute sessions
□ Developers: Additional secure coding training
□ Admins: Advanced security management training
□ Management: Security risk and compliance briefings
```

---

**Remember**: Security is everyone's responsibility. Every security measure we implement protects our users' data and upholds our commitment to collective prosperity through trustworthy technology! 🛡️
