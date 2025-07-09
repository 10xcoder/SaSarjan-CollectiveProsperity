'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  MapPin, 
  Clock, 
  Users, 
  CheckCircle, 
  AlertTriangle,
  Calendar,
  Heart,
  Share2,
  Bookmark
} from 'lucide-react'

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

interface OpportunityCardProps {
  opportunity: Opportunity
}

const urgencyColors = {
  low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
}

const categoryColors = {
  'education': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  'healthcare': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  'environment': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  'food-security': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  'elderly-care': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
}

export function OpportunityCard({ opportunity }: OpportunityCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [showFullDescription, setShowFullDescription] = useState(false)

  const spotsRemaining = opportunity.volunteersNeeded - opportunity.volunteersRegistered
  const progressPercentage = (opportunity.volunteersRegistered / opportunity.volunteersNeeded) * 100

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const handleRegister = () => {
    // Handle volunteer registration
    console.log('Registering for opportunity:', opportunity.id)
  }

  const handleShare = () => {
    // Handle sharing opportunity
    if (navigator.share) {
      navigator.share({
        title: opportunity.title,
        text: opportunity.description,
        url: window.location.href
      })
    }
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-green-500">
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg line-clamp-2">{opportunity.title}</CardTitle>
              {opportunity.verified && (
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
              )}
            </div>
            <CardDescription className="text-sm font-medium text-green-600">
              {opportunity.organization}
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsBookmarked(!isBookmarked)}
              className="h-8 w-8 p-0"
            >
              <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current text-green-600' : ''}`} />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleShare}
              className="h-8 w-8 p-0"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge className={categoryColors[opportunity.category as keyof typeof categoryColors] || 'bg-gray-100 text-gray-800'}>
            {opportunity.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </Badge>
          <Badge className={urgencyColors[opportunity.urgency]}>
            {opportunity.urgency === 'high' && <AlertTriangle className="w-3 h-3 mr-1" />}
            {opportunity.urgency.replace(/\b\w/g, l => l.toUpperCase())} Priority
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {showFullDescription 
            ? opportunity.description 
            : `${opportunity.description.slice(0, 150)}${opportunity.description.length > 150 ? '...' : ''}`
          }
          {opportunity.description.length > 150 && (
            <button 
              onClick={() => setShowFullDescription(!showFullDescription)}
              className="text-green-600 hover:underline ml-1"
            >
              {showFullDescription ? 'Show less' : 'Read more'}
            </button>
          )}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{opportunity.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{opportunity.duration} • {opportunity.commitment}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{formatDate(opportunity.startDate)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-green-600">{opportunity.impact}</span>
          </div>
        </div>

        {/* Skills Needed */}
        <div>
          <h4 className="text-sm font-medium mb-2">Skills Needed:</h4>
          <div className="flex flex-wrap gap-1">
            {opportunity.skillsNeeded.map((skill, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {skill}
              </Badge>
            ))}
          </div>
        </div>

        {/* Volunteer Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              Volunteers: {opportunity.volunteersRegistered}/{opportunity.volunteersNeeded}
            </span>
            <span className="text-muted-foreground">
              {spotsRemaining} spots remaining
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button 
            className="flex-1 bg-green-600 hover:bg-green-700"
            onClick={handleRegister}
            disabled={spotsRemaining === 0}
          >
            {spotsRemaining === 0 ? 'Fully Booked' : 'Volunteer Now'}
          </Button>
          <Button variant="outline">
            Learn More
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}