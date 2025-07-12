// API Route: /api/incubators
// GET: List incubators with filters and pagination

import { NextRequest, NextResponse } from 'next/server'
import { getIncubators } from '@/lib/db/incubators-simple'
import type { SearchParams } from '@/types/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const params: SearchParams = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: Math.min(parseInt(searchParams.get('limit') || '20'), 100), // Max 100 per page
      query: searchParams.get('query') || undefined,
      sort_by: (searchParams.get('sort_by') as any) || 'name',
      sort_order: (searchParams.get('sort_order') as 'asc' | 'desc') || 'asc'
    }

    // Parse array parameters
    const typeParam = searchParams.get('type')
    if (typeParam) {
      params.type = typeParam.split(',').filter(Boolean)
    }

    const sectorsParam = searchParams.get('sectors')
    if (sectorsParam) {
      params.sectors = sectorsParam.split(',').filter(Boolean)
    }

    const stageFocusParam = searchParams.get('stage_focus')
    if (stageFocusParam) {
      params.stage_focus = stageFocusParam.split(',').filter(Boolean)
    }

    const applicationStatusParam = searchParams.get('application_status')
    if (applicationStatusParam) {
      params.application_status = applicationStatusParam.split(',').filter(Boolean)
    }

    // Parse location parameters
    const country = searchParams.get('country')
    const state = searchParams.get('state')
    const city = searchParams.get('city')
    
    if (country || state || city) {
      params.location = {
        country: country || undefined,
        state: state || undefined,
        city: city || undefined
      }
    }

    // Boolean parameters
    if (searchParams.get('verified_only') === 'true') {
      params.verified_only = true
    }

    // Fetch data
    const result = await getIncubators(params)

    return NextResponse.json(result, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=600' // 5 min cache, 10 min stale
      }
    })

  } catch (error) {
    console.error('API Error - /api/incubators:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch incubators',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// POST: Create new incubator (future implementation)
export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'Creating incubators not yet implemented' },
    { status: 501 }
  )
}