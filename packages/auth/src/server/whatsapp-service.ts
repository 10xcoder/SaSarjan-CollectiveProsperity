import { createClient } from '@supabase/supabase-js'

interface WhatsAppVerificationData {
  phone: string
  fullName?: string
  type: 'signup' | 'signin'
  code: string
  expiresAt: Date
}

interface WhatsAppServiceConfig {
  supabaseUrl: string
  supabaseServiceKey: string
  provider: 'twilio' | 'whatsapp_business' | 'meta_cloud'
  // Twilio config
  twilioAccountSid?: string
  twilioAuthToken?: string
  twilioWhatsAppNumber?: string
  // Meta WhatsApp Business config
  metaAccessToken?: string
  metaPhoneNumberId?: string
  metaBusinessAccountId?: string
}

export class WhatsAppService {
  private supabase: ReturnType<typeof createClient>
  private config: WhatsAppServiceConfig

  constructor(config: WhatsAppServiceConfig) {
    this.config = config
    this.supabase = createClient(config.supabaseUrl, config.supabaseServiceKey)
  }

  // Generate a 6-digit verification code
  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  // Normalize phone number to international format
  private normalizePhoneNumber(phone: string): string {
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '')
    
    // Add country code if missing (assuming +1 for US/Canada, modify as needed)
    if (cleaned.length === 10) {
      cleaned = '1' + cleaned
    }
    
    // Ensure it starts with country code
    if (!cleaned.startsWith('1') && cleaned.length === 11) {
      // For other countries, you'd implement proper country code detection
    }
    
    return '+' + cleaned
  }

  // Store verification code in database
  private async storeVerificationCode(phone: string, code: string, type: string): Promise<void> {
    const normalizedPhone = this.normalizePhoneNumber(phone)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    const { error } = await this.supabase
      .from('whatsapp_verifications')
      .upsert({
        phone: normalizedPhone,
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
  async verifyCode(phone: string, code: string, type: string): Promise<boolean> {
    const normalizedPhone = this.normalizePhoneNumber(phone)

    const { data, error } = await this.supabase
      .from('whatsapp_verifications')
      .select('*')
      .eq('phone', normalizedPhone)
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
      .from('whatsapp_verifications')
      .update({ verified: true })
      .eq('id', (data as any).id)

    return true
  }

  // Send WhatsApp message using Twilio
  private async sendMessageWithTwilio(phone: string, message: string): Promise<void> {
    if (!this.config.twilioAccountSid || !this.config.twilioAuthToken || !this.config.twilioWhatsAppNumber) {
      throw new Error('Twilio configuration missing')
    }

    const normalizedPhone = this.normalizePhoneNumber(phone)
    const url = `https://api.twilio.com/2010-04-01/Accounts/${this.config.twilioAccountSid}/Messages.json`
    
    const credentials = btoa(`${this.config.twilioAccountSid}:${this.config.twilioAuthToken}`)

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        From: `whatsapp:${this.config.twilioWhatsAppNumber}`,
        To: `whatsapp:${normalizedPhone}`,
        Body: message
      })
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Twilio API error: ${error}`)
    }
  }

  // Send WhatsApp message using Meta Cloud API
  private async sendMessageWithMeta(phone: string, message: string): Promise<void> {
    if (!this.config.metaAccessToken || !this.config.metaPhoneNumberId) {
      throw new Error('Meta WhatsApp configuration missing')
    }

    const normalizedPhone = this.normalizePhoneNumber(phone).replace('+', '')
    const url = `https://graph.facebook.com/v18.0/${this.config.metaPhoneNumberId}/messages`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.metaAccessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: normalizedPhone,
        type: 'text',
        text: {
          preview_url: false,
          body: message
        }
      })
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Meta WhatsApp API error: ${error}`)
    }
  }

  // Generate WhatsApp message
  private generateMessage(code: string, type: string, fullName?: string): string {
    const greeting = fullName ? `Hi ${fullName}` : 'Hi there'
    const actionText = type === 'signup' ? 'complete your registration' : 'sign in to your account'

    return `🚀 *SaSarjan Verification*

${greeting}! 

Your verification code is: *${code}*

Use this code to ${actionText} on the SaSarjan platform.

⏰ This code expires in 10 minutes.

If you didn't request this, please ignore this message.

---
SaSarjan - Collective Prosperity Platform`
  }

  // Send verification code via WhatsApp template (more professional)
  private async sendTemplateMessage(phone: string, code: string): Promise<void> {
    if (this.config.provider === 'meta_cloud' && this.config.metaAccessToken && this.config.metaPhoneNumberId) {
      const normalizedPhone = this.normalizePhoneNumber(phone).replace('+', '')
      const url = `https://graph.facebook.com/v18.0/${this.config.metaPhoneNumberId}/messages`

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.metaAccessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: normalizedPhone,
          type: 'template',
          template: {
            name: 'verification_code', // You need to create this template in Meta Business Manager
            language: {
              code: 'en'
            },
            components: [
              {
                type: 'body',
                parameters: [
                  {
                    type: 'text',
                    text: code
                  }
                ]
              }
            ]
          }
        })
      })

      if (!response.ok) {
        // Fallback to regular text message
        throw new Error('Template message failed, falling back to text')
      }
    } else {
      throw new Error('Template messages only supported with Meta Cloud API')
    }
  }

  // Main method to send verification via WhatsApp
  async sendVerificationCode(phone: string, type: 'signup' | 'signin', fullName?: string): Promise<string> {
    const code = this.generateVerificationCode()

    try {
      // Store the code
      await this.storeVerificationCode(phone, code, type)

      // Generate message
      const message = this.generateMessage(code, type, fullName)

      // Try template message first (more professional), fallback to text
      try {
        await this.sendTemplateMessage(phone, code)
      } catch (templateError) {
        // Fallback to regular text message
        switch (this.config.provider) {
          case 'twilio':
            await this.sendMessageWithTwilio(phone, message)
            break
          case 'meta_cloud':
          case 'whatsapp_business':
            await this.sendMessageWithMeta(phone, message)
            break
          default:
            throw new Error('Invalid WhatsApp provider')
        }
      }

      return code // Return for testing purposes only
    } catch (error) {
      throw new Error(`Failed to send WhatsApp verification: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Validate phone number format
  validatePhoneNumber(phone: string): boolean {
    const normalized = this.normalizePhoneNumber(phone)
    // Basic validation - phone should be 10-15 digits with country code
    return /^\+\d{10,15}$/.test(normalized)
  }

  // Get delivery status (for Twilio)
  async getMessageStatus(messageId: string): Promise<string | null> {
    if (this.config.provider !== 'twilio' || !this.config.twilioAccountSid || !this.config.twilioAuthToken) {
      return null
    }

    const url = `https://api.twilio.com/2010-04-01/Accounts/${this.config.twilioAccountSid}/Messages/${messageId}.json`
    const credentials = btoa(`${this.config.twilioAccountSid}:${this.config.twilioAuthToken}`)

    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Basic ${credentials}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        return data.status
      }
    } catch (error) {
      console.error('Error fetching message status:', error)
    }

    return null
  }

  // Clean up expired codes
  async cleanupExpiredCodes(): Promise<void> {
    const { error } = await this.supabase
      .from('whatsapp_verifications')
      .delete()
      .lt('expires_at', new Date().toISOString())

    if (error) {
      console.error('Failed to cleanup expired codes:', error)
    }
  }

  // Rate limiting check
  async checkRateLimit(phone: string): Promise<{ allowed: boolean; resetTime?: Date }> {
    const normalizedPhone = this.normalizePhoneNumber(phone)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)

    const { data, error } = await this.supabase
      .from('whatsapp_verifications')
      .select('created_at')
      .eq('phone', normalizedPhone)
      .gte('created_at', oneHourAgo.toISOString())

    if (error) {
      console.error('Error checking rate limit:', error)
      return { allowed: true }
    }

    // Allow max 3 codes per hour
    if (data && data.length >= 3) {
      const oldestAttempt = new Date(data[data.length - 1].created_at as string)
      const resetTime = new Date(oldestAttempt.getTime() + 60 * 60 * 1000)
      return { allowed: false, resetTime }
    }

    return { allowed: true }
  }
}

// Factory function
export function createWhatsAppService(config: WhatsAppServiceConfig): WhatsAppService {
  return new WhatsAppService(config)
}