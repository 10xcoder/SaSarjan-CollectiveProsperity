import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Sparkles, Globe, Heart, Zap, Users, Briefcase, Building2, MapPin, Clock, TrendingUp } from "lucide-react"
import Link from "next/link"
import { ProsperityWheel } from "@/components/landing/ProsperityWheel"
import { AnimatedCounter } from "@/components/landing/AnimatedCounter"
import { CountdownTimer } from "@/components/landing/CountdownTimer"
import { BundleCard, type Bundle } from "@/components/landing/BundleCard"
import { LocationBanner } from "@/components/landing/LocationBanner"

export default function HomePage() {
  const microApps = [
    {
      name: "TalentExcel",
      title: "Career Opportunities",
      description: "Discover internships, fellowships, and skill development programs",
      icon: Briefcase,
      color: "bg-blue-500/10 text-blue-600",
      status: "launching-soon",
      url: "https://talentexcel.com",
      features: ["Location-aware matching", "Skill assessments", "Mentorship programs"]
    },
    {
      name: "SevaPremi", 
      title: "Community Service",
      description: "Connect with local community service opportunities and initiatives",
      icon: Heart,
      color: "bg-green-500/10 text-green-600", 
      status: "launching-soon",
      url: "https://sevapremi.com",
      features: ["Local impact tracking", "Volunteer coordination", "Service verification"]
    },
    {
      name: "10xGrowth",
      title: "Business Growth",
      description: "Tools and resources for accelerating business development",
      icon: Building2,
      color: "bg-purple-500/10 text-purple-600",
      status: "launching-soon", 
      url: "https://10xgrowth.com",
      features: ["Growth analytics", "Market insights", "Partnership matching"]
    }
  ]

  const prosperityCategories = [
    {
      title: "Personal Transformation",
      description: "Empowering individual growth and self-realization",
      icon: Sparkles,
      color: "bg-prosperity-personal/10 text-prosperity-personal",
      apps: 24
    },
    {
      title: "Community Resilience", 
      description: "Strengthening social bonds and collective capacity",
      icon: Heart,
      color: "bg-prosperity-community/10 text-prosperity-community",
      apps: 18
    },
    {
      title: "Ecological Regeneration",
      description: "Healing and enhancing natural systems", 
      icon: Globe,
      color: "bg-prosperity-ecological/10 text-prosperity-ecological",
      apps: 12
    },
    {
      title: "Economic Empowerment",
      description: "Creating equitable and sustainable livelihoods",
      icon: Zap,
      color: "bg-prosperity-economic/10 text-prosperity-economic", 
      apps: 15
    }
  ]

  // Bundle deals data
  const bundles: Bundle[] = [
    {
      id: 'career-starter',
      name: 'Career Starter',
      description: 'Perfect for students and early career professionals',
      apps: ['TalentExcel', '10xGrowth'],
      originalPrice: 139,
      discountedPrice: 99,
      savings: 40,
      popular: false,
      features: [
        'Local internship finder',
        'Skill development programs',
        'Freelance marketplace access',
        'Professional networking',
        'Resume builder tools',
        'Interview preparation'
      ],
      color: '#3B82F6',
      icon: '🚀'
    },
    {
      id: 'community-hero',
      name: 'Community Hero',
      description: 'For those passionate about social impact',
      apps: ['SevaPremi', 'Impact Tracker'],
      originalPrice: 105,
      discountedPrice: 79,
      savings: 26,
      popular: false,
      features: [
        'Volunteer opportunity matching',
        'Impact measurement tools',
        'Community project management',
        'Social verification system',
        'Local leader directory',
        'Service hour tracking'
      ],
      color: '#10B981',
      icon: '❤️'
    },
    {
      id: 'complete-prosperity',
      name: 'Complete Prosperity',
      description: 'Everything you need for holistic growth',
      apps: ['TalentExcel', '10xGrowth', 'SevaPremi'],
      originalPrice: 249,
      discountedPrice: 149,
      savings: 100,
      popular: true,
      features: [
        'All Career Starter features',
        'All Community Hero features',
        'Cross-platform analytics',
        'Priority customer support',
        'Advanced mentorship access',
        'Exclusive workshops and events'
      ],
      color: '#8B5CF6',
      icon: '✨'
    }
  ]

  // Launch dates for countdown timers (30 days from now)
  const launchDate = new Date()
  launchDate.setDate(launchDate.getDate() + 30)

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-prosperity-personal/5 via-prosperity-community/5 to-prosperity-ecological/5" />
        
        <div className="container mx-auto px-4 py-16 text-center relative">
          {/* Location Banner */}
          <div className="max-w-2xl mx-auto mb-8">
            <LocationBanner />
          </div>

          {/* Bundle Deal Announcement */}
          <div className="mb-6">
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-4 py-2 text-sm font-medium">
              🎉 Limited Time: Save 30% with our Career Starter Bundle
            </Badge>
          </div>

          <div className="mx-auto max-w-6xl">
            <Badge variant="outline" className="mb-4">
              Collective Prosperity Platform
            </Badge>
            
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl bg-gradient-to-r from-prosperity-personal via-prosperity-community to-prosperity-ecological bg-clip-text text-transparent">
              SaSarjan App Store
            </h1>
            
            <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
              Building a robust technology platform for digital and physical worlds to unite for growth
            </p>

            {/* Prosperity Wheel */}
            <div className="my-12 flex justify-center">
              <ProsperityWheel 
                size={320} 
                interactive={true}
                className="mx-auto"
              />
            </div>

            <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
              <Button size="lg" asChild>
                <Link href="/apps">
                  Explore Apps
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/developer">
                  For Developers
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Micro-Apps Showcase */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">
            Integrated Ecosystem
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight">
            Our Launch Applications
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Three interconnected apps working together for collective prosperity. Start with one, grow with all.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {microApps.map((app) => {
            const Icon = app.icon
            // Get matching bundle for this app
            const matchingBundle = bundles.find(bundle => 
              bundle.apps.includes(app.name)
            )
            
            return (
              <Card key={app.name} className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20 relative overflow-hidden">
                {/* Bundle Badge */}
                {matchingBundle && (
                  <div className="absolute top-4 right-4 z-10">
                    <Badge 
                      variant="secondary" 
                      className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 text-xs"
                    >
                      Part of {matchingBundle.name} - Save {Math.round((matchingBundle.savings / matchingBundle.originalPrice) * 100)}%
                    </Badge>
                  </div>
                )}

                <CardHeader className="pb-4 pt-8">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl ${app.color} flex items-center justify-center`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <Badge variant="secondary" className="text-xs">
                        {app.status.replace('-', ' ')}
                      </Badge>
                    </div>
                  </div>
                  <CardTitle className="text-xl mb-2">{app.title}</CardTitle>
                  <CardDescription className="text-base">{app.description}</CardDescription>
                  
                  {/* Location availability */}
                  <div className="flex items-center text-xs text-muted-foreground mt-2">
                    <MapPin className="w-3 h-3 mr-1" />
                    Available in Mumbai, Delhi, Bangalore +15 cities
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  {/* Countdown timer for launching soon */}
                  {app.status === 'launching-soon' && (
                    <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-center mb-2">
                        <Clock className="w-4 h-4 mr-2 text-primary" />
                        <span className="text-sm font-medium">Launching in:</span>
                      </div>
                      <CountdownTimer 
                        launchDate={launchDate} 
                        size="sm"
                        className="justify-center"
                      />
                    </div>
                  )}

                  {/* Features - hidden on mobile, shown on hover on desktop */}
                  <div className="mb-6">
                    <div className="lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300">
                      <h4 className="text-sm font-medium mb-2">Key Features:</h4>
                      <ul className="space-y-1">
                        {app.features.slice(0, 3).map((feature, index) => (
                          <li key={index} className="flex items-center text-sm text-muted-foreground">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors" asChild>
                    <Link href={app.url}>
                      Learn More
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Integration Benefits */}
        <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl p-8 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-primary mr-3" />
              <h3 className="text-2xl font-bold">Unified Experience</h3>
            </div>
            <p className="text-lg text-muted-foreground mb-6">
              One shared wallet, unified profile, and seamless switching between career growth, community service, and business development.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Badge variant="outline" className="px-4 py-2">
                <Heart className="w-4 h-4 mr-2" />
                Shared Impact Tracking
              </Badge>
              <Badge variant="outline" className="px-4 py-2">
                <Zap className="w-4 h-4 mr-2" />
                Cross-App Rewards
              </Badge>
              <Badge variant="outline" className="px-4 py-2">
                <Globe className="w-4 h-4 mr-2" />
                Location-Aware Everything
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Bundle Deals Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">
            <TrendingUp className="w-4 h-4 mr-2" />
            Bundle Deals
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight">
            Save More with App Bundles
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Get more value by combining apps that work better together. Choose the bundle that fits your journey.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {bundles.map((bundle) => (
            <BundleCard
              key={bundle.id}
              bundle={bundle}
              onSelect={(bundleId) => {
                // Handle bundle selection - could navigate to checkout
                console.log('Selected bundle:', bundleId)
              }}
            />
          ))}
        </div>

        {/* Bundle comparison benefits */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-4">
            All bundles include our core benefits:
          </p>
          <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
            <Badge variant="outline" className="px-3 py-1">
              ✓ 30-day money back guarantee
            </Badge>
            <Badge variant="outline" className="px-3 py-1">
              ✓ Cancel anytime
            </Badge>
            <Badge variant="outline" className="px-3 py-1">
              ✓ Unified profile & wallet
            </Badge>
            <Badge variant="outline" className="px-3 py-1">
              ✓ Cross-app analytics
            </Badge>
            <Badge variant="outline" className="px-3 py-1">
              ✓ Community support
            </Badge>
          </div>
        </div>
      </section>

      {/* Prosperity Categories */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight">
            Discover Apps for Collective Prosperity
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Empowering individuals, organizations, and communities through technology
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {prosperityCategories.map((category) => {
            const Icon = category.icon
            return (
              <Card key={category.title} className="group hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${category.color} flex items-center justify-center mb-3`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-lg">{category.title}</CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {category.apps} apps
                    </span>
                    <Button variant="ghost" size="sm" className="group-hover:translate-x-1 transition-transform" aria-label={`View ${category.title} apps`}>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Impact Metrics Section */}
      <section className="bg-gradient-to-r from-prosperity-economic/5 to-prosperity-organizational/5 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              <TrendingUp className="w-4 h-4 mr-2" />
              Our Impact
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight">
              Growing Together, Prospering Together
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Real numbers showing the collective impact of our prosperity platform across India.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="mb-4">
                <Users className="w-8 h-8 text-prosperity-personal mx-auto mb-2" />
                <AnimatedCounter
                  value={50000}
                  suffix="+"
                  className="text-3xl lg:text-4xl font-bold text-prosperity-personal"
                />
                <p className="text-sm text-muted-foreground mt-2">Total Users</p>
              </div>
            </div>

            <div className="text-center">
              <div className="mb-4">
                <Sparkles className="w-8 h-8 text-prosperity-community mx-auto mb-2" />
                <AnimatedCounter
                  value={24}
                  className="text-3xl lg:text-4xl font-bold text-prosperity-community"
                />
                <p className="text-sm text-muted-foreground mt-2">Active Apps</p>
              </div>
            </div>

            <div className="text-center">
              <div className="mb-4">
                <MapPin className="w-8 h-8 text-prosperity-ecological mx-auto mb-2" />
                <AnimatedCounter
                  value={127}
                  className="text-3xl lg:text-4xl font-bold text-prosperity-ecological"
                />
                <p className="text-sm text-muted-foreground mt-2">Cities Covered</p>
              </div>
            </div>

            <div className="text-center">
              <div className="mb-4">
                <Heart className="w-8 h-8 text-prosperity-economic mx-auto mb-2" />
                <AnimatedCounter
                  value={2.5}
                  suffix="M+"
                  decimals={1}
                  className="text-3xl lg:text-4xl font-bold text-prosperity-economic"
                />
                <p className="text-sm text-muted-foreground mt-2">Lives Impacted</p>
              </div>
            </div>
          </div>

          {/* Additional metrics row */}
          <div className="mt-12 pt-8 border-t border-border/50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <AnimatedCounter
                  value={89}
                  suffix="%"
                  className="text-2xl font-bold text-green-600"
                />
                <p className="text-sm text-muted-foreground mt-1">User Satisfaction Rate</p>
              </div>
              <div>
                <AnimatedCounter
                  value={1.2}
                  suffix="M"
                  decimals={1}
                  className="text-2xl font-bold text-blue-600"
                />
                <p className="text-sm text-muted-foreground mt-1">Opportunities Created</p>
              </div>
              <div>
                <AnimatedCounter
                  value={15}
                  suffix=" States"
                  className="text-2xl font-bold text-purple-600"
                />
                <p className="text-sm text-muted-foreground mt-1">Geographic Reach</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted/50 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Global Impact</h3>
              <p className="text-muted-foreground">
                Connect with apps making real-world positive impact across communities worldwide
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Hyper Personalized</h3>
              <p className="text-muted-foreground">
                AI-powered recommendations that understand your unique needs and goals
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Community Driven</h3>
              <p className="text-muted-foreground">
                Built by the community, for the community, with transparency and shared ownership
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}