// API Route: /api/search
// GET: Search incubators with autocomplete

import { NextRequest, NextResponse } from 'next/server'
import { searchIncubators } from '@/lib/db/incubators-simple'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    
    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { error: 'Query must be at least 2 characters long' },
        { status: 400 }
      )
    }

    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50) // Max 50 results
    
    const results = await searchIncubators(query.trim(), limit)

    return NextResponse.json(
      { 
        results,
        query: query.trim()
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, max-age=300, stale-while-revalidate=600' // 5 min cache
        }
      }
    )

  } catch (error) {
    console.error('API Error - /api/search:', error)
    
    return NextResponse.json(
      { 
        error: 'Search failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}