'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Heart, 
  MapPin, 
  Clock, 
  Users, 
  Award, 
  Calendar,
  Search,
  Filter,
  Star,
  CheckCircle,
  ArrowRight,
  Target,
  TrendingUp,
  Globe
} from 'lucide-react'
import { OpportunityCard } from '@/components/opportunity-card'
import { ImpactTracker } from '@/components/impact-tracker'
import { VolunteerProfile } from '@/components/volunteer-profile'
import { ServiceVerification } from '@/components/service-verification'

interface Opportunity {
  id: string
  title: string
  organization: string
  description: string
  location: string
  category: string
  duration: string
  commitment: string
  skillsNeeded: string[]
  impact: string
  verified: boolean
  urgency: 'low' | 'medium' | 'high'
  volunteersNeeded: number
  volunteersRegistered: number
  imageUrl?: string
  startDate: string
  endDate?: string
}

const mockOpportunities: Opportunity[] = [
  {
    id: '1',
    title: 'Food Distribution Drive',
    organization: 'Mumbai Food Bank',
    description: 'Help distribute meals to underprivileged families in Mumbai. We need volunteers to pack food, manage distribution queues, and assist with logistics.',
    location: 'Dharavi, Mumbai',
    category: 'food-security',
    duration: '4 hours',
    commitment: 'Weekend',
    skillsNeeded: ['Communication', 'Organization', 'Physical Work'],
    impact: 'Feed 500+ families',
    verified: true,
    urgency: 'high',
    volunteersNeeded: 25,
    volunteersRegistered: 18,
    startDate: '2024-12-15',
    endDate: '2024-12-15'
  },
  {
    id: '2',
    title: 'Digital Literacy Training',
    organization: 'Tech for Good Foundation',
    description: 'Teach basic computer skills and digital literacy to senior citizens and underprivileged youth in local community centers.',
    location: 'Pune, Maharashtra',
    category: 'education',
    duration: '3 hours',
    commitment: 'Weekly',
    skillsNeeded: ['Teaching', 'Technology', 'Patience'],
    impact: 'Empower 50+ individuals',
    verified: true,
    urgency: 'medium',
    volunteersNeeded: 10,
    volunteersRegistered: 7,
    startDate: '2024-12-20',
    endDate: '2025-03-20'
  },
  {
    id: '3',
    title: 'Tree Plantation Drive',
    organization: 'Green Mumbai Initiative',
    description: 'Join us in planting native trees across Mumbai to combat air pollution and create green spaces for communities.',
    location: 'Aarey Forest, Mumbai',
    category: 'environment',
    duration: '6 hours',
    commitment: 'One-time',
    skillsNeeded: ['Physical Work', 'Environmental Awareness'],
    impact: 'Plant 1000+ trees',
    verified: true,
    urgency: 'medium',
    volunteersNeeded: 50,
    volunteersRegistered: 32,
    startDate: '2024-12-22',
    endDate: '2024-12-22'
  },
  {
    id: '4',
    title: 'Healthcare Support for Rural Areas',
    organization: 'Medical Outreach Program',
    description: 'Assist healthcare professionals in conducting health camps in rural Maharashtra. Help with patient registration and basic health screenings.',
    location: 'Rural Maharashtra',
    category: 'healthcare',
    duration: '8 hours',
    commitment: 'Monthly',
    skillsNeeded: ['Healthcare', 'Communication', 'Documentation'],
    impact: 'Serve 200+ patients',
    verified: true,
    urgency: 'high',
    volunteersNeeded: 15,
    volunteersRegistered: 12,
    startDate: '2024-12-28',
    endDate: '2024-12-28'
  }
]

const categories = [
  { id: 'all', name: 'All Categories', icon: Heart, color: 'bg-gray-100 text-gray-800' },
  { id: 'education', name: 'Education', icon: Award, color: 'bg-blue-100 text-blue-800' },
  { id: 'healthcare', name: 'Healthcare', icon: Heart, color: 'bg-red-100 text-red-800' },
  { id: 'environment', name: 'Environment', icon: Globe, color: 'bg-green-100 text-green-800' },
  { id: 'food-security', name: 'Food Security', icon: Target, color: 'bg-orange-100 text-orange-800' },
  { id: 'elderly-care', name: 'Elderly Care', icon: Users, color: 'bg-purple-100 text-purple-800' },
]

export default function SevaPremiHomePage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>(mockOpportunities)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showProfile, setShowProfile] = useState(false)
  const [showVerification, setShowVerification] = useState(false)

  const filteredOpportunities = opportunities.filter(opp => {
    const matchesSearch = opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         opp.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         opp.location.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || opp.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const stats = {
    totalVolunteers: 12500,
    totalHours: 45000,
    projectsCompleted: 320,
    livesImpacted: 25000
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              <Heart className="w-4 h-4 mr-2" />
              Serving Communities Across India
            </Badge>
            
            <h1 className="text-5xl font-bold tracking-tight mb-6 bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
              SevaPremi
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Connect with meaningful volunteer opportunities in your community. Track your impact, verify your service, and be part of India's largest community service network.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" className="bg-green-600 hover:bg-green-700">
                Find Opportunities
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" size="lg" onClick={() => setShowProfile(true)}>
                Create Volunteer Profile
              </Button>
            </div>

            {/* Impact Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{stats.totalVolunteers.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Active Volunteers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{stats.totalHours.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Service Hours</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{stats.projectsCompleted}</div>
                <div className="text-sm text-muted-foreground">Projects Completed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">{stats.livesImpacted.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Lives Impacted</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8 px-4 bg-white dark:bg-gray-800">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col lg:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search opportunities by title, organization, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => {
                const Icon = category.icon
                return (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className="flex items-center gap-2"
                  >
                    <Icon className="w-4 h-4" />
                    {category.name}
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setShowProfile(true)}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Volunteer Profile
                </CardTitle>
                <CardDescription>
                  Create and manage your volunteer profile
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Impact Tracker
                </CardTitle>
                <CardDescription>
                  Track your community service hours and impact
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setShowVerification(true)}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-purple-600" />
                  Service Verification
                </CardTitle>
                <CardDescription>
                  Get your community service verified and certified
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Opportunities Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Available Opportunities</h2>
              <p className="text-muted-foreground">
                {filteredOpportunities.length} opportunities found
              </p>
            </div>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredOpportunities.map((opportunity) => (
              <OpportunityCard key={opportunity.id} opportunity={opportunity} />
            ))}
          </div>

          {filteredOpportunities.length === 0 && (
            <div className="text-center py-12">
              <Heart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No opportunities found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search criteria or check back later for new opportunities.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Impact Tracker Component */}
      <ImpactTracker />

      {/* Volunteer Profile Modal */}
      {showProfile && (
        <VolunteerProfile onClose={() => setShowProfile(false)} />
      )}

      {/* Service Verification Modal */}
      {showVerification && (
        <ServiceVerification onClose={() => setShowVerification(false)} />
      )}
    </div>
  )
}