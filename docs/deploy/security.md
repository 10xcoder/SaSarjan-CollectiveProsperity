# 🔐 Security Configuration Guide

**Comprehensive security setup for production deployment**

---

## 🚀 Quick Security Setup

### Essential Security Commands
```bash
# Generate secure secrets
openssl rand -base64 32  # For NEXTAUTH_SECRET
openssl rand -base64 32  # For JWT_SECRET
openssl rand -base64 32  # For ENCRYPTION_KEY

# Set secure file permissions
chmod 600 .env.production
chmod 700 scripts/
```

### Basic Security Headers
```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },
};
```

---

## 📋 Security Categories

### 🔐 Authentication Security

#### JWT Token Security
```javascript
// lib/auth/jwt.js
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export function generateToken(payload) {
  return jwt.sign(
    {
      ...payload,
      iat: Math.floor(Date.now() / 1000),
      jti: crypto.randomUUID(), // Unique token ID
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN,
      issuer: 'sasarjan.app',
      audience: 'sasarjan-users',
    }
  );
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: 'sasarjan.app',
      audience: 'sasarjan-users',
    });
  } catch (error) {
    throw new Error('Invalid token');
  }
}
```

#### Session Security
```javascript
// lib/auth/session.js
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/options';

export async function getSecureSession(req, res) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session) {
    throw new Error('Unauthorized');
  }
  
  // Validate session integrity
  if (!session.user?.id || !session.user?.email) {
    throw new Error('Invalid session');
  }
  
  // Check session age
  const sessionAge = Date.now() - new Date(session.expires).getTime();
  if (sessionAge > 7 * 24 * 60 * 60 * 1000) { // 7 days
    throw new Error('Session expired');
  }
  
  return session;
}
```

#### Two-Factor Authentication
```javascript
// lib/auth/2fa.js
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

export function generate2FASecret(userId, email) {
  const secret = speakeasy.generateSecret({
    name: `SaSarjan (${email})`,
    issuer: 'SaSarjan App Store',
    length: 32,
  });
  
  return {
    secret: secret.base32,
    qrCode: QRCode.toDataURL(secret.otpauth_url),
    backupCodes: generateBackupCodes(),
  };
}

export function verify2FA(token, secret) {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 2, // Allow 1 step backward/forward
  });
}

function generateBackupCodes() {
  return Array.from({ length: 10 }, () => 
    crypto.randomBytes(4).toString('hex').toUpperCase()
  );
}
```

### 🛡️ Input Validation & Sanitization

#### Input Validation Middleware
```javascript
// middleware/validation.js
import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';

export function validateInput(schema) {
  return (req, res, next) => {
    try {
      // Validate and sanitize input
      const validatedData = schema.parse(req.body);
      
      // Sanitize string fields
      const sanitizedData = sanitizeObject(validatedData);
      
      req.body = sanitizedData;
      next();
    } catch (error) {
      res.status(400).json({
        error: 'Invalid input',
        details: error.errors,
      });
    }
  };
}

function sanitizeObject(obj) {
  if (typeof obj === 'string') {
    return DOMPurify.sanitize(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  
  if (obj && typeof obj === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  }
  
  return obj;
}
```

#### Schema Definitions
```javascript
// lib/validation/schemas.js
import { z } from 'zod';

export const userRegistrationSchema = z.object({
  email: z.string().email().max(100),
  password: z.string().min(8).max(100).regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    'Password must contain uppercase, lowercase, number, and special character'
  ),
  fullName: z.string().min(2).max(50).regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
  phone: z.string().regex(/^\+[1-9]\d{1,14}$/, 'Invalid phone number format'),
});

export const bundlePurchaseSchema = z.object({
  bundleId: z.string().uuid(),
  paymentMethod: z.enum(['stripe', 'razorpay']),
  couponCode: z.string().max(20).optional(),
});

export const contentCreationSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(10000),
  category: z.enum(['blog', 'tutorial', 'news', 'announcement']),
  tags: z.array(z.string().max(30)).max(10),
  status: z.enum(['draft', 'published', 'archived']),
});
```

### 🔒 Data Encryption

#### Sensitive Data Encryption
```javascript
// lib/encryption.js
import crypto from 'crypto';

const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'base64');
const ALGORITHM = 'aes-256-gcm';

export function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher(ALGORITHM, ENCRYPTION_KEY);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
  };
}

export function decrypt(encryptedData) {
  const { encrypted, iv, authTag } = encryptedData;
  
  const decipher = crypto.createDecipher(ALGORITHM, ENCRYPTION_KEY);
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

// Usage for sensitive fields
export function encryptPII(data) {
  return {
    ...data,
    email: encrypt(data.email),
    phone: data.phone ? encrypt(data.phone) : null,
    address: data.address ? encrypt(data.address) : null,
  };
}
```

#### Database Field Encryption
```javascript
// lib/db/encryption.js
export function createEncryptedField(tableName, columnName) {
  return {
    encrypt: (value) => {
      if (!value) return null;
      const encrypted = encrypt(value);
      return JSON.stringify(encrypted);
    },
    
    decrypt: (encryptedValue) => {
      if (!encryptedValue) return null;
      try {
        const parsed = JSON.parse(encryptedValue);
        return decrypt(parsed);
      } catch (error) {
        console.error(`Failed to decrypt ${tableName}.${columnName}:`, error);
        return null;
      }
    },
  };
}
```

### 🚦 Rate Limiting

#### API Rate Limiting
```javascript
// middleware/rate-limit.js
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

// General API rate limiting
export const apiLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:api:',
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    error: 'Too many requests',
    retryAfter: '15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiting for authentication endpoints
export const authLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:auth:',
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    error: 'Too many authentication attempts',
    retryAfter: '15 minutes',
  },
  skipSuccessfulRequests: true,
});

// Payment endpoint rate limiting
export const paymentLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:payment:',
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 payment attempts per hour
  message: {
    error: 'Too many payment attempts',
    retryAfter: '1 hour',
  },
});
```

#### Custom Rate Limiting
```javascript
// lib/rate-limit/custom.js
export class CustomRateLimiter {
  constructor(redis) {
    this.redis = redis;
  }

  async isAllowed(key, limit, windowMs) {
    const now = Date.now();
    const window = Math.floor(now / windowMs);
    const redisKey = `rate_limit:${key}:${window}`;
    
    const current = await this.redis.incr(redisKey);
    
    if (current === 1) {
      await this.redis.expire(redisKey, Math.ceil(windowMs / 1000));
    }
    
    return {
      allowed: current <= limit,
      remaining: Math.max(0, limit - current),
      resetTime: (window + 1) * windowMs,
    };
  }

  async checkIPReputation(ip) {
    const suspiciousKey = `suspicious:${ip}`;
    const suspiciousCount = await this.redis.get(suspiciousKey) || 0;
    
    if (suspiciousCount > 10) {
      return { blocked: true, reason: 'Suspicious activity detected' };
    }
    
    return { blocked: false };
  }
}
```

### 🔍 Security Headers

#### Comprehensive Security Headers
```javascript
// middleware/security-headers.js
export function securityHeaders(req, res, next) {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // XSS Protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // HTTPS Strict Transport Security
  res.setHeader(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  );
  
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'origin-when-cross-origin');
  
  // Content Security Policy
  const cspPolicy = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://js.stripe.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https:",
    "connect-src 'self' https://api.stripe.com https://*.supabase.co wss://*.supabase.co",
    "frame-src 'self' https://js.stripe.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join('; ');
  
  res.setHeader('Content-Security-Policy', cspPolicy);
  
  // Permissions Policy
  const permissionsPolicy = [
    'camera=()',
    'microphone=()',
    'geolocation=(self)',
    'payment=(self)',
    'usb=()',
  ].join(', ');
  
  res.setHeader('Permissions-Policy', permissionsPolicy);
  
  next();
}
```

#### CORS Configuration
```javascript
// middleware/cors.js
import cors from 'cors';

const allowedOrigins = [
  'https://sasarjan.app',
  'https://www.sasarjan.app',
  'https://talentexcel.com',
  'https://www.talentexcel.com',
  'https://10xgrowth.com',
  'https://www.10xgrowth.com',
  'https://sevapremi.com',
  'https://www.sevapremi.com',
  'https://admin.sasarjan.app',
];

if (process.env.NODE_ENV === 'development') {
  allowedOrigins.push('http://localhost:3000');
  allowedOrigins.push('http://localhost:3001');
  allowedOrigins.push('http://localhost:3002');
  allowedOrigins.push('http://localhost:3003');
  allowedOrigins.push('http://localhost:3004');
  allowedOrigins.push('http://localhost:3005');
}

export const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Authorization',
    'X-CSRF-Token',
  ],
};

export const corsMiddleware = cors(corsOptions);
```

### 🔐 SQL Injection Prevention

#### Parameterized Queries
```javascript
// lib/db/queries.js
import { pool } from './connection';

export class SafeQuery {
  static async getUserByEmail(email) {
    // ✅ Safe: Parameterized query
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  static async getUsersByRole(role, limit = 50) {
    // ✅ Safe: Parameterized with validation
    if (!['admin', 'user', 'moderator'].includes(role)) {
      throw new Error('Invalid role');
    }
    
    const query = 'SELECT * FROM users WHERE role = $1 LIMIT $2';
    const result = await pool.query(query, [role, limit]);
    return result.rows;
  }

  static async searchUsers(searchTerm) {
    // ✅ Safe: Escaped search term
    const escapedTerm = searchTerm.replace(/[%_]/g, '\\$&');
    const query = `
      SELECT id, email, full_name 
      FROM users 
      WHERE full_name ILIKE $1 
      OR email ILIKE $1
      LIMIT 20
    `;
    const result = await pool.query(query, [`%${escapedTerm}%`]);
    return result.rows;
  }
}
```

#### Query Builder with Validation
```javascript
// lib/db/query-builder.js
export class QueryBuilder {
  constructor(table) {
    this.table = table;
    this.whereClause = [];
    this.params = [];
    this.paramCount = 0;
  }

  where(column, operator, value) {
    // Validate column name (prevent SQL injection through column names)
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(column)) {
      throw new Error('Invalid column name');
    }

    // Validate operator
    const allowedOperators = ['=', '!=', '>', '<', '>=', '<=', 'LIKE', 'ILIKE', 'IN'];
    if (!allowedOperators.includes(operator.toUpperCase())) {
      throw new Error('Invalid operator');
    }

    this.paramCount++;
    this.whereClause.push(`${column} ${operator} $${this.paramCount}`);
    this.params.push(value);
    
    return this;
  }

  build() {
    const whereSQL = this.whereClause.length > 0 
      ? ` WHERE ${this.whereClause.join(' AND ')}`
      : '';
    
    return {
      query: `SELECT * FROM ${this.table}${whereSQL}`,
      params: this.params,
    };
  }
}
```

### 🔒 Audit Logging

#### Security Event Logging
```javascript
// lib/audit/logger.js
import { pool } from '../db/connection';

export class AuditLogger {
  static async logSecurityEvent(event) {
    const {
      userId,
      action,
      resource,
      ipAddress,
      userAgent,
      success,
      failureReason,
      metadata = {},
    } = event;

    const query = `
      INSERT INTO security_audit_log (
        user_id, action, resource, ip_address, user_agent,
        success, failure_reason, metadata, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
    `;

    const params = [
      userId,
      action,
      resource,
      ipAddress,
      userAgent,
      success,
      failureReason,
      JSON.stringify(metadata),
    ];

    await pool.query(query, params);
  }

  static async logAuthAttempt(attempt) {
    await this.logSecurityEvent({
      userId: attempt.userId,
      action: 'LOGIN_ATTEMPT',
      resource: 'auth',
      ipAddress: attempt.ipAddress,
      userAgent: attempt.userAgent,
      success: attempt.success,
      failureReason: attempt.failureReason,
      metadata: {
        method: attempt.method, // password, 2fa, oauth
        provider: attempt.provider,
      },
    });
  }

  static async logDataAccess(access) {
    await this.logSecurityEvent({
      userId: access.userId,
      action: 'DATA_ACCESS',
      resource: access.resource,
      ipAddress: access.ipAddress,
      userAgent: access.userAgent,
      success: true,
      metadata: {
        recordId: access.recordId,
        operation: access.operation, // read, write, delete
      },
    });
  }
}
```

#### Database Schema for Audit Log
```sql
-- Create audit log table
CREATE TABLE security_audit_log (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  resource VARCHAR(100) NOT NULL,
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN NOT NULL,
  failure_reason TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_security_audit_user_id ON security_audit_log(user_id);
CREATE INDEX idx_security_audit_action ON security_audit_log(action);
CREATE INDEX idx_security_audit_created_at ON security_audit_log(created_at);
CREATE INDEX idx_security_audit_ip ON security_audit_log(ip_address);
```

---

## 🛡️ Security Monitoring

### Real-time Security Monitoring
```javascript
// lib/security/monitor.js
import { AuditLogger } from '../audit/logger';
import { sendAlert } from '../alerts';

export class SecurityMonitor {
  static async detectSuspiciousActivity(userId, action, metadata) {
    // Check for rapid fire requests
    const recentActions = await this.getRecentActions(userId, action, 5 * 60 * 1000); // 5 minutes
    
    if (recentActions.length > 10) {
      await this.flagSuspiciousActivity(userId, 'RAPID_REQUESTS', {
        action,
        count: recentActions.length,
        timeframe: '5 minutes',
      });
    }

    // Check for unusual IP patterns
    const userIPs = await this.getUserIPs(userId, 24 * 60 * 60 * 1000); // 24 hours
    
    if (userIPs.length > 5) {
      await this.flagSuspiciousActivity(userId, 'MULTIPLE_IPS', {
        ipCount: userIPs.length,
        ips: userIPs,
      });
    }

    // Check for failed authentication attempts
    if (action === 'LOGIN_ATTEMPT' && !metadata.success) {
      const failedAttempts = await this.getFailedLoginAttempts(metadata.ipAddress, 15 * 60 * 1000);
      
      if (failedAttempts.length > 5) {
        await this.flagSuspiciousActivity(null, 'BRUTE_FORCE_ATTEMPT', {
          ipAddress: metadata.ipAddress,
          attempts: failedAttempts.length,
        });
      }
    }
  }

  static async flagSuspiciousActivity(userId, type, details) {
    // Log to audit system
    await AuditLogger.logSecurityEvent({
      userId,
      action: 'SUSPICIOUS_ACTIVITY_DETECTED',
      resource: 'security_monitor',
      success: true,
      metadata: { type, details },
    });

    // Send alert to security team
    await sendAlert('Security Alert', {
      type,
      userId,
      details,
      timestamp: new Date().toISOString(),
    });

    // Implement automatic response if needed
    await this.automatedResponse(type, userId, details);
  }

  static async automatedResponse(type, userId, details) {
    switch (type) {
      case 'BRUTE_FORCE_ATTEMPT':
        // Temporarily block IP
        await this.blockIP(details.ipAddress, 30 * 60 * 1000); // 30 minutes
        break;
        
      case 'RAPID_REQUESTS':
        // Rate limit user more aggressively
        await this.enhanceRateLimit(userId, 60 * 60 * 1000); // 1 hour
        break;
        
      case 'MULTIPLE_IPS':
        // Require additional verification
        await this.requireAdditionalVerification(userId);
        break;
    }
  }
}
```

---

## 🎯 Security Checklist

### Authentication & Authorization
- [ ] Strong password requirements enforced
- [ ] Two-factor authentication implemented
- [ ] JWT tokens properly secured
- [ ] Session management secure
- [ ] Role-based access control implemented
- [ ] Admin access properly restricted

### Data Protection
- [ ] Sensitive data encrypted at rest
- [ ] PII data encrypted in database
- [ ] Data transmission encrypted (HTTPS)
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention implemented
- [ ] XSS protection enabled

### Infrastructure Security
- [ ] Security headers configured
- [ ] CORS properly configured
- [ ] Rate limiting implemented
- [ ] Firewall rules configured
- [ ] Regular security updates scheduled
- [ ] SSL certificates configured and auto-renewing

### Monitoring & Auditing
- [ ] Security event logging implemented
- [ ] Audit trail for sensitive operations
- [ ] Real-time security monitoring active
- [ ] Automated threat detection enabled
- [ ] Security alerts configured
- [ ] Incident response plan documented

### Compliance & Privacy
- [ ] GDPR compliance measures implemented
- [ ] Data retention policies defined
- [ ] User consent mechanisms in place
- [ ] Right to data deletion implemented
- [ ] Privacy policy updated
- [ ] Terms of service reviewed

---

## 🚨 Incident Response

### Security Incident Response Plan
```javascript
// lib/security/incident-response.js
export class IncidentResponse {
  static async handleSecurityIncident(incident) {
    const { type, severity, details } = incident;

    // Log incident
    await AuditLogger.logSecurityEvent({
      action: 'SECURITY_INCIDENT',
      resource: 'incident_response',
      success: true,
      metadata: incident,
    });

    // Escalate based on severity
    switch (severity) {
      case 'critical':
        await this.criticalIncidentResponse(incident);
        break;
      case 'high':
        await this.highIncidentResponse(incident);
        break;
      case 'medium':
        await this.mediumIncidentResponse(incident);
        break;
      default:
        await this.standardIncidentResponse(incident);
    }
  }

  static async criticalIncidentResponse(incident) {
    // Immediate containment
    await this.enableEmergencyMode();
    
    // Alert security team immediately
    await sendAlert('CRITICAL SECURITY INCIDENT', incident, 'critical');
    
    // Start incident timeline
    await this.createIncidentTimeline(incident);
  }

  static async enableEmergencyMode() {
    // Implement emergency security measures
    // - Enhanced rate limiting
    // - Additional authentication requirements
    // - Temporary feature restrictions
  }
}
```

---

**✅ Security configuration is complete when all measures are implemented and monitoring shows no critical vulnerabilities.**