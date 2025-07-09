import { NextResponse } from 'next/server'
import { jwtProtection, getRequestUser } from '@sasarjan/auth/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Protected GET endpoint - get user profile
export const GET = jwtProtection(async (req) => {
  try {
    // Get authenticated user from request
    const user = await getRequestUser(req)
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Fetch user profile from database
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    if (error) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        ...profile
      }
    })
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})

// Protected POST endpoint - update user profile
export const POST = jwtProtection(async (req) => {
  try {
    const user = await getRequestUser(req)
    const updates = await req.json()
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Validate updates
    const allowedFields = ['full_name', 'bio', 'avatar_url', 'location', 'website']
    const sanitizedUpdates = Object.keys(updates)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key]
        return obj
      }, {} as any)
    
    // Update profile
    const { data: profile, error } = await supabase
      .from('profiles')
      .update({
        ...sanitizedUpdates,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single()
    
    if (error) {
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 400 }
      )
    }
    
    return NextResponse.json({
      message: 'Profile updated successfully',
      profile
    })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})