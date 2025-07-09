/**
 * Centralized auth configuration for all SaSarjan apps
 * This ensures consistent auth behavior across the platform
 */

export interface AppAuthConfig {
  id: string
  name: string
  url: string
  description: string
  permissions: string[]
  roles: string[]
}

export const SASARJAN_AUTH_APPS: Record<string, AppAuthConfig> = {
  'sasarjan-web': {
    id: 'sasarjan-web',
    name: 'SaSarjan Web',
    url: process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3000',
    description: 'Main SaSarjan App Store platform',
    permissions: ['browse', 'install', 'rate', 'review'],
    roles: ['customer', 'developer', 'admin']
  },
  
  'sasarjan-admin': {
    id: 'sasarjan-admin',
    name: 'SaSarjan Admin',
    url: process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3001',
    description: 'Admin dashboard for platform management',
    permissions: ['manage_users', 'manage_apps', 'view_analytics', 'manage_revenue'],
    roles: ['admin']
  },
  
  'talentexcel': {
    id: 'talentexcel',
    name: 'TalentExcel',
    url: process.env.NEXT_PUBLIC_TALENTEXCEL_URL || 'http://localhost:3002',
    description: 'Recruitment and talent management platform',
    permissions: ['create_jobs', 'view_candidates', 'manage_interviews'],
    roles: ['customer', 'recruiter', 'candidate']
  },
  
  'sevapremi': {
    id: 'sevapremi',
    name: 'SevaPremi',
    url: process.env.NEXT_PUBLIC_SEVAPREMI_URL || 'http://localhost:3003',
    description: 'Community service and volunteering platform',
    permissions: ['create_events', 'join_events', 'track_hours'],
    roles: ['volunteer', 'organizer', 'admin']
  },
  
  '10xgrowth': {
    id: '10xgrowth',
    name: '10x Growth',
    url: process.env.NEXT_PUBLIC_10XGROWTH_URL || 'http://localhost:3004',
    description: 'Business growth and analytics platform',
    permissions: ['view_analytics', 'create_campaigns', 'manage_leads'],
    roles: ['business_owner', 'marketer', 'analyst']
  }
}

// Get app config by ID
export function getAppConfig(appId: string): AppAuthConfig | null {
  return SASARJAN_AUTH_APPS[appId] || null
}

// Validate app permissions
export function validateAppPermission(appId: string, permission: string): boolean {
  const app = getAppConfig(appId)
  return app ? app.permissions.includes(permission) : false
}

// Get all trusted app IDs for cross-app sync
export function getTrustedAppIds(): string[] {
  return Object.keys(SASARJAN_AUTH_APPS)
}

// Cookie domain configuration
export const AUTH_COOKIE_CONFIG = {
  domain: process.env.NODE_ENV === 'production' 
    ? '.sasarjan.com'  // Production domain
    : undefined,       // No domain restriction in development
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  httpOnly: true,
  path: '/'
}

// JWT configuration
export const JWT_CONFIG = {
  algorithm: 'RS256' as const,
  issuer: 'sasarjan-auth',
  audience: 'sasarjan-apps',
  accessTokenExpiry: '1h',
  refreshTokenExpiry: '7d'
}

// Session configuration
export const SESSION_CONFIG = {
  sessionTimeout: 60 * 60 * 1000,      // 1 hour
  activityTimeout: 30 * 60 * 1000,    // 30 minutes
  refreshThreshold: 0.8,               // Refresh at 80% of lifetime
  maxConcurrentSessions: 5,
  enableFingerprinting: true,
  enableActivityTracking: true
}

// Security configuration
export const SECURITY_CONFIG = {
  bcryptRounds: 10,
  maxLoginAttempts: 5,
  lockoutDuration: 15 * 60 * 1000,     // 15 minutes
  passwordMinLength: 8,
  passwordRequireSpecial: true,
  passwordRequireNumber: true,
  passwordRequireUppercase: true
}