import { createClient } from '@supabase/supabase-js'

interface EmailVerificationData {
  email: string
  fullName?: string
  type: 'signup' | 'signin' | 'password_reset'
  code: string
  expiresAt: Date
}

interface EmailServiceConfig {
  supabaseUrl: string
  supabaseServiceKey: string
  emailProvider: 'supabase' | 'resend' | 'sendgrid'
  fromEmail: string
  fromName: string
  resendApiKey?: string
  sendgridApiKey?: string
}

export class EmailService {
  private supabase: ReturnType<typeof createClient>
  private config: EmailServiceConfig

  constructor(config: EmailServiceConfig) {
    if (!config.supabaseUrl) {
      throw new Error('supabaseUrl is required')
    }
    if (!config.supabaseServiceKey) {
      throw new Error('supabaseKey is required')
    }
    
    this.config = config
    this.supabase = createClient(config.supabaseUrl, config.supabaseServiceKey)
  }

  // Generate a 6-digit verification code
  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  // Store verification code in database
  private async storeVerificationCode(email: string, code: string, type: string): Promise<void> {
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    const { error } = await this.supabase
      .from('email_verifications')
      .upsert({
        email,
        code,
        type,
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString(),
        verified: false
      })

    if (error) {
      throw new Error(`Failed to store verification code: ${error.message}`)
    }
  }

  // Verify the code
  async verifyCode(email: string, code: string, type: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('email_verifications')
      .select('*')
      .eq('email', email)
      .eq('code', code)
      .eq('type', type)
      .eq('verified', false)
      .gte('expires_at', new Date().toISOString())
      .single()

    if (error || !data) {
      return false
    }

    // Mark as verified
    await this.supabase
      .from('email_verifications')
      .update({ verified: true })
      .eq('id', (data as any).id)

    return true
  }

  // Send verification email using Supabase Auth
  private async sendEmailWithSupabase(email: string, code: string, type: string, fullName?: string): Promise<void> {
    // For Supabase, we can use the built-in email templates
    // This is a simplified version - in production you'd customize the template
    
    const { error } = await this.supabase.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: {
        data: {
          verification_code: code,
          verification_type: type,
          full_name: fullName
        }
      }
    })

    if (error) {
      throw new Error(`Failed to send email: ${error.message}`)
    }
  }

  // Send verification email using Resend
  private async sendEmailWithResend(email: string, code: string, type: string, fullName?: string): Promise<void> {
    if (!this.config.resendApiKey) {
      throw new Error('Resend API key not configured')
    }

    const subject = this.getEmailSubject(type)
    const html = this.generateEmailHTML(code, type, fullName)

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: `${this.config.fromName} <${this.config.fromEmail}>`,
        to: [email],
        subject,
        html
      })
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to send email: ${error}`)
    }
  }

  // Send verification email using SendGrid
  private async sendEmailWithSendGrid(email: string, code: string, type: string, fullName?: string): Promise<void> {
    if (!this.config.sendgridApiKey) {
      throw new Error('SendGrid API key not configured')
    }

    const subject = this.getEmailSubject(type)
    const html = this.generateEmailHTML(code, type, fullName)

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.sendgridApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email }],
          subject
        }],
        from: {
          email: this.config.fromEmail,
          name: this.config.fromName
        },
        content: [{
          type: 'text/html',
          value: html
        }]
      })
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to send email: ${error}`)
    }
  }

  // Get email subject based on type
  private getEmailSubject(type: string): string {
    switch (type) {
      case 'signup':
        return 'Welcome to SaSarjan - Verify your email'
      case 'signin':
        return 'Sign in to SaSarjan - Verification code'
      case 'password_reset':
        return 'Reset your SaSarjan password'
      default:
        return 'SaSarjan Verification Code'
    }
  }

  // Generate email HTML template
  private generateEmailHTML(code: string, type: string, fullName?: string): string {
    const greeting = fullName ? `Hi ${fullName}` : 'Hi there'
    const actionText = type === 'signup' ? 'complete your registration' : 
                      type === 'signin' ? 'sign in to your account' : 
                      'reset your password'

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>SaSarjan Verification</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0;">SaSarjan</h1>
            <p style="color: #666; margin: 5px 0;">Collective Prosperity Platform</p>
          </div>
          
          <div style="background: #f8fafc; border-radius: 12px; padding: 30px; margin-bottom: 30px;">
            <h2 style="margin: 0 0 20px; color: #1e293b;">${greeting}!</h2>
            <p style="margin: 0 0 20px; color: #475569;">
              Use this verification code to ${actionText}:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <div style="display: inline-block; background: #2563eb; color: white; font-size: 32px; font-weight: bold; padding: 16px 24px; border-radius: 8px; letter-spacing: 4px; font-family: 'Courier New', monospace;">
                ${code}
              </div>
            </div>
            
            <p style="margin: 20px 0 0; color: #64748b; font-size: 14px;">
              This code will expire in <strong>10 minutes</strong> for security reasons.
            </p>
          </div>
          
          <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center;">
            <p style="margin: 0; color: #64748b; font-size: 14px;">
              If you didn't request this code, you can safely ignore this email.
            </p>
            <p style="margin: 10px 0 0; color: #64748b; font-size: 12px;">
              © 2024 SaSarjan. All rights reserved.
            </p>
          </div>
        </body>
      </html>
    `
  }

  // Main method to send verification email
  async sendVerificationEmail(email: string, type: 'signup' | 'signin' | 'password_reset', fullName?: string): Promise<string> {
    const code = this.generateVerificationCode()

    try {
      // Store the code
      await this.storeVerificationCode(email, code, type)

      // Send the email
      switch (this.config.emailProvider) {
        case 'supabase':
          await this.sendEmailWithSupabase(email, code, type, fullName)
          break
        case 'resend':
          await this.sendEmailWithResend(email, code, type, fullName)
          break
        case 'sendgrid':
          await this.sendEmailWithSendGrid(email, code, type, fullName)
          break
        default:
          throw new Error('Invalid email provider')
      }

      return code // Return for testing purposes only
    } catch (error) {
      throw new Error(`Failed to send verification email: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Clean up expired codes
  async cleanupExpiredCodes(): Promise<void> {
    const { error } = await this.supabase
      .from('email_verifications')
      .delete()
      .lt('expires_at', new Date().toISOString())

    if (error) {
      console.error('Failed to cleanup expired codes:', error)
    }
  }
}

// Factory function
export function createEmailService(config: EmailServiceConfig): EmailService {
  return new EmailService(config)
}