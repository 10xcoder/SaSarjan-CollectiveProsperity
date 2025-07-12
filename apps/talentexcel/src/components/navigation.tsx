'use client'

import { Navbar } from './navigation/navbar/Navbar'
import { NavConfig } from './navigation/types'
import { NavigationWrapper } from './navigation-wrapper'
import { ThemeToggle } from './theme-toggle'
import { 
  GraduationCap,
  Briefcase,
  BookOpen,
  Users,
  Award,
  Library,
  Target,
  Sparkles,
  FileText,
  HelpCircle,
  TrendingUp,
  Globe,
  Calendar,
  MapPin,
  DollarSign,
  Clock,
  Building,
  Rocket,
  Heart,
  MessageSquare,
  Video,
  Newspaper,
  Trophy,
  Star,
  CheckCircle,
  ArrowRight
} from 'lucide-react'
import { useRouter } from 'next/navigation'

export function Navigation() {
  const router = useRouter()
  
  // TODO: Re-enable authentication after fixing build issues
  const user = null
  const signOut = () => {}
  const signIn = () => router.push('/auth/login')

  const navConfig: NavConfig = {
    brand: {
      name: 'TalentExcel',
      logo: GraduationCap,
      href: '/',
      tagline: 'Career Excellence'
    },
    items: [
      {
        label: 'Programs',
        icon: Award,
        children: [
          {
            label: 'Tech Internships',
            href: '/internships/tech',
            icon: Briefcase,
            description: 'Software, AI/ML, Data Science positions',
            featured: true,
            badge: 'Hot'
          },
          {
            label: 'Business Internships',
            href: '/internships/business',
            icon: TrendingUp,
            description: 'Marketing, Finance, Operations roles'
          },
          {
            label: 'Research Fellowships',
            href: '/fellowships/research',
            icon: GraduationCap,
            description: 'Academic and industry research',
            featured: true,
            badge: 'New'
          },
          {
            label: 'Global Programs',
            href: '/programs/global',
            icon: Globe,
            description: 'International opportunities',
            badge: '50+'
          },
          {
            label: 'Summer Programs',
            href: '/programs/summer',
            icon: Calendar,
            description: '2-3 month intensive programs'
          },
          {
            label: 'Remote Opportunities',
            href: '/programs/remote',
            icon: MapPin,
            description: 'Work from anywhere positions'
          }
        ]
      },
      {
        label: 'Learning Hub',
        icon: BookOpen,
        columns: 3,
        children: [
          {
            label: 'AI & Machine Learning',
            href: '/learn/ai-ml',
            icon: Rocket,
            description: 'Deep learning, NLP, Computer Vision',
            featured: true,
            badge: 'Trending'
          },
          {
            label: 'Full Stack Development',
            href: '/learn/fullstack',
            icon: Building,
            description: 'React, Node.js, Cloud deployment'
          },
          {
            label: 'Data Science',
            href: '/learn/data-science',
            icon: Target,
            description: 'Python, R, Statistical analysis'
          },
          {
            label: 'Product Management',
            href: '/learn/product',
            icon: Star,
            description: 'Strategy, Analytics, Leadership'
          },
          {
            label: 'UI/UX Design',
            href: '/learn/design',
            icon: Heart,
            description: 'Figma, User research, Prototyping'
          },
          {
            label: 'Digital Marketing',
            href: '/learn/marketing',
            icon: MessageSquare,
            description: 'SEO, Content, Social media'
          },
          {
            label: 'Blockchain & Web3',
            href: '/learn/blockchain',
            icon: Globe,
            description: 'Smart contracts, DeFi, NFTs',
            badge: 'New'
          },
          {
            label: 'Cybersecurity',
            href: '/learn/security',
            icon: CheckCircle,
            description: 'Ethical hacking, Network security'
          },
          {
            label: 'Cloud Computing',
            href: '/learn/cloud',
            icon: Building,
            description: 'AWS, Azure, Google Cloud'
          }
        ]
      },
      {
        label: 'Resources',
        icon: Library,
        columns: 2,
        children: [
          {
            label: 'Career Roadmaps',
            href: '/resources/roadmaps',
            icon: Target,
            description: 'Step-by-step career guides',
            featured: true
          },
          {
            label: 'Interview Prep',
            href: '/resources/interview',
            icon: Video,
            description: 'Mock interviews, tips & tricks'
          },
          {
            label: 'Salary Calculator',
            href: '/resources/salary',
            icon: DollarSign,
            description: 'Industry-wise compensation data'
          },
          {
            label: 'Resume Templates',
            href: '/resources/resume',
            icon: FileText,
            description: 'ATS-friendly templates'
          },
          {
            label: 'Success Stories',
            href: '/resources/stories',
            icon: Trophy,
            description: 'Alumni achievements & journeys'
          },
          {
            label: 'Industry Reports',
            href: '/resources/reports',
            icon: Newspaper,
            description: 'Latest trends & insights'
          },
          {
            label: 'Skill Assessments',
            href: '/resources/assessments',
            icon: CheckCircle,
            description: 'Test your knowledge'
          },
          {
            label: 'Career Events',
            href: '/resources/events',
            icon: Calendar,
            description: 'Webinars, workshops & more'
          }
        ]
      },
      {
        label: 'Mentorship',
        icon: Users,
        children: [
          {
            label: 'Find a Mentor',
            href: '/mentors/find',
            icon: Users,
            description: 'Connect with industry experts',
            featured: true,
            badge: '500+'
          },
          {
            label: 'Become a Mentor',
            href: '/mentors/apply',
            icon: Award,
            description: 'Guide the next generation'
          },
          {
            label: 'Group Sessions',
            href: '/mentors/groups',
            icon: MessageSquare,
            description: 'Join mentor-led discussions'
          },
          {
            label: '1-on-1 Coaching',
            href: '/mentors/coaching',
            icon: Star,
            description: 'Personalized career guidance',
            badge: 'Premium'
          }
        ]
      },
      {
        label: 'Companies',
        icon: Building,
        children: [
          {
            label: 'Tech Giants',
            href: '/companies/tech',
            icon: Rocket,
            description: 'Google, Microsoft, Amazon',
            featured: true
          },
          {
            label: 'Startups',
            href: '/companies/startups',
            icon: TrendingUp,
            description: 'High-growth opportunities',
            badge: '100+'
          },
          {
            label: 'MNCs',
            href: '/companies/mnc',
            icon: Globe,
            description: 'Global corporations'
          },
          {
            label: 'Post a Job',
            href: '/companies/post',
            icon: ArrowRight,
            description: 'Hire top talent',
            external: true
          }
        ]
      }
    ],
    actions: <ThemeToggle />,
    sticky: true
  }

  return (
    <NavigationWrapper>
      <Navbar
        config={navConfig}
        user={user}
        onSignIn={signIn}
        onSignOut={signOut}
        showSearch={true}
        showNotifications={true}
        notificationCount={3}
      />
    </NavigationWrapper>
  )
}