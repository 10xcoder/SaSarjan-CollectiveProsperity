import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'
import { env } from '@/lib/env'

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(1)
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, fullName } = signupSchema.parse(body)

    // Create Supabase client
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY)

    // Sign up with email and password
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        },
        emailRedirectTo: `${env.APP_URL}/auth/callback`
      }
    })

    if (error) {
      console.error('Sign up error:', error)
      return NextResponse.json(
        { error: error.message || 'Sign up failed' },
        { status: 400 }
      )
    }

    if (!data.user) {
      return NextResponse.json(
        { error: 'Sign up failed' },
        { status: 400 }
      )
    }

    // Check if email confirmation is required
    if (!data.session && data.user && !data.user.email_confirmed_at) {
      return NextResponse.json({
        success: true,
        message: 'Please check your email to confirm your account',
        emailConfirmationSent: true,
        user: {
          id: data.user.id,
          email: data.user.email
        }
      })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        user_metadata: data.user.user_metadata
      },
      session: data.session
    })

  } catch (error) {
    console.error('Sign up error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Sign up failed' },
      { status: 500 }
    )
  }
}