import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Sparkles, Globe, Heart, Zap, Users, Briefcase, Building2 } from "lucide-react"
import Link from "next/link"

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

  return (
    <>
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24 text-center">
        <div className="mx-auto max-w-4xl">
          <Badge variant="outline" className="mb-4">
            Collective Prosperity Platform
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            SaSarjan App Store
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
            Building a robust technology platform for digital and physical worlds to unite for growth
          </p>
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
            return (
              <Card key={app.name} className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl ${app.color} flex items-center justify-center`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {app.status.replace('-', ' ')}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl mb-2">{app.title}</CardTitle>
                  <CardDescription className="text-base">{app.description}</CardDescription>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <ul className="space-y-2 mb-6">
                    {app.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
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