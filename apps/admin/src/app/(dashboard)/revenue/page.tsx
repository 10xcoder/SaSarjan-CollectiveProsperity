"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  IndianRupee,
  TrendingUp,
  TrendingDown,
  Download,
  Package,
  Wallet,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react"
import { adminQueries } from "@/lib/supabase"
import { formatINR, formatIndianNumber, formatDate } from "@/lib/utils"

interface RevenueStats {
  totalRevenue: number
  currentMonthRevenue: number
  previousMonthRevenue: number
  totalTransactions: number
  averageTransactionValue: number
  topSellingApp: string
  developerPayouts: number
  platformCommission: number
}

interface Transaction {
  id: string
  user_id: string
  wallet_id: string
  amount: number
  currency: string
  type: string // credit or debit
  status: string
  description: string | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
  developer_share: number
  platform_share: number
  payment_method: string
  purchase_type: string
  users?: {
    full_name: string
    email: string
  }
  wallets?: {
    balance: number
    currency: string
  }
  apps?: {
    name: string
    slug: string
  }
  app_modules?: {
    name: string
  } | null
}

interface AppRevenue {
  app_id: string
  app_name: string
  total_revenue: number
  transaction_count: number
  avg_transaction_value: number
}

export default function RevenuePage() {
  const [stats, setStats] = useState<RevenueStats>({
    totalRevenue: 0,
    currentMonthRevenue: 0,
    previousMonthRevenue: 0,
    totalTransactions: 0,
    averageTransactionValue: 0,
    topSellingApp: '',
    developerPayouts: 0,
    platformCommission: 0
  })
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [appRevenues, setAppRevenues] = useState<AppRevenue[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({
    status: 'all',
    dateRange: '30days',
    search: ''
  })
  const [page, setPage] = useState(1)
  const pageSize = 20

  const loadRevenueData = useCallback(async () => {
    try {
      setLoading(true)
      const [revenueStats, transactionData, appRevenueData] = await Promise.all([
        adminQueries.getRevenueStats(filter.dateRange),
        adminQueries.getTransactions(page, pageSize, filter),
        adminQueries.getAppRevenues(filter.dateRange)
      ])
      
      setStats(revenueStats)
      setTransactions(transactionData.transactions || [])
      setAppRevenues(appRevenueData || [])
    } catch (error) {
      console.error("Error loading revenue data:", error)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, filter])

  useEffect(() => {
    loadRevenueData()
  }, [loadRevenueData])

  const monthGrowth = stats.previousMonthRevenue > 0 
    ? ((stats.currentMonthRevenue - stats.previousMonthRevenue) / stats.previousMonthRevenue * 100).toFixed(1)
    : '0'

  const isPositiveGrowth = parseFloat(monthGrowth) >= 0

  if (loading && page === 1) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Revenue Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Track platform revenue, transactions, and developer payouts
        </p>
      </div>

      {/* Revenue Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <IndianRupee className="h-4 w-4 text-green-600" />
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
            <CardTitle className="text-sm font-medium">Current Month</CardTitle>
            {isPositiveGrowth ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatINR(stats.currentMonthRevenue)}</div>
            <div className="flex items-center text-xs mt-1">
              {isPositiveGrowth ? (
                <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-red-600 mr-1" />
              )}
              <span className={isPositiveGrowth ? "text-green-600" : "text-red-600"}>
                {monthGrowth}% vs last month
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Developer Payouts</CardTitle>
            <Wallet className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatINR(stats.developerPayouts)}</div>
            <p className="text-xs text-gray-600 mt-1">
              70% revenue share
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Commission</CardTitle>
            <CreditCard className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatINR(stats.platformCommission)}</div>
            <p className="text-xs text-gray-600 mt-1">
              30% platform share
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatIndianNumber(stats.totalTransactions)}</p>
            <p className="text-xs text-gray-600 mt-1">Successful payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Average Transaction Value</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatINR(stats.averageTransactionValue)}</p>
            <p className="text-xs text-gray-600 mt-1">Per transaction</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Top Selling App</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.topSellingApp || 'TalentExcel'}</p>
            <p className="text-xs text-gray-600 mt-1">By revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* App Revenue Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue by App</CardTitle>
          <CardDescription>Performance of each platform app</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {appRevenues.map((appRevenue) => {
              const percentage = stats.totalRevenue > 0 
                ? (appRevenue.total_revenue / stats.totalRevenue * 100).toFixed(1)
                : '0'
              
              return (
                <div key={appRevenue.app_id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white">
                      <Package className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{appRevenue.app_name}</p>
                      <p className="text-xs text-gray-600">
                        {formatIndianNumber(appRevenue.transaction_count)} transactions
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatINR(appRevenue.total_revenue)}</p>
                    <p className="text-xs text-gray-600">{percentage}% of total</p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search by user, app, or transaction ID..."
            value={filter.search}
            onChange={(e) => setFilter({...filter, search: e.target.value})}
            className="w-full"
          />
        </div>
        <Select
          value={filter.dateRange}
          onValueChange={(value) => setFilter({...filter, dateRange: value})}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 days</SelectItem>
            <SelectItem value="30days">Last 30 days</SelectItem>
            <SelectItem value="90days">Last 90 days</SelectItem>
            <SelectItem value="12months">Last 12 months</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filter.status}
          onValueChange={(value) => setFilter({...filter, status: value})}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Detailed transaction history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  <th className="text-left py-3 px-4">Transaction</th>
                  <th className="text-left py-3 px-4">User</th>
                  <th className="text-left py-3 px-4">App/Module</th>
                  <th className="text-right py-3 px-4">Amount</th>
                  <th className="text-right py-3 px-4">Dev Share</th>
                  <th className="text-center py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <p className="font-mono text-xs">{transaction.id.slice(0, 8)}...</p>
                      <p className="text-xs text-gray-600">{transaction.payment_method}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium">{transaction.users?.full_name}</p>
                      <p className="text-xs text-gray-600">{transaction.users?.email}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium">{transaction.apps?.name || 'General Transaction'}</p>
                      {transaction.app_modules && (
                        <p className="text-xs text-gray-600">{transaction.app_modules.name}</p>
                      )}
                      {transaction.description && (
                        <p className="text-xs text-gray-600">{transaction.description}</p>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <p className="font-semibold">{formatINR(transaction.amount)}</p>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <p className="text-green-600">{formatINR(transaction.developer_share)}</p>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                        transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        transaction.status === 'failed' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm">{formatDate(transaction.created_at)}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-600">
              Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, transactions.length)} transactions
            </p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setPage(p => p + 1)}
                disabled={transactions.length < pageSize}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}