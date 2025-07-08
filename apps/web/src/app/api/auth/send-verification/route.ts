import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createWhatsAppService } from '@sasarjan/auth'
import { ratelimit } from '@/lib/ratelimit'
import { env } from '@/lib/env'
import { createClient } from '@supabase/supabase-js'

const sendVerificationSchema = z.object({
  method: z.enum(['email', 'phone']),
  identifier: z.string().min(1),
  type: z.enum(['signup', 'signin']),
  fullName: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { method, identifier, type, fullName } = sendVerificationSchema.parse(body)

    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const rateLimitResult = await ratelimit.limit(`auth_${ip}_${identifier}`)
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          error: 'Too many requests', 
          resetTime: new Date(Date.now() + rateLimitResult.reset * 1000) 
        },
        { status: 429 }
      )
    }

    if (method === 'email') {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(identifier)) {
        return NextResponse.json(
          { error: 'Invalid email format' },
          { status: 400 }
        )
      }

      // Send magic link using Supabase Auth
      const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
      
      const { error } = await supabase.auth.signInWithOtp({
        email: identifier,
        options: {
          emailRedirectTo: `${env.APP_URL}/auth/callback`,
        }
      })

      if (error) {
        console.error('Magic link error:', error)
        return NextResponse.json(
          { error: 'Failed to send magic link' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Magic link sent to your email'
      })

    } else if (method === 'phone') {
      // Validate phone format
      const phoneRegex = /^(\+\d{1,3}[- ]?)?\d{10,}$/
      if (!phoneRegex.test(identifier.replace(/\s/g, ''))) {
        return NextResponse.json(
          { error: 'Invalid phone number format' },
          { status: 400 }
        )
      }

      // Send WhatsApp verification
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

      // Check rate limit for this phone number
      const rateLimit = await whatsappService.checkRateLimit(identifier)
      if (!rateLimit.allowed) {
        return NextResponse.json(
          { 
            error: 'Too many verification attempts', 
            resetTime: rateLimit.resetTime 
          },
          { status: 429 }
        )
      }

      await whatsappService.sendVerificationCode(identifier, type, fullName)

      return NextResponse.json({
        success: true,
        message: 'Verification code sent to your WhatsApp'
      })
    }

    return NextResponse.json(
      { error: 'Invalid method' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Send verification error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to send verification code' },
      { status: 500 }
    )
  }
}