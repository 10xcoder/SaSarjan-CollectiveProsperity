import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { env } from '@/lib/env'

export async function GET(request: NextRequest) {
  try {
    // Get user session
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Create Supabase client
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

    // Get current user from auth header
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication' },
        { status: 401 }
      )
    }

    // Get developer profile
    const { data: developer, error: developerError } = await supabase
      .from('developers')
      .select(`
        id,
        company_name,
        status,
        verified_at,
        created_at,
        apps (
          id,
          name,
          status
        )
      `)
      .eq('user_id', user.id)
      .single()

    if (developerError) {
      console.error('Developer fetch error:', developerError)
      return NextResponse.json(
        { error: 'Developer profile not found' },
        { status: 404 }
      )
    }

    // Get application status
    const { data: application, error: applicationError } = await supabase
      .from('developer_applications')
      .select('*')
      .eq('developer_id', developer.id)
      .order('submitted_at', { ascending: false })
      .limit(1)
      .single()

    if (applicationError) {
      console.error('Application fetch error:', applicationError)
    }

    // Calculate review estimate
    const getReviewEstimate = (status: string, submittedAt: string) => {
      const submitted = new Date(submittedAt)
      const now = new Date()
      const daysElapsed = Math.floor((now.getTime() - submitted.getTime()) / (1000 * 60 * 60 * 24))
      
      switch (status) {
        case 'pending':
          return daysElapsed < 3 ? '1-3 business days' : 'Under review'
        case 'under_review':
          return daysElapsed < 5 ? '1-2 business days' : 'Finalizing review'
        case 'approved':
          return 'Completed'
        case 'rejected':
          return 'Completed'
        default:
          return '3-5 business days'
      }
    }

    // Get main app name (first app or default)
    const mainApp = developer.apps?.[0]
    const appName = mainApp?.name || 'New App'

    const statusData = {
      applicationId: developer.id,
      status: application?.status || developer.status || 'pending',
      submittedAt: application?.submitted_at || developer.created_at,
      reviewEstimate: getReviewEstimate(
        application?.status || developer.status || 'pending', 
        application?.submitted_at || developer.created_at
      ),
      companyName: developer.company_name,
      appName: appName,
      developerStatus: developer.status,
      verifiedAt: developer.verified_at,
      hasApps: developer.apps?.length > 0,
      appCount: developer.apps?.length || 0
    }

    return NextResponse.json(statusData)

  } catch (error) {
    console.error('Developer status error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch developer status' },
      { status: 500 }
    )
  }
}