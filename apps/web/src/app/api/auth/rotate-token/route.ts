import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { nanoid } from 'nanoid'

// Initialize Supabase client with service role key for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json()
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }
    
    // Get the current session
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      )
    }
    
    const token = authHeader.substring(7)
    
    // Verify the current token
    const { data: { user }, error: verifyError } = await supabase.auth.getUser(token)
    
    if (verifyError || !user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }
    
    // Generate a new session token
    // In a real implementation, this would create a new JWT with updated claims
    const newToken = `${sessionId}_${nanoid()}_${Date.now()}`
    
    // Store the new token mapping in the database
    const { error: updateError } = await supabase
      .from('auth_sessions')
      .update({ 
        token_version: supabase.sql`token_version + 1`,
        last_rotated_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId)
      .eq('user_id', user.id)
    
    if (updateError) {
      console.error('Failed to update session:', updateError)
      return NextResponse.json(
        { error: 'Failed to rotate token' },
        { status: 500 }
      )
    }
    
    // Return the new token
    return NextResponse.json({
      newToken,
      expiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes
      sessionId
    })
    
  } catch (error) {
    console.error('Token rotation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}