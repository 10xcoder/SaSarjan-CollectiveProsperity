// API Route: /api/incubators/mock
// GET: Mock data for development (when database is not available)

import { NextRequest, NextResponse } from 'next/server'
import type { IncubatorListResponse, IncubatorWithStats } from '@/types/database'

// Mock incubator data
const mockIncubators: IncubatorWithStats[] = [
  {
    id: '1',
    name: 'TechStars Bangalore',
    slug: 'techstars-bangalore',
    description: 'Leading startup accelerator focusing on early-stage technology companies in India. We provide mentorship, funding, and access to a global network.',
    logo_url: '/api/placeholder/logo/techstars.png',
    website: 'https://www.techstars.com/accelerators/bangalore',
    email: 'bangalore@techstars.com',
    phone: '+91-80-12345678',
    location: {
      city: 'Bangalore',
      state: 'Karnataka',
      country: 'India',
      lat: 12.9716,
      lng: 77.5946
    },
    type: ['physical', 'hybrid'],
    sectors: ['fintech', 'healthtech', 'enterprise', 'consumer'],
    stage_focus: ['mvp', 'growth'],
    founded_year: 2016,
    portfolio_size: 45,
    notable_alumni: ['Tracxn', 'Unbox Robotics', 'SmartOwner'],
    facilities: {
      office_space: true,
      lab_access: true,
      meeting_rooms: true,
      wifi: true,
      parking: true
    },
    programs: {
      duration: 3,
      batch_size: 10,
      equity_range: [6, 8],
      funding_range: [100000, 120000]
    },
    application_process: {
      deadlines: ['2025-03-15', '2025-09-15'],
      requirements: ['MVP', 'Team of 2+', 'Incorporated entity']
    },
    is_verified: true,
    is_active: true,
    application_status: 'open',
    meta_title: 'TechStars Bangalore - Startup Accelerator',
    meta_description: 'Join TechStars Bangalore, the leading startup accelerator in India.',
    tags: ['accelerator', 'bangalore', 'techstars'],
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2025-07-10T15:30:00Z',
    benefits_count: 5,
    media_count: 8,
    programs_count: 1,
    alumni_count: 45,
    average_rating: 4.7,
    reviews_count: 23
  },
  {
    id: '2',
    name: 'Y Combinator',
    slug: 'y-combinator',
    description: 'The most successful startup accelerator in the world. Since 2005, YC has funded over 3,000 startups including Airbnb, Dropbox, Stripe, and Reddit.',
    logo_url: '/api/placeholder/logo/yc.png',
    website: 'https://www.ycombinator.com',
    email: 'apply@ycombinator.com',
    location: {
      city: 'Mountain View',
      state: 'California',
      country: 'USA',
      lat: 37.4419,
      lng: -122.1430
    },
    type: ['physical', 'virtual'],
    sectors: ['fintech', 'healthtech', 'enterprise', 'consumer', 'deeptech'],
    stage_focus: ['idea', 'mvp'],
    founded_year: 2005,
    portfolio_size: 3000,
    notable_alumni: ['Airbnb', 'Dropbox', 'Stripe', 'Reddit', 'Coinbase'],
    facilities: {
      office_space: true,
      meeting_rooms: true,
      event_space: true,
      wifi: true
    },
    programs: {
      duration: 3,
      batch_size: 200,
      equity_range: [6, 7],
      funding_range: [120000, 120000]
    },
    application_process: {
      deadlines: ['2025-03-21', '2025-08-21'],
      requirements: ['Working prototype or significant user growth']
    },
    is_verified: true,
    is_active: true,
    application_status: 'open',
    meta_title: 'Y Combinator - Startup Accelerator',
    meta_description: 'Join the world\'s most successful startup accelerator.',
    tags: ['accelerator', 'silicon-valley', 'yc'],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2025-07-11T12:00:00Z',
    benefits_count: 8,
    media_count: 12,
    programs_count: 1,
    alumni_count: 3000,
    average_rating: 4.9,
    reviews_count: 156
  },
  {
    id: '3',
    name: '500 Startups',
    slug: '500-startups',
    description: 'Global venture capital seed fund and startup accelerator founded in 2010. We have invested in over 2,400 companies across 75+ countries.',
    logo_url: '/api/placeholder/logo/500startups.png',
    website: 'https://500.co',
    email: 'hello@500.co',
    location: {
      city: 'San Francisco',
      state: 'California', 
      country: 'USA',
      lat: 37.7749,
      lng: -122.4194
    },
    type: ['virtual', 'hybrid'],
    sectors: ['fintech', 'consumer', 'enterprise', 'healthtech'],
    stage_focus: ['idea', 'mvp', 'growth'],
    founded_year: 2010,
    portfolio_size: 2400,
    notable_alumni: ['Canva', 'Grab', 'Twilio', 'Credit Karma'],
    facilities: {
      office_space: false,
      meeting_rooms: true,
      wifi: true
    },
    programs: {
      duration: 4,
      batch_size: 25,
      equity_range: [5, 6],
      funding_range: [150000, 150000]
    },
    application_process: {
      deadlines: ['2025-04-15', '2025-10-15'],
      requirements: ['Early traction', 'International expansion potential']
    },
    is_verified: true,
    is_active: true,
    application_status: 'rolling',
    meta_title: '500 Startups - Global Accelerator',
    meta_description: 'Join 500 Startups, the global startup accelerator and VC fund.',
    tags: ['accelerator', 'global', 'vc'],
    created_at: '2024-02-01T08:00:00Z',
    updated_at: '2025-07-09T14:20:00Z',
    benefits_count: 6,
    media_count: 10,
    programs_count: 2,
    alumni_count: 2400,
    average_rating: 4.5,
    reviews_count: 89
  },
  {
    id: '4',
    name: 'Rocket Internet',
    slug: 'rocket-internet',
    description: 'Global startup incubator and venture capital firm. We build and scale digital companies with proven business models.',
    logo_url: '/api/placeholder/logo/rocket.png',
    website: 'https://www.rocket-internet.com',
    email: 'careers@rocket-internet.com',
    location: {
      city: 'Berlin',
      state: 'Berlin',
      country: 'Germany',
      lat: 52.5200,
      lng: 13.4050
    },
    type: ['physical'],
    sectors: ['consumer', 'enterprise', 'fintech'],
    stage_focus: ['idea', 'mvp'],
    founded_year: 2007,
    portfolio_size: 200,
    notable_alumni: ['Zalando', 'HelloFresh', 'Delivery Hero'],
    facilities: {
      office_space: true,
      lab_access: false,
      meeting_rooms: true,
      wifi: true,
      kitchen: true
    },
    programs: {
      duration: 6,
      batch_size: 5,
      equity_range: [15, 25],
      funding_range: [500000, 2000000]
    },
    application_process: {
      deadlines: [],
      requirements: ['Strong team', 'Scalable business model']
    },
    is_verified: true,
    is_active: true,
    application_status: 'rolling',
    meta_title: 'Rocket Internet - Startup Incubator',
    meta_description: 'Join Rocket Internet, the global startup incubator.',
    tags: ['incubator', 'berlin', 'rocket'],
    created_at: '2024-01-20T12:00:00Z',
    updated_at: '2025-07-08T16:45:00Z',
    benefits_count: 7,
    media_count: 6,
    programs_count: 1,
    alumni_count: 200,
    average_rating: 4.3,
    reviews_count: 34
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const query = searchParams.get('query')?.toLowerCase()
    const sectors = searchParams.get('sectors')?.split(',').filter(Boolean)
    const type = searchParams.get('type')?.split(',').filter(Boolean)

    // Filter mock data
    let filteredIncubators = [...mockIncubators]

    // Apply search filter
    if (query) {
      filteredIncubators = filteredIncubators.filter(inc => 
        inc.name.toLowerCase().includes(query) || 
        inc.description?.toLowerCase().includes(query) ||
        inc.location.city?.toLowerCase().includes(query) ||
        inc.location.country?.toLowerCase().includes(query)
      )
    }

    // Apply sector filter
    if (sectors && sectors.length > 0) {
      filteredIncubators = filteredIncubators.filter(inc =>
        sectors.some(sector => inc.sectors.includes(sector))
      )
    }

    // Apply type filter
    if (type && type.length > 0) {
      filteredIncubators = filteredIncubators.filter(inc =>
        type.some(t => inc.type.includes(t))
      )
    }

    // Apply pagination
    const offset = (page - 1) * limit
    const paginatedIncubators = filteredIncubators.slice(offset, offset + limit)
    const total = filteredIncubators.length

    const response: IncubatorListResponse = {
      incubators: paginatedIncubators,
      total,
      page,
      limit,
      has_more: offset + limit < total
    }

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=60' // 1 min cache for mock data
      }
    })

  } catch (error) {
    console.error('API Error - /api/incubators/mock:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch mock incubators',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}