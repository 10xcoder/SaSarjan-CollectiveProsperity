import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '10xGrowth - Scale Your Business with Global Talent',
  description: 'The premier platform connecting businesses with top-tier freelancers for exponential growth. Find verified professionals, secure payments, and guaranteed quality.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://10xgrowth.com'),
  openGraph: {
    title: '10xGrowth - Scale Your Business with Global Talent',
    description: 'The premier platform connecting businesses with top-tier freelancers for exponential growth.',
    url: '/',
    siteName: '10xGrowth',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '10xGrowth - Scale Your Business with Global Talent',
    description: 'The premier platform connecting businesses with top-tier freelancers for exponential growth.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <nav className="bg-gray-900 text-white p-4">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center">
              <a href="/" className="text-xl font-bold hover:text-gray-300">10xGrowth</a>
            </div>
            <div className="hidden md:flex gap-6">
              <a href="/" className="hover:text-gray-300">Home</a>
              <a href="/browse" className="hover:text-gray-300">Browse Freelancers</a>
              <a href="/business-growth" className="hover:text-gray-300">For Business</a>
              <a href="/join-freelancers" className="hover:text-gray-300">For Freelancers</a>
              <a href="/about" className="hover:text-gray-300">About</a>
            </div>
            <div className="flex gap-3">
              <a href="/admin" className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-700 transition-colors text-sm">Admin</a>
              <a href="/profile" className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 hover:text-gray-900 transition-colors text-sm">Profile</a>
            </div>
          </div>
        </nav>
        <main className="min-h-screen bg-gray-50">
          {children}
        </main>
        </Providers>
      </body>
    </html>
  );
}