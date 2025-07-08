import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const locale = request.headers.get('accept-language')?.split(',')[0] || 'en'
  const theme = request.cookies.get('theme')?.value || 'light'
  
  const manifest = {
    name: process.env.NEXT_PUBLIC_APP_NAME || "SaSarjan App Store - Collective Prosperity Platform",
    short_name: "SaSarjan",
    description: "Building a robust technology platform for digital and physical worlds to unite for growth",
    start_url: "/",
    display: "standalone",
    background_color: theme === 'dark' ? "#0a0a0a" : "#ffffff",
    theme_color: theme === 'dark' ? "#0a0a0a" : "#6366F1",
    orientation: "portrait-primary",
    dir: locale.startsWith('ar') || locale.startsWith('he') ? 'rtl' : 'ltr',
    lang: locale,
    scope: "/",
    icons: [
      {
        src: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any maskable"
      },
      {
        src: "/icons/icon-192.svg",
        sizes: "192x192",
        type: "image/svg+xml",
        purpose: "any maskable"
      },
      {
        src: "/icons/icon-512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "any maskable"
      }
    ],
    categories: ["productivity", "social", "education", "business"],
    screenshots: [
      {
        src: "/screenshots/home.png",
        sizes: "1080x1920",
        type: "image/png",
        label: "Home Screen"
      },
      {
        src: "/screenshots/apps.png",
        sizes: "1080x1920",
        type: "image/png",
        label: "Browse Apps"
      },
      {
        src: "/screenshots/dashboard.png",
        sizes: "1080x1920",
        type: "image/png",
        label: "User Dashboard"
      }
    ],
    shortcuts: [
      {
        name: "Browse Apps",
        short_name: "Apps",
        description: "Discover apps for collective prosperity",
        url: "/apps",
        icons: [
          {
            src: "/icons/shortcuts/apps.png",
            sizes: "96x96"
          }
        ]
      },
      {
        name: "My Dashboard",
        short_name: "Dashboard",
        description: "View your apps and activity",
        url: "/dashboard",
        icons: [
          {
            src: "/icons/shortcuts/dashboard.png",
            sizes: "96x96"
          }
        ]
      },
      {
        name: "Developer Portal",
        short_name: "Develop",
        description: "Create and manage your apps",
        url: "/developer",
        icons: [
          {
            src: "/icons/shortcuts/developer.png",
            sizes: "96x96"
          }
        ]
      }
    ],
    prefer_related_applications: false,
    related_applications: []
  }
  
  return NextResponse.json(manifest)
}