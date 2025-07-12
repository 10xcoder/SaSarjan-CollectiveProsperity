'use client'

import { Search, Target, TrendingUp, Users, Globe, Award, BookOpen, Zap } from 'lucide-react'

export function ValueProps() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Why Choose Incubator.in?
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            We&apos;re revolutionizing how startups discover and connect with the right incubators, 
            accelerators, and innovation programs worldwide.
          </p>
        </div>

        {/* Value propositions grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {/* For Startups */}
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-6">
              <div className="bg-indigo-100 p-3 rounded-lg">
                <Search className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 ml-3">Smart Discovery</h3>
            </div>
            <p className="text-gray-600 mb-4">
              AI-powered matching algorithm connects you with incubators that align with your industry, stage, and goals.
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                500+ verified programs
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Advanced filtering & search
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Personalized recommendations
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-6">
              <div className="bg-emerald-100 p-3 rounded-lg">
                <Target className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 ml-3">Perfect Matching</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Find programs that match your startup stage, industry focus, and specific needs.
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Stage-specific filtering
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Industry expertise matching
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Geographic preferences
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-6">
              <div className="bg-purple-100 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 ml-3">Application Tracking</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Track all your applications in one place and get insights into your startup journey.
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Centralized dashboard
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Deadline reminders
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Progress analytics
              </li>
            </ul>
          </div>

          {/* For Incubators */}
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-6">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 ml-3">Quality Deal Flow</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Attract high-quality startups that match your program&apos;s focus and investment criteria.
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Pre-qualified applications
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Detailed startup profiles
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Reduced screening time
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-6">
              <div className="bg-orange-100 p-3 rounded-lg">
                <Globe className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 ml-3">Global Reach</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Expand your reach and attract startups from around the world to your program.
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                International exposure
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Multi-language support
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Cross-border partnerships
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-6">
              <div className="bg-rose-100 p-3 rounded-lg">
                <Award className="h-6 w-6 text-rose-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 ml-3">Program Analytics</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Get insights into your program&apos;s performance and track the success of your portfolio companies.
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Application analytics
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Success tracking
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Benchmarking data
              </li>
            </ul>
          </div>
        </div>

        {/* Platform Features */}
        <div className="border-t border-gray-200 pt-16">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Platform Features
            </h3>
            <p className="text-lg text-gray-600">
              Built for the modern startup ecosystem
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-indigo-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-indigo-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Comprehensive Profiles</h4>
              <p className="text-gray-600 text-sm">
                Detailed information about each incubator including alumni, success stories, and program details.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-emerald-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Zap className="h-8 w-8 text-emerald-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Real-time Updates</h4>
              <p className="text-gray-600 text-sm">
                Stay updated with the latest application deadlines, program changes, and new opportunities.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Community Network</h4>
              <p className="text-gray-600 text-sm">
                Connect with other founders, mentors, and industry experts in our growing community.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-orange-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Award className="h-8 w-8 text-orange-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Verified Programs</h4>
              <p className="text-gray-600 text-sm">
                All incubators are verified for authenticity and quality to ensure you&apos;re applying to legitimate programs.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Ready to Find Your Perfect Match?</h3>
            <p className="text-lg mb-6 opacity-90">
              Join thousands of startups who have found their ideal incubator through our platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Get Started for Free
              </button>
              <button className="border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-indigo-600 transition-colors">
                Watch Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}