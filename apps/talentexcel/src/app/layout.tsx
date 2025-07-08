import { Inter } from 'next/font/google'
import { Metadata } from 'next'
import '@/styles/globals.css'
import { Providers } from './providers'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TalentExcel - Career & Education Platform',
  description: 'Empowering careers through internships, fellowships, and learning opportunities',
  keywords: ['careers', 'internships', 'fellowships', 'education', 'mentorship', 'jobs'],
  authors: [{ name: 'SaSarjan' }],
  creator: 'SaSarjan',
  publisher: 'SaSarjan',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://talentexcel.com'),
  openGraph: {
    title: 'TalentExcel - Career & Education Platform',
    description: 'Empowering careers through internships, fellowships, and learning opportunities',
    url: 'https://talentexcel.com',
    siteName: 'TalentExcel',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TalentExcel - Career & Education Platform',
    description: 'Empowering careers through internships, fellowships, and learning opportunities',
    creator: '@talentexcel',
  },
  manifest: '/api/manifest',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#2563eb' },
    { media: '(prefers-color-scheme: dark)', color: '#1e40af' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers appId="talentexcel">
          <div className="min-h-screen flex flex-col">
            <Navigation />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  )
}