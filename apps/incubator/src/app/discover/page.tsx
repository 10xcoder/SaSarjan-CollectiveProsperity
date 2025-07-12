'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, Grid, List, MapIcon } from 'lucide-react'
import { FilterSidebar } from '@/components/discovery/FilterSidebar'
import type { IncubatorListResponse, IncubatorWithStats } from '@/types/database'

export default function DiscoverPage() {
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'map'>('grid')
  const [incubators, setIncubators] = useState<IncubatorWithStats[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    limit: 20,
    has_more: false
  })

  // Fetch incubators from API
  const fetchIncubators = async (page: number = 1, query: string = '') => {
    setIsLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(query && { query })
      })
      
      // Use mock API for now since database might not be set up
      const response = await fetch(`/api/incubators/mock?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch incubators')
      }
      
      const data: IncubatorListResponse = await response.json()
      
      setIncubators(data.incubators)
      setPagination({
        page: data.page,
        total: data.total,
        limit: data.limit,
        has_more: data.has_more
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  // Initial load
  useEffect(() => {
    fetchIncubators()
  }, [])

  // Search handler
  const handleSearch = () => {
    fetchIncubators(1, searchQuery)
  }

  // Handle enter key in search
  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Discover Incubators</h1>
              <span className="text-sm text-gray-500">
                {isLoading ? 'Loading...' : `${pagination.total} programs available`}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* View mode toggles */}
              <div className="flex border rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`p-2 ${viewMode === 'map' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <MapIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Search bar */}
          <div className="pb-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, location, or sector..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleSearchKeyPress}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <button
                  onClick={handleSearch}
                  className="absolute right-2 top-2 px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
                  disabled={isLoading}
                >
                  {isLoading ? '...' : 'Search'}
                </button>
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex">
          {/* Sidebar */}
          <div className="hidden lg:block lg:w-80 lg:shrink-0">
            <FilterSidebar isOpen={true} onClose={() => {}} />
          </div>

          {/* Mobile filter sidebar */}
          <FilterSidebar 
            isOpen={showFilters} 
            onClose={() => setShowFilters(false)} 
          />

          {/* Results area */}
          <div className="flex-1 lg:pl-8">
            <div className="py-6">
              {/* Results header */}
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-gray-600">
                  {error ? (
                    <span className="text-red-600">Error: {error}</span>
                  ) : (
                    <>
                      Showing <span className="font-medium">{Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)}-{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of <span className="font-medium">{pagination.total}</span> incubators
                    </>
                  )}
                </p>
                <select className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option>Most Relevant</option>
                  <option>Recently Added</option>
                  <option>Most Popular</option>
                  <option>Application Deadline</option>
                </select>
              </div>

              {/* Loading state */}
              {isLoading && (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                  <span className="ml-3 text-gray-600">Loading incubators...</span>
                </div>
              )}

              {/* Error state */}
              {error && (
                <div className="text-center py-12">
                  <p className="text-red-600 mb-4">Failed to load incubators</p>
                  <button 
                    onClick={() => fetchIncubators(pagination.page, searchQuery)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {/* Results grid */}
              {!isLoading && !error && viewMode === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {incubators.map((incubator) => (
                    <div key={incubator.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                          {incubator.name.charAt(0).toUpperCase()}
                        </div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          incubator.application_status === 'open' 
                            ? 'bg-green-100 text-green-800'
                            : incubator.application_status === 'rolling'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {incubator.application_status.charAt(0).toUpperCase() + incubator.application_status.slice(1)}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-semibold mb-2">{incubator.name}</h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {incubator.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-1 mb-4">
                        {incubator.sectors.slice(0, 2).map(sector => (
                          <span key={sector} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {sector.charAt(0).toUpperCase() + sector.slice(1)}
                          </span>
                        ))}
                        {incubator.sectors.length > 2 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            +{incubator.sectors.length - 2} more
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <span>📍 {incubator.location.city}, {incubator.location.country}</span>
                        <span>{incubator.portfolio_size} startups</span>
                      </div>
                      
                      {incubator.average_rating && (
                        <div className="flex items-center mb-3">
                          <span className="text-yellow-400">{'★'.repeat(Math.floor(incubator.average_rating))}</span>
                          <span className="ml-1 text-sm text-gray-600">
                            {incubator.average_rating.toFixed(1)} ({incubator.reviews_count} reviews)
                          </span>
                        </div>
                      )}
                      
                      <button className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors">
                        Learn More
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* List view */}
              {viewMode === 'list' && (
                <div className="space-y-4">
                  {Array.from({ length: 10 }).map((_, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-sm border p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                            {String.fromCharCode(65 + index)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-xl font-semibold">Sample Incubator {index + 1}</h3>
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Open
                              </span>
                            </div>
                            <p className="text-gray-600 mb-3">
                              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                            </p>
                            <div className="flex flex-wrap gap-2 mb-3">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                FinTech
                              </span>
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                HealthTech
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>📍 San Francisco, CA</span>
                              <span>⏱️ 6 months</span>
                              <span>💰 5% equity</span>
                              <span>🏢 Physical + Virtual</span>
                            </div>
                          </div>
                        </div>
                        <button className="bg-indigo-600 text-white py-2 px-6 rounded-lg hover:bg-indigo-700 transition-colors">
                          Apply Now
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Map view placeholder */}
              {viewMode === 'map' && (
                <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                  <MapIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Interactive Map Coming Soon</h3>
                  <p className="text-gray-600">
                    Explore incubators on an interactive map with clustering and detailed popups.
                  </p>
                </div>
              )}

              {/* Pagination */}
              <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-8">
                <div className="flex flex-1 justify-between sm:hidden">
                  <button className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    Previous
                  </button>
                  <button className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">1</span> to <span className="font-medium">20</span> of{' '}
                      <span className="font-medium">500</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                      <button className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0">
                        Previous
                      </button>
                      <button className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0">
                        1
                      </button>
                      <button className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0">
                        2
                      </button>
                      <button className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0">
                        3
                      </button>
                      <button className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0">
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}