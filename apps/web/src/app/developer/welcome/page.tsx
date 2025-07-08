'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Check, 
  Clock, 
  Upload, 
  FileText, 
  Users, 
  TrendingUp,
  BookOpen,
  MessageSquare
} from 'lucide-react'

interface DeveloperStatus {
  applicationId: string
  status: 'pending' | 'under_review' | 'approved' | 'rejected'
  submittedAt: string
  reviewEstimate: string
  companyName: string
  appName: string
}

export default function DeveloperWelcomePage() {
  const router = useRouter()
  const [status, setStatus] = useState<DeveloperStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDeveloperStatus()
  }, [])

  const fetchDeveloperStatus = async () => {
    try {
      const response = await fetch('/api/developer/status')
      if (response.ok) {
        const data = await response.json()
        setStatus(data)
      }
    } catch (error) {
      console.error('Failed to fetch developer status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'under_review':
        return 'bg-blue-100 text-blue-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Your application is in the queue for review'
      case 'under_review':
        return 'Our team is currently reviewing your application'
      case 'approved':
        return 'Congratulations! Your developer account has been approved'
      case 'rejected':
        return 'Your application needs additional information'
      default:
        return 'Status unknown'
    }
  }

  const nextSteps = [
    {
      icon: Upload,
      title: 'Submit Your First App',
      description: 'Upload your app details, screenshots, and technical specifications',
      action: 'Submit App',
      href: '/developer/apps/new',
      available: status?.status === 'approved'
    },
    {
      icon: FileText,
      title: 'Read Integration Guide',
      description: 'Learn how to integrate with our platform and modular architecture',
      action: 'Read Guide',
      href: '/developer/docs/integration',
      available: true
    },
    {
      icon: Users,
      title: 'Join Developer Community',
      description: 'Connect with other developers building for collective prosperity',
      action: 'Join Community',
      href: '/developer/community',
      available: true
    },
    {
      icon: TrendingUp,
      title: 'Analytics Dashboard',
      description: 'Track your app performance and revenue metrics',
      action: 'View Dashboard',
      href: '/developer/dashboard',
      available: status?.status === 'approved'
    }
  ]

  const resources = [
    {
      icon: BookOpen,
      title: 'Developer Documentation',
      description: 'Complete API reference and integration guides',
      href: '/developer/docs'
    },
    {
      icon: MessageSquare,
      title: 'Support Center',
      description: 'Get help with technical issues and questions',
      href: '/developer/support'
    }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading your developer status...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <Check className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Welcome to SaSarjan Developer Portal!</h1>
          <p className="text-lg text-muted-foreground">
            Thank you for joining our mission to create technology for collective prosperity
          </p>
        </div>

        {/* Status Card */}
        {status && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Application Status</CardTitle>
                  <CardDescription>
                    Application for {status.companyName} • {status.appName}
                  </CardDescription>
                </div>
                <Badge className={getStatusColor(status.status)}>
                  {status.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <p className="text-sm">{getStatusMessage(status.status)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Submitted</p>
                  <p className="text-sm">{new Date(status.submittedAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Review Estimate</p>
                  <p className="text-sm">{status.reviewEstimate}</p>
                </div>
              </div>
              
              {status.status === 'under_review' && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="flex items-start gap-2">
                    <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium">Review in Progress</p>
                      <p>
                        Our curation team is evaluating your app for quality, impact potential, 
                        and alignment with collective prosperity principles. We'll notify you once 
                        the review is complete.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {status.status === 'approved' && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 mt-0.5" />
                    <div className="text-sm text-green-800">
                      <p className="font-medium">Application Approved!</p>
                      <p>
                        Your developer account is now active. You can submit your first app 
                        and start building for the SaSarjan community.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Next Steps */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Next Steps</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {nextSteps.map((step, index) => {
              const StepIcon = step.icon
              return (
                <Card key={index} className={!step.available ? 'opacity-50' : ''}>
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
                        <StepIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{step.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {step.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {step.available ? (
                      <Link href={step.href}>
                        <Button className="w-full">
                          {step.action}
                        </Button>
                      </Link>
                    ) : (
                      <Button className="w-full" disabled>
                        Available after approval
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Resources */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Developer Resources</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {resources.map((resource, index) => {
              const ResourceIcon = resource.icon
              return (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
                        <ResourceIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{resource.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {resource.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Link href={resource.href}>
                      <Button variant="outline" className="w-full">
                        Learn More
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Support Contact */}
        <Card>
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
            <CardDescription>
              Our developer support team is here to help you succeed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email Support</p>
                <p className="text-sm">developers@sasarjan.com</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Response Time</p>
                <p className="text-sm">Within 24 hours</p>
              </div>
            </div>
            <div className="mt-4">
              <Link href="/developer/support">
                <Button variant="outline">
                  Contact Support
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}