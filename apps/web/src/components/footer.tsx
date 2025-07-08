import Link from 'next/link'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Store, Github, Twitter, Heart } from 'lucide-react'

export function Footer() {
  const footerSections = [
    {
      title: 'Platform',
      links: [
        { name: 'Browse Apps', href: '/apps' },
        { name: 'Developer Portal', href: '/developer' },
        { name: 'Community', href: '/community' },
        { name: 'Success Stories', href: '/stories' },
      ],
    },
    {
      title: 'Prosperity Categories',
      links: [
        { name: 'Personal Transformation', href: '/categories/personal' },
        { name: 'Community Resilience', href: '/categories/community' },
        { name: 'Ecological Regeneration', href: '/categories/ecological' },
        { name: 'Economic Empowerment', href: '/categories/economic' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { name: 'Documentation', href: '/docs' },
        { name: 'API Reference', href: '/docs/api' },
        { name: 'Support', href: '/support' },
        { name: 'Status', href: '/status' },
      ],
    },
    {
      title: 'Company',
      links: [
        { name: 'About', href: '/about' },
        { name: 'Blog', href: '/blog' },
        { name: 'Careers', href: '/careers' },
        { name: 'Contact', href: '/contact' },
      ],
    },
  ]

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Store className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl">SaSarjan</span>
            </Link>
            <p className="text-muted-foreground text-sm mb-4 max-w-xs">
              Building a robust technology platform for digital and physical worlds to unite for growth through collective prosperity.
            </p>
            <div className="flex items-center space-x-2 mb-4">
              <Badge variant="outline" className="text-xs">
                Collective Prosperity
              </Badge>
              <Badge variant="outline" className="text-xs">
                Open Source
              </Badge>
            </div>
            <div className="flex items-center space-x-3">
              <Link 
                href="https://github.com/sasarjan" 
                className="text-muted-foreground hover:text-foreground transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </Link>
              <Link 
                href="https://twitter.com/sasarjan" 
                className="text-muted-foreground hover:text-foreground transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold text-sm mb-3">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8" />

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span>&copy; 2025 SaSarjan. All rights reserved.</span>
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Terms
            </Link>
            <Link href="/cookies" className="hover:text-foreground transition-colors">
              Cookies
            </Link>
          </div>
          
          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
            <span>Made with</span>
            <Heart className="h-4 w-4 text-red-500 fill-red-500" />
            <span>for collective prosperity</span>
          </div>
        </div>
      </div>
    </footer>
  )
}