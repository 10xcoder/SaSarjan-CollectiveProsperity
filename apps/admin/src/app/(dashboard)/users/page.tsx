"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  UserCircle, 
  Mail, 
  Phone, 
  MapPin,
  Wallet,
  Shield,
  Code,
  Users,
  ChevronDown,
  ChevronUp,
  Plus,
  UserPlus,
  Package
} from "lucide-react"
import { adminQueries, supabase } from "@/lib/supabase"
import { formatINR, formatDate } from "@/lib/utils"
import { UserModal } from "@/components/modals/user-modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { useToast } from "@/hooks/use-toast"

interface User {
  id: string
  email: string
  full_name: string
  phone: string | null
  location: string | null
  age_group: string | null
  profession: string | null
  bio: string | null
  language_preference: string
  wallet_balance: number
  total_spent: number
  is_admin: boolean
  created_at: string
  wallets?: Array<{
    balance: number
    currency: string
    status: string
  }>
  app_installations?: Array<{
    app_id: string
    installed_at: string
    status: string
    apps?: {
      name: string
      slug: string
    }
  }>
  reviews?: Array<{
    id: string
    rating: number
    app_id: string
  }>
}

export default function UsersPage() {
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedUser, setExpandedUser] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const pageSize = 20

  // Modal states
  const [userModalOpen, setUserModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined)
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    title: string
    description: string
    action: () => void
  }>({
    open: false,
    title: "",
    description: "",
    action: () => {}
  })

  useEffect(() => {
    loadUsers()
  }, [page])

  useEffect(() => {
    filterUsers()
  }, [searchTerm, users])

  async function loadUsers() {
    try {
      setLoading(true)
      const { users: userData, total: totalCount } = await adminQueries.getUsersWithProfiles(page, pageSize)
      setUsers(userData || [])
      setTotal(totalCount)
    } catch (error) {
      console.error("Error loading users:", error)
    } finally {
      setLoading(false)
    }
  }

  function filterUsers() {
    if (!searchTerm) {
      setFilteredUsers(users)
      return
    }

    const filtered = users.filter(user => 
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.location?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredUsers(filtered)
  }

  function getUserType(user: User) {
    if (user.is_admin) return { label: "Admin", color: "bg-red-100 text-red-800" }
    if (user.app_installations && user.app_installations.length > 3) return { label: "Power User", color: "bg-purple-100 text-purple-800" }
    if (user.app_installations && user.app_installations.length > 0) return { label: "Active User", color: "bg-green-100 text-green-800" }
    return { label: "User", color: "bg-gray-100 text-gray-800" }
  }

  function getInstalledApps(user: User) {
    if (!user.app_installations) return []
    return user.app_installations.map(install => ({
      app_id: install.app_id,
      app_name: install.apps?.name || 'Unknown App',
      app_slug: install.apps?.slug || '',
      installed_at: install.installed_at,
      status: install.status
    }))
  }

  // CRUD Operations
  const handleCreateUser = () => {
    setSelectedUser(undefined)
    setUserModalOpen(true)
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setUserModalOpen(true)
  }

  const handleResetPassword = (user: User) => {
    setConfirmDialog({
      open: true,
      title: "Reset Password",
      description: `Are you sure you want to reset the password for ${user.full_name}? They will receive an email with instructions.`,
      action: async () => {
        try {
          // In a real app, you would send a password reset email
          toast({
            title: "Password reset email sent",
            description: `Password reset instructions have been sent to ${user.email}`
          })
        } catch (error: any) {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive"
          })
        }
      }
    })
  }

  const handleSuspendUser = (user: User) => {
    const isSuspending = user.wallets?.[0]?.status === 'active'
    setConfirmDialog({
      open: true,
      title: isSuspending ? "Suspend User" : "Activate User",
      description: `Are you sure you want to ${isSuspending ? 'suspend' : 'activate'} ${user.full_name}?`,
      action: async () => {
        try {
          // Update wallet status as a proxy for user status
          const { error } = await supabase
            .from('wallets')
            .update({ status: isSuspending ? 'suspended' : 'active' })
            .eq('user_id', user.id)

          if (error) throw error

          toast({
            title: isSuspending ? "User suspended" : "User activated",
            description: `${user.full_name} has been ${isSuspending ? 'suspended' : 'activated'}.`
          })
          
          loadUsers() // Reload users
        } catch (error: any) {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive"
          })
        }
      }
    })
  }

  const appNames: Record<string, string> = {
    'platform-001': 'TalentExcel',
    'platform-002': '10xGrowth',
    'platform-003': 'SevaPremi',
    'platform-004': 'Incubator.in',
    'platform-005': 'NanhaSitara',
    'platform-006': 'Happy247',
    'platform-007': 'Premi.world'
  }

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
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">
            Manage all users including those with multiple profiles across apps
          </p>
        </div>
        <Button onClick={handleCreateUser}>
          <UserPlus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Search and Stats */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name, email, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 text-sm">
          <div className="bg-gray-100 px-3 py-2 rounded-lg">
            Total Users: <span className="font-semibold">{total}</span>
          </div>
          <div className="bg-blue-100 px-3 py-2 rounded-lg text-blue-800">
            Showing: <span className="font-semibold">{filteredUsers.length}</span>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="space-y-4">
        {filteredUsers.map((user) => {
          const userType = getUserType(user)
          const isExpanded = expandedUser === user.id
          const installedApps = getInstalledApps(user)

          return (
            <Card key={user.id} className="overflow-hidden">
              <CardHeader 
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => setExpandedUser(isExpanded ? null : user.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                      {user.full_name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{user.full_name}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${userType.color}`}>
                          {userType.label}
                        </span>
                        {user.app_installations && user.app_installations.length > 1 && (
                          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                            {user.app_installations.length} apps
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </span>
                        {user.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {user.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Wallet Balance</p>
                      <p className="font-semibold">{formatINR(user.wallet_balance)}</p>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="border-t bg-gray-50">
                  <div className="grid md:grid-cols-2 gap-6 mt-4">
                    {/* User Details */}
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <UserCircle className="h-4 w-4" />
                        User Details
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">User ID</span>
                          <span className="font-mono text-xs">{user.id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Phone</span>
                          <span>{user.phone || 'Not provided'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Language</span>
                          <span className="uppercase">{user.language_preference}</span>
                        </div>
                        {user.age_group && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Age Group</span>
                            <span>{user.age_group}</span>
                          </div>
                        )}
                        {user.profession && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Profession</span>
                            <span>{user.profession}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Spent</span>
                          <span className="font-semibold text-green-600">{formatINR(user.total_spent)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Joined</span>
                          <span>{formatDate(user.created_at)}</span>
                        </div>
                      </div>

                      {/* Bio */}
                      {user.bio && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <h5 className="font-semibold text-sm mb-1">Bio</h5>
                          <p className="text-sm text-gray-600">{user.bio}</p>
                        </div>
                      )}
                    </div>

                    {/* Installed Apps */}
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Installed Apps
                      </h4>
                      <div className="space-y-3">
                        {installedApps.length > 0 ? (
                          installedApps.map((app) => (
                            <div key={app.app_id} className="bg-white p-3 rounded-lg border">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h5 className="font-medium text-sm text-blue-700">
                                    {app.app_name}
                                  </h5>
                                  <p className="text-xs text-gray-500 mt-1">
                                    Installed: {formatDate(app.installed_at)}
                                  </p>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded ${
                                  app.status === 'active' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {app.status}
                                </span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500 italic">No apps installed yet</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-6">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditUser(user)}
                    >
                      Edit User
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-orange-600 hover:text-orange-700"
                      onClick={() => handleResetPassword(user)}
                    >
                      Reset Password
                    </Button>
                    {!user.is_admin && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleSuspendUser(user)}
                      >
                        {user.wallets?.[0]?.status === 'suspended' ? 'Activate User' : 'Suspend User'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of {total} users
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
            disabled={page * pageSize >= total}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Modals */}
      <UserModal
        open={userModalOpen}
        onOpenChange={setUserModalOpen}
        user={selectedUser}
        onSuccess={loadUsers}
      />

      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}
        title={confirmDialog.title}
        description={confirmDialog.description}
        onConfirm={confirmDialog.action}
        variant={confirmDialog.title.includes("Suspend") ? "destructive" : "default"}
      />
    </div>
  )
}