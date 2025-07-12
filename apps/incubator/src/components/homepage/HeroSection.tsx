'use client'

import Link from 'next/link'
import { ArrowRight, Search, Building2, Rocket } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-emerald-50">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-emerald-500/10 animate-gradient-x"></div>
      
      {/* Floating shapes for visual interest */}
      <div className="absolute top-20 left-10 h-72 w-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div className="absolute top-40 right-10 h-72 w-72 bg-emerald-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 h-72 w-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center rounded-full bg-indigo-100 px-4 py-1.5 text-sm font-medium text-indigo-700 mb-8">
            <Rocket className="mr-2 h-4 w-4" />
            <span>500+ Incubators • 10,000+ Startups</span>
          </div>

          {/* Main heading */}
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl md:text-7xl">
            Find Your Perfect
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-emerald-600">
              Incubator Match
            </span>
          </h1>

          {/* Subheading */}
          <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
            AI-powered discovery platform connecting startups with incubators, accelerators, and the innovation ecosystem. Get matched in minutes, not months.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex items-center justify-center gap-4 flex-col sm:flex-row">
            <Link href="/discover" className="group inline-flex items-center justify-center rounded-lg bg-indigo-600 px-8 py-4 text-base font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 w-full sm:w-auto">
              <Search className="mr-2 h-5 w-5" />
              Find Incubators
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            
            <button className="inline-flex items-center justify-center rounded-lg bg-white px-8 py-4 text-base font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 w-full sm:w-auto">
              <Building2 className="mr-2 h-5 w-5" />
              List Your Incubator
            </button>
          </div>

          {/* Trust indicators */}
          <div className="mt-12 flex items-center justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              100% Free
            </div>
            <div className="flex items-center">
              <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              AI-Powered Matching
            </div>
            <div className="flex items-center">
              <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Verified Programs
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}