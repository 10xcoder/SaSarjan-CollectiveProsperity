'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome to SaSarjan! 🎉
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            You have successfully authenticated with the SaSarjan platform.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Authentication Success</CardTitle>
              <CardDescription>
                Your account has been verified and you're now logged in.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Email/Phone verified</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Session active</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Ready to explore</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
              <CardDescription>
                Explore the SaSarjan platform features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  📱 Explore Apps
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  💰 Setup Wallet
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  👤 Complete Profile
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  🌍 Discover Communities
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Authentication System Features</CardTitle>
            <CardDescription>
              What you just experienced
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl mb-2">📧</div>
                <h3 className="font-semibold">Email Verification</h3>
                <p className="text-sm text-muted-foreground">
                  Secure email-based authentication with verification codes
                </p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl mb-2">📱</div>
                <h3 className="font-semibold">WhatsApp Verification</h3>
                <p className="text-sm text-muted-foreground">
                  Phone number verification via WhatsApp messages
                </p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl mb-2">🔒</div>
                <h3 className="font-semibold">Secure Sessions</h3>
                <p className="text-sm text-muted-foreground">
                  Cross-app session management with automatic refresh
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button variant="outline" asChild>
            <a href="/auth/login">
              🚪 Test Login Again
            </a>
          </Button>
        </div>
      </div>
    </div>
  )
}