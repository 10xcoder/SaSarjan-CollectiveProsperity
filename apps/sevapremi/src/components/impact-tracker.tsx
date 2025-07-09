'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  TrendingUp, 
  Clock, 
  Award, 
  Target, 
  Calendar,
  Users,
  Heart,
  Star,
  Download,
  Share2
} from 'lucide-react'

interface ImpactData {
  totalHours: number
  eventsParticipated: number
  peopleHelped: number
  certificatesEarned: number
  currentStreak: number
  longestStreak: number
  categories: {
    education: number
    healthcare: number
    environment: number
    foodSecurity: number
    elderCare: number
  }
  monthlyProgress: {
    month: string
    hours: number
    events: number
  }[]
  recentAchievements: {
    id: string
    title: string
    description: string
    icon: string
    earnedDate: string
    category: string
  }[]
}

const mockImpactData: ImpactData = {
  totalHours: 156,
  eventsParticipated: 23,
  peopleHelped: 450,
  certificatesEarned: 8,
  currentStreak: 12,
  longestStreak: 18,
  categories: {
    education: 45,
    healthcare: 32,
    environment: 28,
    foodSecurity: 35,
    elderCare: 16
  },
  monthlyProgress: [
    { month: 'Aug', hours: 24, events: 4 },
    { month: 'Sep', hours: 32, events: 6 },
    { month: 'Oct', hours: 28, events: 5 },
    { month: 'Nov', hours: 38, events: 7 },
    { month: 'Dec', hours: 34, events: 6 }
  ],
  recentAchievements: [
    {
      id: '1',
      title: 'Community Champion',
      description: 'Completed 50+ volunteer hours',
      icon: '🏆',
      earnedDate: '2024-12-01',
      category: 'milestone'
    },
    {
      id: '2',
      title: 'Teaching Hero',
      description: 'Helped 100+ students in education programs',
      icon: '📚',
      earnedDate: '2024-11-28',
      category: 'education'
    },
    {
      id: '3',
      title: 'Green Warrior',
      description: 'Planted 50+ trees in environmental drives',
      icon: '🌱',
      earnedDate: '2024-11-20',
      category: 'environment'
    }
  ]
}

export function ImpactTracker() {
  const [showDetailed, setShowDetailed] = useState(false)
  const data = mockImpactData

  const getCategoryColor = (category: string) => {
    const colors = {
      education: 'bg-blue-500',
      healthcare: 'bg-red-500',
      environment: 'bg-green-500',
      foodSecurity: 'bg-orange-500',
      elderCare: 'bg-purple-500'
    }
    return colors[category as keyof typeof colors] || 'bg-gray-500'
  }

  const generateCertificate = () => {
    console.log('Generating impact certificate...')
  }

  const shareImpact = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My SevaPremi Impact',
        text: `I've volunteered ${data.totalHours} hours and helped ${data.peopleHelped} people through SevaPremi!`,
        url: window.location.href
      })
    }
  }

  return (
    <section className="py-12 px-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-900">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Your Impact Dashboard</h2>
          <p className="text-muted-foreground">
            Track your volunteer journey and see the difference you're making
          </p>
        </div>

        {/* Main Impact Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="text-center">
            <CardHeader className="pb-2">
              <Clock className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <CardTitle className="text-2xl font-bold text-green-600">
                {data.totalHours}
              </CardTitle>
              <CardDescription>Total Hours</CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader className="pb-2">
              <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <CardTitle className="text-2xl font-bold text-blue-600">
                {data.eventsParticipated}
              </CardTitle>
              <CardDescription>Events Joined</CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader className="pb-2">
              <Heart className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <CardTitle className="text-2xl font-bold text-purple-600">
                {data.peopleHelped}
              </CardTitle>
              <CardDescription>People Helped</CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader className="pb-2">
              <Award className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <CardTitle className="text-2xl font-bold text-orange-600">
                {data.certificatesEarned}
              </CardTitle>
              <CardDescription>Certificates</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Streak Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-green-600" />
                Volunteer Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold text-green-600">
                  {data.currentStreak} days
                </div>
                <div className="text-sm text-muted-foreground">
                  Current streak • Best: {data.longestStreak} days
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                  <div 
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${(data.currentStreak / data.longestStreak) * 100}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Category Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(data.categories).map(([category, hours]) => {
                  const percentage = (hours / data.totalHours) * 100
                  return (
                    <div key={category} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="capitalize">{category.replace(/([A-Z])/g, ' $1')}</span>
                        <span>{hours}h</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${getCategoryColor(category)}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Achievements */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-600" />
              Recent Achievements
            </CardTitle>
            <CardDescription>
              Your latest milestones and accomplishments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.recentAchievements.map((achievement) => (
                <div key={achievement.id} className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{achievement.title}</h4>
                    <p className="text-xs text-muted-foreground mb-2">
                      {achievement.description}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {new Date(achievement.earnedDate).toLocaleDateString()}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            variant="outline" 
            onClick={generateCertificate}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download Certificate
          </Button>
          <Button 
            variant="outline"
            onClick={shareImpact}
            className="flex items-center gap-2"
          >
            <Share2 className="h-4 w-4" />
            Share My Impact
          </Button>
          <Button 
            onClick={() => setShowDetailed(!showDetailed)}
            className="bg-green-600 hover:bg-green-700"
          >
            {showDetailed ? 'Hide Details' : 'View Detailed Report'}
          </Button>
        </div>

        {/* Detailed View */}
        {showDetailed && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Monthly Progress</CardTitle>
              <CardDescription>
                Your volunteer hours and events over the past months
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-4">
                {data.monthlyProgress.map((month) => (
                  <div key={month.month} className="text-center">
                    <div className="bg-green-100 dark:bg-green-900 rounded-lg p-4 mb-2">
                      <div className="text-2xl font-bold text-green-600">{month.hours}</div>
                      <div className="text-xs text-muted-foreground">hours</div>
                    </div>
                    <div className="text-sm font-medium">{month.month}</div>
                    <div className="text-xs text-muted-foreground">{month.events} events</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  )
}