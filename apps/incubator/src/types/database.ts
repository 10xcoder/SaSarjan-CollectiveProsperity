// Database types for Incubator.in
// Auto-generated from database schema

export interface Location {
  city?: string
  state?: string
  country?: string
  lat?: number
  lng?: number
  address?: string
}

export interface Facilities {
  office_space?: boolean
  lab_access?: boolean
  meeting_rooms?: boolean
  event_space?: boolean
  parking?: boolean
  wifi?: boolean
  kitchen?: boolean
  [key: string]: any
}

export interface Programs {
  duration?: number
  batch_size?: number
  equity_range?: [number, number]
  funding_range?: [number, number]
  cohorts_per_year?: number
  [key: string]: any
}

export interface ApplicationProcess {
  deadlines?: string[]
  requirements?: string[]
  timeline?: string[]
  application_fee?: number
  [key: string]: any
}

export interface BenefitValue {
  amount?: number
  currency?: string
  duration?: string
  equity?: number
  hours_per_week?: number
  mentor_count?: number
  companies?: number
  access_level?: string
  [key: string]: any
}

export interface LocationRequirements {
  must_relocate?: boolean
  allowed_countries?: string[]
  allowed_states?: string[]
  remote_allowed?: boolean
  [key: string]: any
}

export interface ProgramRequirements {
  team_size_min?: number
  team_size_max?: number
  revenue_min?: number
  funding_raised_max?: number
  incorporation_required?: boolean
  [key: string]: any
}

// Main incubator entity
export interface Incubator {
  id: string
  name: string
  slug: string
  description?: string
  logo_url?: string
  website?: string
  email?: string
  phone?: string
  
  // Location data
  location: Location
  
  // Program characteristics
  type: string[] // ['physical', 'virtual', 'hybrid']
  sectors: string[] // ['healthtech', 'fintech', 'edtech', etc.]
  stage_focus: string[] // ['idea', 'mvp', 'growth', 'scale']
  
  // Program details
  founded_year?: number
  portfolio_size: number
  notable_alumni: string[]
  
  // Structured data
  facilities: Facilities
  programs: Programs
  application_process: ApplicationProcess
  
  // Status and verification
  is_verified: boolean
  is_active: boolean
  application_status: 'open' | 'closed' | 'rolling'
  
  // SEO and metadata
  meta_title?: string
  meta_description?: string
  tags: string[]
  
  // Timestamps
  created_at: string
  updated_at: string
}

// Incubator with additional statistics (from view)
export interface IncubatorWithStats extends Incubator {
  benefits_count: number
  media_count: number
  programs_count: number
  alumni_count: number
  average_rating?: number
  reviews_count: number
}

// Benefits and offerings
export interface IncubatorBenefit {
  id: string
  incubator_id: string
  type: 'mentorship' | 'funding' | 'infrastructure' | 'network' | 'credits'
  title: string
  description?: string
  value: BenefitValue
  is_highlighted: boolean
  order_index: number
  created_at: string
}

// Media and assets
export interface IncubatorMedia {
  id: string
  incubator_id: string
  type: 'image' | 'video' | 'document'
  url: string
  caption?: string
  alt_text?: string
  category?: 'logo' | 'gallery' | 'testimonial' | 'document'
  order_index: number
  created_at: string
}

// Detailed program information
export interface IncubatorProgram {
  id: string
  incubator_id: string
  name: string
  description?: string
  duration_months?: number
  batch_size?: number
  
  // Financial terms
  equity_percentage_min?: number
  equity_percentage_max?: number
  funding_amount_min?: number // in USD cents
  funding_amount_max?: number // in USD cents
  
  // Requirements
  stage_requirements: string[]
  sector_focus: string[]
  location_requirements: LocationRequirements
  
  // Application details
  application_deadline?: string
  is_rolling_admission: boolean
  requirements: ProgramRequirements
  
  // Status
  is_active: boolean
  
  created_at: string
  updated_at: string
}

// Alumni and success stories
export interface IncubatorAlumni {
  id: string
  incubator_id: string
  company_name: string
  company_logo_url?: string
  company_website?: string
  description?: string
  
  // Success metrics
  valuation_usd?: number // in USD cents
  funding_raised_usd?: number // in USD cents
  employees_count?: number
  
  // Program details
  program_year?: number
  program_name?: string
  
  // Display
  is_featured: boolean
  order_index: number
  
  created_at: string
}

// Reviews and ratings
export interface IncubatorReview {
  id: string
  incubator_id: string
  reviewer_name?: string
  reviewer_title?: string
  reviewer_company?: string
  
  // Ratings (1-5 scale)
  overall_rating: number
  mentorship_rating?: number
  network_rating?: number
  resources_rating?: number
  
  // Content
  review_text?: string
  pros?: string
  cons?: string
  
  // Status
  is_verified: boolean
  is_published: boolean
  
  created_at: string
}

// API response types
export interface IncubatorListResponse {
  incubators: IncubatorWithStats[]
  total: number
  page: number
  limit: number
  has_more: boolean
}

export interface IncubatorDetailResponse {
  incubator: IncubatorWithStats
  benefits: IncubatorBenefit[]
  media: IncubatorMedia[]
  programs: IncubatorProgram[]
  alumni: IncubatorAlumni[]
  reviews: IncubatorReview[]
}

// Search and filter types
export interface SearchFilters {
  query?: string
  location?: {
    country?: string
    state?: string
    city?: string
    radius?: number // in km
    lat?: number
    lng?: number
  }
  type?: string[]
  sectors?: string[]
  stage_focus?: string[]
  application_status?: string[]
  equity_max?: number
  funding_min?: number
  funding_max?: number
  duration_min?: number
  duration_max?: number
  verified_only?: boolean
}

export interface SearchParams extends SearchFilters {
  page?: number
  limit?: number
  sort_by?: 'relevance' | 'name' | 'founded_year' | 'portfolio_size' | 'rating'
  sort_order?: 'asc' | 'desc'
}

// Aggregation types for filters
export interface FilterOptions {
  sectors: Array<{
    value: string
    label: string
    count: number
  }>
  types: Array<{
    value: string
    label: string
    count: number
  }>
  countries: Array<{
    value: string
    label: string
    count: number
  }>
  states: Array<{
    value: string
    label: string
    count: number
    country: string
  }>
  stage_focus: Array<{
    value: string
    label: string
    count: number
  }>
}

// Form types for creating/updating
export interface CreateIncubatorData {
  name: string
  slug: string
  description?: string
  logo_url?: string
  website?: string
  email?: string
  phone?: string
  location: Location
  type: string[]
  sectors: string[]
  stage_focus: string[]
  founded_year?: number
  portfolio_size?: number
  notable_alumni?: string[]
  facilities?: Facilities
  programs?: Programs
  application_process?: ApplicationProcess
  meta_title?: string
  meta_description?: string
  tags?: string[]
}

export interface UpdateIncubatorData extends Partial<CreateIncubatorData> {
  id: string
}

// Database connection types
export interface DatabaseConfig {
  host: string
  port: number
  database: string
  username: string
  password: string
  ssl?: boolean
}

// Migration types
export interface Migration {
  version: string
  name: string
  sql: string
  executed_at?: string
}