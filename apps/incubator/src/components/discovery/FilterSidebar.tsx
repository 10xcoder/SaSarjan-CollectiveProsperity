'use client'

import { useState } from 'react'
import { X, MapPin, Building, Target, Clock, DollarSign, CheckCircle } from 'lucide-react'

interface FilterSidebarProps {
  isOpen: boolean
  onClose: () => void
}

interface FilterState {
  location: {
    country: string
    state: string
    city: string
  }
  type: string[]
  sectors: string[]
  stage: string[]
  duration: string[]
  equity: string[]
  applicationStatus: string[]
}

const FILTER_DATA = {
  types: [
    { value: 'physical', label: 'Physical Space', icon: '🏢' },
    { value: 'virtual', label: 'Virtual Program', icon: '💻' },
    { value: 'hybrid', label: 'Hybrid Model', icon: '🔄' }
  ],
  sectors: [
    { value: 'healthtech', label: 'HealthTech', color: 'bg-red-100 text-red-800' },
    { value: 'fintech', label: 'FinTech', color: 'bg-green-100 text-green-800' },
    { value: 'edtech', label: 'EdTech', color: 'bg-blue-100 text-blue-800' },
    { value: 'agtech', label: 'AgTech', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'deeptech', label: 'DeepTech', color: 'bg-purple-100 text-purple-800' },
    { value: 'consumer', label: 'Consumer', color: 'bg-pink-100 text-pink-800' },
    { value: 'enterprise', label: 'Enterprise', color: 'bg-indigo-100 text-indigo-800' },
    { value: 'mobility', label: 'Mobility', color: 'bg-orange-100 text-orange-800' }
  ],
  stages: [
    { value: 'idea', label: 'Idea Stage' },
    { value: 'mvp', label: 'MVP/Prototype' },
    { value: 'growth', label: 'Growth Stage' },
    { value: 'scale', label: 'Scale Stage' }
  ],
  durations: [
    { value: '3-6', label: '3-6 months' },
    { value: '6-12', label: '6-12 months' },
    { value: '12+', label: '12+ months' },
    { value: 'ongoing', label: 'Ongoing' }
  ],
  equity: [
    { value: '0', label: 'No Equity' },
    { value: '1-5', label: '1-5%' },
    { value: '6-10', label: '6-10%' },
    { value: '10+', label: '10%+' }
  ],
  applicationStatus: [
    { value: 'open', label: 'Open Now', color: 'text-green-600' },
    { value: 'closing-soon', label: 'Closing Soon', color: 'text-orange-600' },
    { value: 'rolling', label: 'Rolling Basis', color: 'text-blue-600' }
  ]
}

export function FilterSidebar({ isOpen, onClose }: FilterSidebarProps) {
  const [filters, setFilters] = useState<FilterState>({
    location: { country: '', state: '', city: '' },
    type: [],
    sectors: [],
    stage: [],
    duration: [],
    equity: [],
    applicationStatus: []
  })

  const [expandedSections, setExpandedSections] = useState({
    location: true,
    type: true,
    sectors: true,
    stage: false,
    duration: false,
    equity: false,
    applicationStatus: false
  })

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const handleArrayFilter = (category: Exclude<keyof FilterState, 'location'>, value: string) => {
    setFilters(prev => {
      const currentArray = prev[category] as string[]
      return {
        ...prev,
        [category]: currentArray.includes(value)
          ? currentArray.filter(item => item !== value)
          : [...currentArray, value]
      }
    })
  }

  const clearAllFilters = () => {
    setFilters({
      location: { country: '', state: '', city: '' },
      type: [],
      sectors: [],
      stage: [],
      duration: [],
      equity: [],
      applicationStatus: []
    })
  }

  const getActiveFilterCount = () => {
    const { location, ...arrayFilters } = filters
    const locationCount = Object.values(location).filter(Boolean).length
    const arrayCount = Object.values(arrayFilters).reduce((acc, arr) => acc + (arr as string[]).length, 0)
    return locationCount + arrayCount
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 lg:static lg:z-0">
      {/* Mobile overlay */}
      <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-80 bg-white shadow-lg transform transition-transform lg:relative lg:transform-none lg:shadow-none border-r">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center">
            <h2 className="text-lg font-semibold">Filters</h2>
            {getActiveFilterCount() > 0 && (
              <span className="ml-2 px-2 py-1 text-xs bg-indigo-100 text-indigo-800 rounded-full">
                {getActiveFilterCount()}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {getActiveFilterCount() > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear all
              </button>
            )}
            <button onClick={onClose} className="lg:hidden p-1">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Filters content */}
        <div className="p-4 overflow-y-auto h-full pb-20">
          {/* Location Filter */}
          <div className="mb-6">
            <button
              onClick={() => toggleSection('location')}
              className="flex items-center justify-between w-full mb-3"
            >
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                <span className="font-medium">Location</span>
              </div>
              <span className={`transform transition-transform ${expandedSections.location ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>
            
            {expandedSections.location && (
              <div className="space-y-3 ml-6">
                <input
                  type="text"
                  placeholder="Country"
                  value={filters.location.country}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    location: { ...prev.location, country: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="text"
                  placeholder="State/Province"
                  value={filters.location.state}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    location: { ...prev.location, state: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="text"
                  placeholder="City"
                  value={filters.location.city}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    location: { ...prev.location, city: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}
          </div>

          {/* Type Filter */}
          <div className="mb-6">
            <button
              onClick={() => toggleSection('type')}
              className="flex items-center justify-between w-full mb-3"
            >
              <div className="flex items-center">
                <Building className="h-4 w-4 mr-2 text-gray-500" />
                <span className="font-medium">Program Type</span>
              </div>
              <span className={`transform transition-transform ${expandedSections.type ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>
            
            {expandedSections.type && (
              <div className="space-y-2 ml-6">
                {FILTER_DATA.types.map((type) => (
                  <label key={type.value} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.type.includes(type.value)}
                      onChange={() => handleArrayFilter('type', type.value)}
                      className="mr-3 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm flex items-center">
                      <span className="mr-2">{type.icon}</span>
                      {type.label}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Sectors Filter */}
          <div className="mb-6">
            <button
              onClick={() => toggleSection('sectors')}
              className="flex items-center justify-between w-full mb-3"
            >
              <div className="flex items-center">
                <Target className="h-4 w-4 mr-2 text-gray-500" />
                <span className="font-medium">Sectors</span>
              </div>
              <span className={`transform transition-transform ${expandedSections.sectors ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>
            
            {expandedSections.sectors && (
              <div className="space-y-2 ml-6">
                {FILTER_DATA.sectors.map((sector) => (
                  <label key={sector.value} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.sectors.includes(sector.value)}
                      onChange={() => handleArrayFilter('sectors', sector.value)}
                      className="mr-3 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className={`text-xs px-2 py-1 rounded-full ${sector.color}`}>
                      {sector.label}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Stage Filter */}
          <div className="mb-6">
            <button
              onClick={() => toggleSection('stage')}
              className="flex items-center justify-between w-full mb-3"
            >
              <div className="flex items-center">
                <Target className="h-4 w-4 mr-2 text-gray-500" />
                <span className="font-medium">Startup Stage</span>
              </div>
              <span className={`transform transition-transform ${expandedSections.stage ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>
            
            {expandedSections.stage && (
              <div className="space-y-2 ml-6">
                {FILTER_DATA.stages.map((stage) => (
                  <label key={stage.value} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.stage.includes(stage.value)}
                      onChange={() => handleArrayFilter('stage', stage.value)}
                      className="mr-3 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm">{stage.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Duration Filter */}
          <div className="mb-6">
            <button
              onClick={() => toggleSection('duration')}
              className="flex items-center justify-between w-full mb-3"
            >
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-gray-500" />
                <span className="font-medium">Program Duration</span>
              </div>
              <span className={`transform transition-transform ${expandedSections.duration ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>
            
            {expandedSections.duration && (
              <div className="space-y-2 ml-6">
                {FILTER_DATA.durations.map((duration) => (
                  <label key={duration.value} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.duration.includes(duration.value)}
                      onChange={() => handleArrayFilter('duration', duration.value)}
                      className="mr-3 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm">{duration.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Equity Filter */}
          <div className="mb-6">
            <button
              onClick={() => toggleSection('equity')}
              className="flex items-center justify-between w-full mb-3"
            >
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 mr-2 text-gray-500" />
                <span className="font-medium">Equity Requirement</span>
              </div>
              <span className={`transform transition-transform ${expandedSections.equity ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>
            
            {expandedSections.equity && (
              <div className="space-y-2 ml-6">
                {FILTER_DATA.equity.map((equity) => (
                  <label key={equity.value} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.equity.includes(equity.value)}
                      onChange={() => handleArrayFilter('equity', equity.value)}
                      className="mr-3 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm">{equity.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Application Status Filter */}
          <div className="mb-6">
            <button
              onClick={() => toggleSection('applicationStatus')}
              className="flex items-center justify-between w-full mb-3"
            >
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-2 text-gray-500" />
                <span className="font-medium">Application Status</span>
              </div>
              <span className={`transform transition-transform ${expandedSections.applicationStatus ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>
            
            {expandedSections.applicationStatus && (
              <div className="space-y-2 ml-6">
                {FILTER_DATA.applicationStatus.map((status) => (
                  <label key={status.value} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.applicationStatus.includes(status.value)}
                      onChange={() => handleArrayFilter('applicationStatus', status.value)}
                      className="mr-3 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className={`text-sm ${status.color || ''}`}>{status.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Apply button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t">
          <button
            onClick={onClose}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  )
}