"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Users, 
  Package, 
  IndianRupee, 
  Download,
  TrendingUp,
  UserCheck,
  Boxes,
  Activity
} from "lucide-react"
import { adminQueries } from "@/lib/supabase"
import { formatINR, formatIndianNumber } from "@/lib/utils"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface DashboardStats {
  totalUsers: number
  totalApps: number
  totalRevenue: number
  activeInstallations: number
}

interface UserBreakdown {
  admins: number
  developers: number
  multiProfile: number
  regular: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalApps: 0,
    totalRevenue: 0,
    activeInstallations: 0
  })
  const [userBreakdown, setUserBreakdown] = useState<UserBreakdown>({
    admins: 0,
    developers: 0,
    multiProfile: 0,
    regular: 0
  })
  const [recentTransactions, setRecentTransactions] = useState<unknown[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  async function loadDashboardData() {
    try {
      const [statsData, breakdown, transactions] = await Promise.all([
        adminQueries.getDashboardStats(),
        adminQueries.getUserBreakdown(),
        adminQueries.getRecentTransactions(5)
      ])
      
      setStats(statsData)
      setUserBreakdown(breakdown)
      setRecentTransactions(transactions)
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div data-testid="dashboard-header">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Welcome to SaSarjan Admin Portal - Manage your platform effectively
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatIndianNumber(stats.totalUsers)}</div>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Admins</span>
                <span className="font-medium">{userBreakdown.admins}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Developers</span>
                <span className="font-medium">{userBreakdown.developers}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Multi-Profile</span>
                <span className="font-medium">{userBreakdown.multiProfile}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Apps</CardTitle>
            <Package className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalApps}</div>
            <p className="text-xs text-gray-600 mt-1">
              7 major apps with 36 micro-apps
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <IndianRupee className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatINR(stats.totalRevenue)}</div>
            <p className="text-xs text-gray-600 mt-1">
              Lifetime platform revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Installations</CardTitle>
            <Download className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatIndianNumber(stats.activeInstallations)}</div>
            <p className="text-xs text-gray-600 mt-1">
              Across all platform apps
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-blue-600" />
              User Management
            </CardTitle>
            <CardDescription>
              View and manage all users including multi-profile users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/users">Manage Users</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Boxes className="h-5 w-5 text-green-600" />
              App Management
            </CardTitle>
            <CardDescription>
              Manage platform apps and their micro-apps
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/apps">Manage Apps</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              Revenue Analytics
            </CardTitle>
            <CardDescription>
              View detailed revenue reports and analytics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/revenue">View Analytics</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Recent Transactions</span>
            <Button asChild variant="outline" size="sm">
              <Link href="/revenue">View All</Link>
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentTransactions.map((transaction: any) => (
              <div key={transaction.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <Activity className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{transaction.users?.full_name || 'Unknown User'}</p>
                    <p className="text-xs text-gray-600">
                      {transaction.apps?.name || 'Unknown App'} • {new Date(transaction.created_at).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">{formatINR(transaction.amount)}</p>
                  <p className="text-xs text-gray-500">{transaction.purchase_type || 'purchase'}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Platform Status */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Platform Apps Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">TalentExcel</span>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Active</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">10xGrowth</span>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Active</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">SevaPremi</span>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Active</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Incubator.in</span>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Active</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">NanhaSitara</span>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Active</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Average Rating</span>
              <span className="font-medium">4.7 / 5.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Reviews</span>
              <span className="font-medium">12,450</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Success Stories</span>
              <span className="font-medium">7</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">External Apps</span>
              <span className="font-medium">16</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}