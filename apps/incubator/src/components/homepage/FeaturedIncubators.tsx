'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Star, Users, MapPin, ExternalLink } from 'lucide-react'
import type { IncubatorWithStats } from '@/types/database'

interface FeaturedIncubatorsProps {
  limit?: number
}

export function FeaturedIncubators({ limit = 6 }: FeaturedIncubatorsProps) {
  const [incubators, setIncubators] = useState<IncubatorWithStats[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  // Fetch featured incubators
  useEffect(() => {
    const fetchIncubators = async () => {
      try {
        const response = await fetch(`/api/incubators/featured?limit=${limit}`)
        if (!response.ok) {
          throw new Error('Failed to fetch featured incubators')
        }
        const data = await response.json()
        setIncubators(data.incubators || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchIncubators()
  }, [limit])

  // Auto-rotate carousel
  useEffect(() => {
    if (incubators.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % Math.ceil(incubators.length / 3))
    }, 5000) // Change every 5 seconds

    return () => clearInterval(interval)
  }, [incubators.length])

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % Math.ceil(incubators.length / 3))
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + Math.ceil(incubators.length / 3)) % Math.ceil(incubators.length / 3))
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  if (isLoading) {
    return (
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Incubators</h2>
            <p className="text-lg text-gray-600">Discover top-rated startup programs</p>
          </div>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <span className="ml-3 text-gray-600">Loading featured incubators...</span>
          </div>
        </div>
      </section>
    )
  }

  if (error || incubators.length === 0) {
    return (
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Incubators</h2>
            <p className="text-lg text-gray-600">Discover top-rated startup programs</p>
          </div>
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">
              {error || 'No featured incubators available at the moment.'}
            </p>
            <Link href="/discover" className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700">
              Browse All Incubators
            </Link>
          </div>
        </div>
      </section>
    )
  }

  const visibleIncubators = incubators.slice(currentIndex * 3, (currentIndex + 1) * 3)

  return (
    <section className="py-16 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Incubators</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover top-rated startup programs from around the world. These incubators have a proven track record of success.
          </p>
        </div>

        {/* Carousel */}
        <div className="relative">
          {/* Navigation buttons */}
          {incubators.length > 3 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors"
                aria-label="Previous incubators"
              >
                <ChevronLeft className="h-6 w-6 text-gray-600" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors"
                aria-label="Next incubators"
              >
                <ChevronRight className="h-6 w-6 text-gray-600" />
              </button>
            </>
          )}

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {visibleIncubators.map((incubator) => (
              <div
                key={incubator.id}
                className="group bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all duration-300 overflow-hidden"
              >
                {/* Header */}
                <div className="p-6 pb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                      {incubator.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex items-center space-x-2">
                      {incubator.is_verified && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          ✓ Verified
                        </span>
                      )}
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
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                    {incubator.name}
                  </h3>

                  <p className="text-gray-600 mb-4 line-clamp-2 text-sm leading-relaxed">
                    {incubator.description}
                  </p>

                  {/* Location and Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{incubator.location.city}, {incubator.location.country}</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      <span>{incubator.portfolio_size} startups</span>
                    </div>
                  </div>

                  {/* Rating */}
                  {incubator.average_rating && (
                    <div className="flex items-center mb-4">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="ml-1 text-sm font-medium text-gray-900">
                          {incubator.average_rating.toFixed(1)}
                        </span>
                      </div>
                      <span className="ml-2 text-sm text-gray-500">
                        ({incubator.reviews_count} reviews)
                      </span>
                    </div>
                  )}

                  {/* Sectors */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {incubator.sectors.slice(0, 3).map(sector => (
                      <span key={sector} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        {sector.charAt(0).toUpperCase() + sector.slice(1)}
                      </span>
                    ))}
                    {incubator.sectors.length > 3 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                        +{incubator.sectors.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Founded {incubator.founded_year}
                    </div>
                    <div className="flex items-center space-x-2">
                      {incubator.website && (
                        <a
                          href={incubator.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                      <Link
                        href={`/incubators/${incubator.slug}`}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                      >
                        Learn More
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination dots */}
          {incubators.length > 3 && (
            <div className="flex justify-center mt-8 space-x-2">
              {Array.from({ length: Math.ceil(incubators.length / 3) }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex ? 'bg-indigo-600' : 'bg-gray-300'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Call to action */}
        <div className="text-center mt-12">
          <Link
            href="/discover"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
          >
            Explore All Incubators
            <ChevronRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  )
}