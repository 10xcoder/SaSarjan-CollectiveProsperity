'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Briefcase, 
  Users, 
  Award, 
  Brain,
  Sparkles,
  Cpu,
  Globe2,
  ArrowRight,
  CheckCircle2,
  Rocket,
  BarChart,
  Palette,
  Heart,
  Play,
  FileText,
  Zap,
  UserCheck
} from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function HomePage() {
  const [currentRole, setCurrentRole] = useState(0)
  const roles = [
    'Software Developer',
    'Digital Marketer', 
    'Content Creator',
    'Data Scientist',
    'Entrepreneur',
    'Product Manager'
  ]

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const interval = setInterval(() => {
        setCurrentRole((prev) => (prev + 1) % roles.length)
      }, 2000)
      return () => clearInterval(interval)
    }
  }, [roles.length])

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="px-4 py-16 sm:px-6 sm:py-24 lg:px-8 bg-gradient-to-br from-orange-50 via-white to-green-50 dark:from-orange-950 dark:via-gray-900 dark:to-green-950 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-gray-100/50 dark:bg-grid-gray-900/50 -z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-white/90 dark:from-gray-900/90 dark:via-transparent dark:to-gray-900/90 -z-10" />
        
        <div className="mx-auto max-w-7xl text-center relative">
          {/* Made in India Badge */}
          <Badge className="mb-4 bg-gradient-to-r from-orange-500 to-green-600 text-white border-0">
            <Globe2 className="w-3 h-3 mr-1" />
            Made in India, for India&apos;s Future
          </Badge>
          
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            <span className="block text-gray-900 dark:text-gray-100">Your AI-Powered Journey to</span>
            <span className="block mt-2 bg-gradient-to-r from-orange-600 via-purple-600 to-green-600 bg-clip-text text-transparent">
              Lifelong Success
            </span>
          </h1>
          
          <div className="mt-6 flex items-center justify-center gap-x-4 text-2xl font-semibold">
            <span className="text-blue-600 dark:text-blue-400">Learn</span>
            <ArrowRight className="w-6 h-6 text-gray-400" />
            <span className="text-purple-600 dark:text-purple-400">Earn</span>
            <ArrowRight className="w-6 h-6 text-gray-400" />
            <span className="text-green-600 dark:text-green-400">Impact</span>
          </div>
          
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Transform into a <span className="font-semibold text-gray-900 dark:text-gray-100">{roles[currentRole]}</span> with AI-personalized learning paths. 
            Master skills that matter. Build careers that count. Create impact that lasts.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="bg-gradient-to-r from-orange-600 to-purple-600 hover:from-orange-700 hover:to-purple-700 text-white px-8 py-6 text-lg">
              <Sparkles className="mr-2 h-5 w-5" />
              Start Your AI Journey
            </Button>
            <Button size="lg" variant="outline" className="px-8 py-6 text-lg border-2">
              <Brain className="mr-2 h-5 w-5" />
              Take Career Assessment
            </Button>
          </div>
          
          {/* Trust Indicators */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">10 Lakh+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Learners</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">500+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Skills</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">28</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">States</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">95%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Core Learning Areas */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900/50">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              5 Powerful Learning Paths, <span className="bg-gradient-to-r from-orange-600 to-purple-600 bg-clip-text text-transparent">Infinite Possibilities</span>
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Choose Your Path. Master Adjacent Skills. Create Your Unique Career DNA.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Technical Skills */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-500/50 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="relative">
                <div className="flex items-center justify-between mb-2">
                  <Cpu className="h-12 w-12 text-blue-600" />
                  <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                    High Demand
                  </Badge>
                </div>
                <CardTitle className="text-2xl">Technical Skills 💻</CardTitle>
                <CardDescription className="text-base font-medium">
                  Build the Digital India
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <div className="space-y-4">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Core Skills:</p>
                    <div className="flex flex-wrap gap-2">
                      {['Programming', 'AI/ML', 'Web Dev', 'Data Science'].map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Adjacent Skills:</p>
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span>DevOps & Cloud Computing</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span>Cybersecurity</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span>No-code/Low-code Tools</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Business Skills */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-green-500/50 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="relative">
                <div className="flex items-center justify-between mb-2">
                  <BarChart className="h-12 w-12 text-green-600" />
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                    Leadership Track
                  </Badge>
                </div>
                <CardTitle className="text-2xl">Business Skills 📈</CardTitle>
                <CardDescription className="text-base font-medium">
                  Lead India&apos;s Economic Revolution
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <div className="space-y-4">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Core Skills:</p>
                    <div className="flex flex-wrap gap-2">
                      {['Marketing', 'Sales', 'Finance', 'Strategy'].map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Adjacent Skills:</p>
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span>Business Analytics</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span>Customer Success</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span>Fundraising & Pitching</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Media Skills */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-purple-500/50 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="relative">
                <div className="flex items-center justify-between mb-2">
                  <Palette className="h-12 w-12 text-purple-600" />
                  <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                    Creator Ready
                  </Badge>
                </div>
                <CardTitle className="text-2xl">Media Skills 🎨</CardTitle>
                <CardDescription className="text-base font-medium">
                  Tell India&apos;s Story to the World
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <div className="space-y-4">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Core Skills:</p>
                    <div className="flex flex-wrap gap-2">
                      {['Content', 'Branding', 'Design', 'Film'].map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Adjacent Skills:</p>
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span>UI/UX Design</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span>Podcasting</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span>Creator Economy</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Life Skills */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-orange-500/50 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="relative">
                <div className="flex items-center justify-between mb-2">
                  <Heart className="h-12 w-12 text-orange-600" />
                  <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300">
                    Essential
                  </Badge>
                </div>
                <CardTitle className="text-2xl">Life Skills 🧠</CardTitle>
                <CardDescription className="text-base font-medium">
                  Master Yourself, Master Your Future
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <div className="space-y-4">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Core Skills:</p>
                    <div className="flex flex-wrap gap-2">
                      {['EQ', 'Time Mgmt', 'Leadership', 'Communication'].map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Adjacent Skills:</p>
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span>Critical Thinking</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span>Financial Literacy</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span>Mental Wellness</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Entrepreneurial Skills */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-red-500/50 relative overflow-hidden md:col-span-2 lg:col-span-1">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="relative">
                <div className="flex items-center justify-between mb-2">
                  <Rocket className="h-12 w-12 text-red-600" />
                  <Badge className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
                    Founder Track
                  </Badge>
                </div>
                <CardTitle className="text-2xl">Entrepreneurial Skills 🚀</CardTitle>
                <CardDescription className="text-base font-medium">
                  Build the Next Unicorn
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <div className="space-y-4">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Core Skills:</p>
                    <div className="flex flex-wrap gap-2">
                      {['Ideation', 'MVP', 'Teams', 'Growth'].map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Adjacent Skills:</p>
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span>Startup Finance</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span>Growth Hacking</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span>Social Entrepreneurship</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Learning Modalities */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Learn Your Way, <span className="text-purple-600 dark:text-purple-400">At Your Pace</span>
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              Multiple formats. One goal: Your success.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <Play className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                <h3 className="font-semibold text-lg mb-2">Video Learning</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">10-minute power lessons</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">Watch anywhere</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <Zap className="h-12 w-12 mx-auto mb-4 text-yellow-600" />
                <h3 className="font-semibold text-lg mb-2">Micro-Courses</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Byte-sized brilliance</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">Finish in lunch break</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <FileText className="h-12 w-12 mx-auto mb-4 text-green-600" />
                <h3 className="font-semibold text-lg mb-2">Case Studies</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Real problems, real solutions</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">Indian examples</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <Users className="h-12 w-12 mx-auto mb-4 text-purple-600" />
                <h3 className="font-semibold text-lg mb-2">Group Activities</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Learn together, grow together</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">Live cohorts</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <Briefcase className="h-12 w-12 mx-auto mb-4 text-red-600" />
                <h3 className="font-semibold text-lg mb-2">Real Projects</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Build while you learn</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">Industry-ready portfolio</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Success Stories & Impact */}
      <section className="bg-gradient-to-r from-orange-600 to-purple-600 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-3xl font-bold mb-12">Creating Impact Across India</h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 text-center">
            <div className="transform hover:scale-105 transition-transform">
              <div className="text-5xl font-bold mb-2">10 Lakh+</div>
              <div className="text-orange-100">Indian Learners</div>
              <div className="text-sm text-orange-200 mt-1">from villages to metros</div>
            </div>
            <div className="transform hover:scale-105 transition-transform">
              <div className="text-5xl font-bold mb-2">₹15K</div>
              <div className="text-orange-100">Avg Salary Increase</div>
              <div className="text-sm text-orange-200 mt-1">per month after learning</div>
            </div>
            <div className="transform hover:scale-105 transition-transform">
              <div className="text-5xl font-bold mb-2">28 States</div>
              <div className="text-orange-100">Pan-India Reach</div>
              <div className="text-sm text-orange-200 mt-1">7 Union Territories</div>
            </div>
            <div className="transform hover:scale-105 transition-transform">
              <div className="text-5xl font-bold mb-2">92%</div>
              <div className="text-orange-100">Success Rate</div>
              <div className="text-sm text-orange-200 mt-1">placement & growth</div>
            </div>
          </div>
          
          {/* Success Quote */}
          <div className="mt-16 max-w-4xl mx-auto text-center">
            <blockquote className="text-xl italic">
              &ldquo;From a small town in Bihar to leading a tech team in Bangalore - TalentExcel changed my life!&rdquo;
            </blockquote>
            <p className="mt-4 text-orange-200">- Priya Sharma, Software Engineer at Flipkart</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="mx-auto max-w-7xl text-center">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
            Your Success Story <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-purple-600">Starts Today</span>
          </h2>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Join 10 lakh+ Indians who&apos;ve transformed their careers with AI-powered learning
          </p>
          
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/auth/register">
              <Button size="lg" className="bg-gradient-to-r from-orange-600 to-purple-600 hover:from-orange-700 hover:to-purple-700 text-white px-10 py-6 text-lg shadow-xl hover:shadow-2xl transition-all">
                <Rocket className="mr-2 h-6 w-6" />
                Start Free Today
              </Button>
            </Link>
            <Link href="/assessment">
              <Button size="lg" variant="outline" className="px-10 py-6 text-lg border-2 border-gray-300 hover:border-purple-600">
                <Brain className="mr-2 h-6 w-6" />
                Take AI Assessment
              </Button>
            </Link>
          </div>
          
          <div className="mt-8 flex items-center justify-center gap-x-6 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span>No Credit Card Required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span>100% Free to Start</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span>Cancel Anytime</span>
            </div>
          </div>
          
          {/* Trust Badges */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6">
            <Badge className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800">
              <Award className="w-4 h-4 mr-2" />
              Govt. of India Recognized
            </Badge>
            <Badge className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800">
              <Globe2 className="w-4 h-4 mr-2" />
              Made in India
            </Badge>
            <Badge className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800">
              <UserCheck className="w-4 h-4 mr-2" />
              Trusted by IITs & IIMs
            </Badge>
          </div>
        </div>
      </section>
    </div>
  )
}