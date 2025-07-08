import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import React from 'react'
import '@/styles/globals.css'
import { Providers } from './providers'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'SaSarjan App Store - Collective Prosperity Platform',
  description: 'Building a robust technology platform for digital and physical worlds to unite for growth',
  keywords: ['app store', 'collective prosperity', 'social impact', 'technology for good'],
  authors: [{ name: 'SaSarjan Team' }],
  openGraph: {
    title: 'SaSarjan App Store',
    description: 'Discover apps that empower individuals, organizations, and communities',
    type: 'website',
  },
  manifest: '/api/manifest',
}

export function generateViewport() {
  return {
    themeColor: [
      { media: '(prefers-color-scheme: light)', color: 'white' },
      { media: '(prefers-color-scheme: dark)', color: 'black' }
    ],
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased min-h-screen flex flex-col`}>
        <Providers>
          <Navigation />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}