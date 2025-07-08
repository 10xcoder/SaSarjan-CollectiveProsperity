// Environment configuration with validation and defaults

export const env = {
  // Supabase
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',

  // Email Configuration
  EMAIL_PROVIDER: (process.env.EMAIL_PROVIDER as 'supabase' | 'resend' | 'sendgrid') || 'supabase',
  FROM_EMAIL: process.env.FROM_EMAIL || 'noreply@sasarjan.com',
  FROM_NAME: process.env.FROM_NAME || 'SaSarjan',
  RESEND_API_KEY: process.env.RESEND_API_KEY || '',
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY || '',

  // WhatsApp Configuration
  WHATSAPP_PROVIDER: (process.env.WHATSAPP_PROVIDER as 'twilio' | 'meta_cloud') || 'twilio',
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID || '',
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN || '',
  TWILIO_WHATSAPP_NUMBER: process.env.TWILIO_WHATSAPP_NUMBER || '',
  META_ACCESS_TOKEN: process.env.META_ACCESS_TOKEN || '',
  META_PHONE_NUMBER_ID: process.env.META_PHONE_NUMBER_ID || '',

  // Development Mode
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',

  // App Configuration
  APP_URL: process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
}

// Validation function
export function validateEnv() {
  const warnings: string[] = []
  const errors: string[] = []

  // Required for basic functionality
  if (!env.SUPABASE_URL) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL is required')
  }
  if (!env.SUPABASE_ANON_KEY) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is required')
  }
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    errors.push('SUPABASE_SERVICE_ROLE_KEY is required for API routes')
  }

  // Email configuration warnings
  if (env.EMAIL_PROVIDER === 'resend' && !env.RESEND_API_KEY) {
    warnings.push('RESEND_API_KEY is not set, email verification will not work')
  }
  if (env.EMAIL_PROVIDER === 'sendgrid' && !env.SENDGRID_API_KEY) {
    warnings.push('SENDGRID_API_KEY is not set, email verification will not work')
  }

  // WhatsApp configuration warnings
  if (env.WHATSAPP_PROVIDER === 'twilio' && (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN)) {
    warnings.push('Twilio credentials not set, WhatsApp verification will not work')
  }
  if (env.WHATSAPP_PROVIDER === 'meta_cloud' && (!env.META_ACCESS_TOKEN || !env.META_PHONE_NUMBER_ID)) {
    warnings.push('Meta WhatsApp credentials not set, WhatsApp verification will not work')
  }

  // Log warnings and errors
  if (warnings.length > 0) {
    console.warn('Environment configuration warnings:')
    warnings.forEach(warning => console.warn(`  - ${warning}`))
  }

  if (errors.length > 0) {
    console.error('Environment configuration errors:')
    errors.forEach(error => console.error(`  - ${error}`))
    
    if (!env.IS_DEVELOPMENT) {
      throw new Error('Required environment variables are missing')
    }
  }

  return { warnings, errors }
}

// Validate on import in non-test environments
if (typeof window === 'undefined' && process.env.NODE_ENV !== 'test') {
  validateEnv()
}