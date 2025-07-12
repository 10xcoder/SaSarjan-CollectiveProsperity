// API Route: /api/incubators/featured
// GET: Get featured incubators for homepage

import { NextRequest, NextResponse } from 'next/server'
import { getFeaturedIncubators } from '@/lib/db/incubators-simple'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '6'), 20) // Max 20 featured

    const incubators = await getFeaturedIncubators(limit)

    return NextResponse.json(
      { incubators },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, max-age=600, stale-while-revalidate=1800' // 10 min cache, 30 min stale
        }
      }
    )

  } catch (error) {
    console.error('API Error - /api/incubators/featured:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch featured incubators',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}