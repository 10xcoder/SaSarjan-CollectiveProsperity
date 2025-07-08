import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  GraduationCap, 
  Briefcase, 
  Users, 
  Award, 
  TrendingUp,
  Search,
  BookOpen,
  Target
} from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="px-4 py-16 sm:px-6 sm:py-24 lg:px-8 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
        <div className="mx-auto max-w-7xl text-center">
          <Badge className="mb-4" variant="secondary">
            Career & Education Platform
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Excel in Your Career Journey
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Discover internships, fellowships, and learning opportunities. Connect with mentors and build the career you've always dreamed of.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link href="/opportunities">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Search className="mr-2 h-4 w-4" />
                Explore Opportunities
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button size="lg" variant="outline">
                Join TalentExcel
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Your Career Growth Hub
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              Everything you need to build a successful career
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-blue-200 dark:border-blue-800">
              <CardHeader>
                <Briefcase className="h-10 w-10 text-blue-600 mb-2" />
                <CardTitle>Internships</CardTitle>
                <CardDescription>
                  Find paid internships at top companies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Connect with innovative startups and established corporations offering hands-on experience.
                </p>
              </CardContent>
            </Card>

            <Card className="border-purple-200 dark:border-purple-800">
              <CardHeader>
                <GraduationCap className="h-10 w-10 text-purple-600 mb-2" />
                <CardTitle>Fellowships</CardTitle>
                <CardDescription>
                  Prestigious programs for growth
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Apply for exclusive fellowship programs with mentorship and funding opportunities.
                </p>
              </CardContent>
            </Card>

            <Card className="border-green-200 dark:border-green-800">
              <CardHeader>
                <BookOpen className="h-10 w-10 text-green-600 mb-2" />
                <CardTitle>Learning Paths</CardTitle>
                <CardDescription>
                  Structured skill development
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Follow curated learning paths designed by industry experts to master in-demand skills.
                </p>
              </CardContent>
            </Card>

            <Card className="border-orange-200 dark:border-orange-800">
              <CardHeader>
                <Users className="h-10 w-10 text-orange-600 mb-2" />
                <CardTitle>Mentorship</CardTitle>
                <CardDescription>
                  Connect with industry leaders
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Get guidance from experienced professionals who've walked the path you're on.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-blue-600 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 text-center">
            <div>
              <div className="text-4xl font-bold">10K+</div>
              <div className="mt-2 text-blue-100">Active Opportunities</div>
            </div>
            <div>
              <div className="text-4xl font-bold">50K+</div>
              <div className="mt-2 text-blue-100">Career Seekers</div>
            </div>
            <div>
              <div className="text-4xl font-bold">500+</div>
              <div className="mt-2 text-blue-100">Partner Companies</div>
            </div>
            <div>
              <div className="text-4xl font-bold">95%</div>
              <div className="mt-2 text-blue-100">Placement Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to Excel?
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Join thousands of ambitious professionals building their dream careers
          </p>
          <div className="mt-8">
            <Link href="/auth/register">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Target className="mr-2 h-5 w-5" />
                Start Your Journey
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}