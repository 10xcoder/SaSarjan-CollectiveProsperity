import { createClient } from '@supabase/supabase-js'
import { Database } from '@sasarjan/database'

// Use local Supabase instance for development
const supabaseUrl = process.env.NODE_ENV === 'development' 
  ? 'http://127.0.0.1:54321' 
  : process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NODE_ENV === 'development' 
  ? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
  : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Admin-specific queries
export const adminQueries = {
  // Get dashboard stats
  async getDashboardStats() {
    const [
      { count: totalUsers },
      { count: totalApps },
      { data: revenueData },
      { count: activeInstallations }
    ] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('apps').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('transactions').select('amount').eq('status', 'completed').eq('type', 'credit'),
      supabase.from('app_installations').select('*', { count: 'exact', head: true }).eq('status', 'active')
    ])

    const totalRevenue = revenueData?.reduce((sum, purchase) => sum + (purchase.amount || 0), 0) || 0

    return {
      totalUsers: totalUsers || 0,
      totalApps: totalApps || 0,
      totalRevenue,
      activeInstallations: activeInstallations || 0
    }
  },

  // Get users with profiles
  async getUsersWithProfiles(page = 1, pageSize = 10) {
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    const { data: users, count } = await supabase
      .from('users')
      .select(`
        *,
        wallets (
          balance,
          currency,
          status
        ),
        app_installations (
          app_id,
          installed_at,
          status,
          apps (
            name,
            slug
          )
        ),
        reviews (
          id,
          rating,
          app_id
        )
      `, { count: 'exact' })
      .range(from, to)
      .order('created_at', { ascending: false })

    // Check if user is an admin
    if (users) {
      const { data: adminUsers } = await supabase
        .from('admin_users')
        .select('email, role')
        .in('email', users.map(u => u.email))

      const adminEmails = new Set(adminUsers?.map(a => a.email) || [])
      
      return {
        users: users.map(user => ({
          ...user,
          is_admin: adminEmails.has(user.email),
          wallet_balance: user.wallets?.[0]?.balance || 0,
          total_spent: 0, // Calculate from transactions if needed
          language_preference: 'en', // Default for now
          phone: null // Not in current schema
        })),
        total: count || 0
      }
    }

    return { users: [], total: count || 0 }
  },

  // Get apps with details
  async getAppsWithDetails(page = 1, pageSize = 10) {
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    const { data: apps, count } = await supabase
      .from('apps')
      .select(`
        *,
        micro_apps (
          id,
          name,
          description,
          category
        ),
        app_installations (
          id,
          user_id,
          installed_at,
          status
        ),
        reviews (
          id,
          rating,
          comment,
          user_id
        ),
        app_tags (
          tag_id,
          tags (
            name,
            color
          )
        )
      `, { count: 'exact' })
      .range(from, to)
      .order('created_at', { ascending: false })

    // Format apps data
    if (apps) {
      return {
        apps: apps.map(app => ({
          ...app,
          downloads: app.app_installations?.length || 0,
          rating: app.reviews?.length > 0 
            ? app.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / app.reviews.length 
            : 0,
          total_reviews: app.reviews?.length || 0,
          pricing_type: 'free', // Default for now
          price: 0 // Default for now
        })),
        total: count || 0
      }
    }

    return { apps: [], total: count || 0 }
  },

  // Get recent transactions
  async getRecentTransactions(limit = 10) {
    const { data: transactions } = await supabase
      .from('transactions')
      .select(`
        *,
        users (
          full_name,
          email
        ),
        wallets (
          balance,
          currency
        )
      `)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(limit)

    return transactions || []
  },

  // Get user breakdown by type
  async getUserBreakdown() {
    const { data: _users, count: totalUsers } = await supabase
      .from('users')
      .select('id, email, profession', { count: 'exact' })

    const { data: adminUsers } = await supabase
      .from('admin_users')
      .select('email, role')

    const { data: appInstallations } = await supabase
      .from('app_installations')
      .select('user_id')
      .eq('status', 'active')

    const _adminEmails = new Set(adminUsers?.map(a => a.email) || [])
    const activeUserIds = new Set(appInstallations?.map(i => i.user_id) || [])
    
    // Count users with multiple app installations
    const userInstallCounts = new Map()
    appInstallations?.forEach(install => {
      userInstallCounts.set(install.user_id, (userInstallCounts.get(install.user_id) || 0) + 1)
    })
    const multiProfileUsers = Array.from(userInstallCounts.values()).filter(count => count > 3).length

    return {
      admins: adminUsers?.length || 0,
      activeUsers: activeUserIds.size,
      totalUsers: totalUsers || 0,
      developers: 0, // We don't have a developers table in the current schema
      multiProfile: multiProfileUsers,
      regular: (totalUsers || 0) - (adminUsers?.length || 0)
    }
  },

  // Get app performance metrics
  async getAppMetrics() {
    const { data: apps } = await supabase
      .from('apps')
      .select(`
        id,
        name,
        category,
        app_installations (
          id,
          user_id,
          status
        ),
        reviews (
          rating
        )
      `)
      .eq('status', 'active')

    return apps?.map(app => ({
      ...app,
      installations: app.app_installations?.length || 0,
      averageRating: app.reviews?.length ? 
        app.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / app.reviews.length : 0
    })) || []
  },

  // Get revenue statistics
  async getRevenueStats(dateRange = '30days') {
    // Calculate date filter
    const now = new Date()
    let startDate = new Date()
    
    switch(dateRange) {
      case '7days':
        startDate.setDate(now.getDate() - 7)
        break
      case '30days':
        startDate.setDate(now.getDate() - 30)
        break
      case '90days':
        startDate.setDate(now.getDate() - 90)
        break
      case '12months':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        startDate = new Date('2024-01-01')
    }

    // Get all transactions
    const { data: allTransactions } = await supabase
      .from('transactions')
      .select('amount, type, created_at')
      .eq('status', 'completed')

    // Get current month transactions
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    
    const filteredTransactions = allTransactions?.filter(t => 
      new Date(t.created_at) >= startDate
    ) || []
    
    const currentMonthTransactions = allTransactions?.filter(t => 
      new Date(t.created_at) >= currentMonthStart
    ) || []
    
    const previousMonthTransactions = allTransactions?.filter(t => 
      new Date(t.created_at) >= previousMonthStart && 
      new Date(t.created_at) < currentMonthStart
    ) || []

    const totalRevenue = filteredTransactions
      .filter(t => t.type === 'credit')
      .reduce((sum, t) => sum + (t.amount || 0), 0)
    const currentMonthRevenue = currentMonthTransactions
      .filter(t => t.type === 'credit')
      .reduce((sum, t) => sum + (t.amount || 0), 0)
    const previousMonthRevenue = previousMonthTransactions
      .filter(t => t.type === 'credit')
      .reduce((sum, t) => sum + (t.amount || 0), 0)

    // Get most popular app
    const { data: topApp } = await supabase
      .from('apps')
      .select(`
        name,
        app_installations!inner(id)
      `)
      .eq('app_installations.status', 'active')
      .order('app_installations.id', { ascending: false })
      .limit(1)

    // Calculate platform share (30%) and developer share (70%)
    const developerPayouts = totalRevenue * 0.7
    const platformCommission = totalRevenue * 0.3

    return {
      totalRevenue,
      currentMonthRevenue,
      previousMonthRevenue,
      totalTransactions: filteredTransactions.length,
      averageTransactionValue: filteredTransactions.length > 0 ? totalRevenue / filteredTransactions.length : 0,
      topSellingApp: topApp?.[0]?.name || '',
      creditTransactions: filteredTransactions.filter(t => t.type === 'credit').length,
      debitTransactions: filteredTransactions.filter(t => t.type === 'debit').length,
      developerPayouts,
      platformCommission
    }
  },

  // Get transactions with filters
  async getTransactions(page = 1, pageSize = 20, filters: any = {}) {
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let query = supabase
      .from('transactions')
      .select(`
        *,
        users (
          full_name,
          email
        ),
        wallets (
          balance,
          currency
        )
      `, { count: 'exact' })

    // Apply status filter
    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status)
    }

    // Apply type filter
    if (filters.type && filters.type !== 'all') {
      query = query.eq('type', filters.type)
    }

    // Apply search filter
    if (filters.search) {
      query = query.or(`id.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    const { data: transactions, count } = await query
      .range(from, to)
      .order('created_at', { ascending: false })

    // Calculate developer share and platform share for each transaction
    if (transactions) {
      return {
        transactions: transactions.map(t => ({
          ...t,
          developer_share: t.amount * 0.7,
          platform_share: t.amount * 0.3,
          payment_method: 'Razorpay', // Default for now
          purchase_type: 'app_purchase', // Default for now
          apps: { name: 'Unknown App', slug: 'unknown' }, // Need to join with apps table
          app_modules: null
        })),
        total: count || 0
      }
    }

    return { transactions: [], total: count || 0 }
  },

  // Get app popularity metrics
  async getAppRevenues(_dateRange = '30days') {
    const { data: apps } = await supabase
      .from('apps')
      .select(`
        id,
        name,
        app_installations (
          user_id,
          created_at
        ),
        reviews (
          rating
        )
      `)
      .eq('status', 'active')

    if (!apps) return []

    // Since we don't have direct app-transaction relationships in the current schema,
    // we'll use installations as a proxy for revenue
    return apps.map(app => {
      const installations = app.app_installations?.length || 0
      const ratings = app.reviews?.map(r => r.rating) || []
      const averageRating = ratings.length > 0 ? 
        ratings.reduce((sum: number, rating: number) => sum + rating, 0) / ratings.length : 0

      // Simulate revenue based on installations (100 INR per installation)
      const estimatedRevenue = installations * 100

      return {
        app_id: app.id,
        app_name: app.name,
        total_revenue: estimatedRevenue,
        transaction_count: installations,
        avg_transaction_value: 100,
        total_installations: installations,
        average_rating: averageRating,
        total_reviews: ratings.length
      }
    }).sort((a, b) => b.total_revenue - a.total_revenue)
  }
}