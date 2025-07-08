import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '10X Growth - Freelancer Marketplace',
  description: 'Connect with top freelancers for your 10X growth journey',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="bg-gray-900 text-white p-4">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold">10X Growth</h1>
            <div className="flex gap-4">
              <a href="/" className="hover:text-gray-300">Browse Freelancers</a>
              <a href="/dashboard" className="hover:text-gray-300">Dashboard</a>
              <a href="/profile" className="hover:text-gray-300">Profile</a>
            </div>
          </div>
        </nav>
        <main className="min-h-screen bg-gray-50">
          {children}
        </main>
      </body>
    </html>
  );
}