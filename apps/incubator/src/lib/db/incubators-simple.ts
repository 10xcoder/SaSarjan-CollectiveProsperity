// Simplified database operations for incubators
import { getSupabaseClient } from './client'
import type {
  IncubatorWithStats,
  IncubatorListResponse,
  SearchParams
} from '@/types/database'

// Get list of incubators with basic filtering
export async function getIncubators(params: SearchParams = {}): Promise<IncubatorListResponse> {
  const client = getSupabaseClient()
  
  const {
    page = 1,
    limit = 20,
    query,
    type,
    sectors,
    sort_by = 'name',
    sort_order = 'asc'
  } = params

  // Start with base query
  let queryBuilder = client
    .from('incubators')
    .select(`
      id,
      name,
      slug,
      description,
      logo_url,
      website,
      location,
      type,
      sectors,
      stage_focus,
      founded_year,
      portfolio_size,
      is_verified,
      application_status,
      created_at
    `)
    .eq('is_active', true)

  // Text search (simplified)
  if (query) {
    queryBuilder = queryBuilder.or(`name.ilike.%${query}%,description.ilike.%${query}%`)
  }

  // Array filters
  if (type && type.length > 0) {
    queryBuilder = queryBuilder.overlaps('type', type)
  }
  if (sectors && sectors.length > 0) {
    queryBuilder = queryBuilder.overlaps('sectors', sectors)
  }

  // Sorting
  const ascending = sort_order === 'asc'
  switch (sort_by) {
    case 'name':
      queryBuilder = queryBuilder.order('name', { ascending })
      break
    case 'founded_year':
      queryBuilder = queryBuilder.order('founded_year', { ascending })
      break
    case 'portfolio_size':
      queryBuilder = queryBuilder.order('portfolio_size', { ascending })
      break
    default:
      queryBuilder = queryBuilder.order('name', { ascending: true })
  }

  // Pagination
  const offset = (page - 1) * limit
  queryBuilder = queryBuilder.range(offset, offset + limit - 1)

  const { data, error } = await queryBuilder
  
  if (error) {
    throw new Error(`Failed to fetch incubators: ${error.message}`)
  }

  // Get total count
  const { count, error: countError } = await client
    .from('incubators')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  if (countError) {
    throw new Error(`Failed to count incubators: ${countError.message}`)
  }

  const total = count || 0

  // Transform data to match expected interface
  const incubators = (data || []).map(item => ({
    ...item,
    benefits_count: 0,
    media_count: 0,
    programs_count: 0,
    alumni_count: 0,
    reviews_count: 0
  })) as IncubatorWithStats[]

  return {
    incubators,
    total,
    page,
    limit,
    has_more: offset + limit < total
  }
}

// Get featured incubators (simplified)
export async function getFeaturedIncubators(limit: number = 6): Promise<IncubatorWithStats[]> {
  const client = getSupabaseClient()

  const { data, error } = await client
    .from('incubators')
    .select(`
      id,
      name,
      slug,
      description,
      logo_url,
      website,
      location,
      type,
      sectors,
      stage_focus,
      founded_year,
      portfolio_size,
      is_verified,
      application_status,
      created_at
    `)
    .eq('is_active', true)
    .eq('is_verified', true)
    .order('portfolio_size', { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error(`Failed to fetch featured incubators: ${error.message}`)
  }

  // Transform data to match expected interface
  return (data || []).map(item => ({
    ...item,
    benefits_count: 0,
    media_count: 0,
    programs_count: 0,
    alumni_count: 0,
    reviews_count: 0
  })) as IncubatorWithStats[]
}

// Search incubators with autocomplete
export async function searchIncubators(query: string, limit: number = 10) {
  const client = getSupabaseClient()

  const { data, error } = await client
    .from('incubators')
    .select('id, name, slug, location, sectors, logo_url')
    .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
    .eq('is_active', true)
    .limit(limit)

  if (error) {
    throw new Error(`Failed to search incubators: ${error.message}`)
  }

  return data || []
}