import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createEmailService, createWhatsAppService } from '@sasarjan/auth'
import { AuthService } from '@sasarjan/auth'
import { ratelimit } from '@/lib/ratelimit'
import { env } from '@/lib/env'

const verifyCodeSchema = z.object({
  method: z.enum(['email', 'phone']),
  identifier: z.string().min(1),
  code: z.string().length(6),
  type: z.enum(['signup', 'signin']),
  userData: z.object({
    fullName: z.string().optional(),
    password: z.string().optional()
  }).optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { method, identifier, code, type, userData } = verifyCodeSchema.parse(body)

    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const rateLimitResult = await ratelimit.limit(`verify_${ip}_${identifier}`)
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many verification attempts' },
        { status: 429 }
      )
    }

    let isValidCode = false

    if (method === 'email') {
      const emailService = createEmailService({
        supabaseUrl: env.SUPABASE_URL,
        supabaseServiceKey: env.SUPABASE_SERVICE_ROLE_KEY,
        emailProvider: env.EMAIL_PROVIDER,
        fromEmail: env.FROM_EMAIL,
        fromName: env.FROM_NAME,
        resendApiKey: env.RESEND_API_KEY,
        sendgridApiKey: env.SENDGRID_API_KEY
      })

      isValidCode = await emailService.verifyCode(identifier, code, type)
    } else if (method === 'phone') {
      const whatsappService = createWhatsAppService({
        supabaseUrl: env.SUPABASE_URL,
        supabaseServiceKey: env.SUPABASE_SERVICE_ROLE_KEY,
        provider: env.WHATSAPP_PROVIDER,
        twilioAccountSid: env.TWILIO_ACCOUNT_SID,
        twilioAuthToken: env.TWILIO_AUTH_TOKEN,
        twilioWhatsAppNumber: env.TWILIO_WHATSAPP_NUMBER,
        metaAccessToken: env.META_ACCESS_TOKEN,
        metaPhoneNumberId: env.META_PHONE_NUMBER_ID
      })

      isValidCode = await whatsappService.verifyCode(identifier, code, type)
    }

    if (!isValidCode) {
      return NextResponse.json(
        { error: 'Invalid or expired verification code' },
        { status: 400 }
      )
    }

    // Code verified successfully
    const authService = new AuthService({
      supabaseUrl: env.SUPABASE_URL,
      supabaseAnonKey: env.SUPABASE_ANON_KEY
    })

    if (type === 'signup') {
      // Handle signup
      if (method === 'email') {
        if (!userData?.password) {
          return NextResponse.json(
            { error: 'Password is required for email signup' },
            { status: 400 }
          )
        }

        try {
          const session = await authService.signUp({
            email: identifier,
            password: userData.password,
            full_name: userData.fullName,
            metadata: {
              email_verified: true,
              verification_method: 'email'
            }
          })

          return NextResponse.json({
            success: true,
            session,
            message: 'Account created successfully'
          })
        } catch (error) {
          console.error('Signup error:', error)
          return NextResponse.json(
            { error: 'Failed to create account' },
            { status: 500 }
          )
        }
      } else {
        // Phone signup - create account with phone as identifier
        try {
          // For phone signup, we'll create a temporary email or use phone as identifier
          const tempEmail = `${identifier.replace(/\+/g, '').replace(/\s/g, '')}@phone.sasarjan.com`
          const tempPassword = generateSecurePassword()

          const session = await authService.signUp({
            email: tempEmail,
            password: tempPassword,
            full_name: userData?.fullName,
            metadata: {
              phone: identifier,
              phone_verified: true,
              verification_method: 'phone',
              is_phone_account: true
            }
          })

          return NextResponse.json({
            success: true,
            session,
            message: 'Account created successfully'
          })
        } catch (error) {
          console.error('Phone signup error:', error)
          return NextResponse.json(
            { error: 'Failed to create account' },
            { status: 500 }
          )
        }
      }
    } else {
      // Handle signin - return success for passwordless login
      // The frontend will handle the actual authentication
      return NextResponse.json({
        success: true,
        verified: true,
        message: 'Verification successful'
      })
    }

  } catch (error) {
    console.error('Verify code error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    )
  }
}

function generateSecurePassword(): string {
  const length = 24
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
  let password = ''
  
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  
  return password
}