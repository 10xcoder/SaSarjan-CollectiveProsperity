import { supabaseUtils } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('Testing Supabase connection...')
    
    // Use the utility function to test connection
    const { success, error } = await supabaseUtils.testConnection()
    
    if (!success) {
      console.error('Supabase connection failed:', error)
      
      // Check if it's a table not found error (schema not set up)
      if (error?.includes('relation "users" does not exist') || error?.includes('PGRST116')) {
        return NextResponse.json({ 
          success: true, 
          message: 'Supabase connection successful - database schema needs setup',
          needsMigration: true,
          error: null,
          timestamp: new Date().toISOString()
        })
      }
      
      return NextResponse.json(
        { 
          success: false, 
          message: 'Failed to connect to Supabase',
          error,
          needsMigration: false,
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Supabase connection and database schema successful',
      needsMigration: false,
      error: null,
      timestamp: new Date().toISOString()
    })
  } catch (error: unknown) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Unexpected error testing Supabase connection',
        error: error instanceof Error ? error.message : 'Unknown error',
        needsMigration: false,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}