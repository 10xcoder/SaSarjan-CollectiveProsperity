"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  Package,
  Star,
  Download,
  IndianRupee,
  Users,
  Puzzle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Calendar,
  Plus,
  PackagePlus
} from "lucide-react"
import { adminQueries, supabase } from "@/lib/supabase"
import { formatINR, formatIndianNumber, formatDate } from "@/lib/utils"
import { AppModal } from "@/components/modals/app-modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { useToast } from "@/hooks/use-toast"

interface MicroApp {
  id: string
  name: string
  description: string | null
  category: string | null
}

interface App {
  id: string
  name: string
  slug: string
  tagline: string | null
  description: string | null
  icon_url: string | null
  banner_url: string | null
  category: string | null
  pricing_type: string
  price: number
  status: string
  downloads: number
  rating: number
  total_reviews: number
  created_at: string
  updated_at: string
  micro_apps?: MicroApp[]
  app_installations?: Array<{
    id: string
    user_id: string
    installed_at: string
    status: string
  }>
  reviews?: Array<{
    id: string
    rating: number
    comment: string | null
    user_id: string
  }>
  app_tags?: Array<{
    tag_id: string
    tags?: {
      name: string
      color: string
    }
  }>
}

const categoryColors: Record<string, string> = {
  personal_transformation: "bg-purple-100 text-purple-800",
  organizational_excellence: "bg-blue-100 text-blue-800",
  community_resilience: "bg-green-100 text-green-800",
  ecological_regeneration: "bg-emerald-100 text-emerald-800",
  economic_empowerment: "bg-orange-100 text-orange-800",
  knowledge_commons: "bg-indigo-100 text-indigo-800",
  social_innovation: "bg-pink-100 text-pink-800",
  cultural_expression: "bg-red-100 text-red-800"
}

const categoryNames: Record<string, string> = {
  personal_transformation: "Personal Transformation",
  organizational_excellence: "Organizational Excellence",
  community_resilience: "Community Resilience",
  ecological_regeneration: "Ecological Regeneration",
  economic_empowerment: "Economic Empowerment",
  knowledge_commons: "Knowledge Commons",
  social_innovation: "Social Innovation",
  cultural_expression: "Cultural Expression"
}

export default function AppsPage() {
  const { toast } = useToast()
  const [apps, setApps] = useState<App[]>([])
  const [filteredApps, setFilteredApps] = useState<App[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedApp, setExpandedApp] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const pageSize = 10

  // Modal states
  const [appModalOpen, setAppModalOpen] = useState(false)
  const [selectedApp, setSelectedApp] = useState<App | undefined>(undefined)
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
    loadApps()
  }, [page])

  useEffect(() => {
    filterApps()
  }, [searchTerm, apps])

  async function loadApps() {
    try {
      setLoading(true)
      const { apps: appData, total: totalCount } = await adminQueries.getAppsWithDetails(page, pageSize)
      setApps(appData || [])
      setTotal(totalCount)
    } catch (error) {
      console.error("Error loading apps:", error)
    } finally {
      setLoading(false)
    }
  }

  function filterApps() {
    if (!searchTerm) {
      setFilteredApps(apps)
      return
    }

    const filtered = apps.filter(app => 
      app.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.tagline?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.category?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredApps(filtered)
  }

  function getPricingLabel(app: App) {
    switch (app.pricing_type) {
      case 'free':
        return { label: 'Free', color: 'text-green-600' }
      case 'paid':
        return { label: formatINR(app.price), color: 'text-blue-600' }
      case 'freemium':
        return { label: 'Freemium', color: 'text-purple-600' }
      case 'subscription':
        return { label: `${formatINR(app.price)}/mo`, color: 'text-orange-600' }
      default:
        return { label: 'Free', color: 'text-gray-600' }
    }
  }

  // CRUD Operations
  const handleCreateApp = () => {
    setSelectedApp(undefined)
    setAppModalOpen(true)
  }

  const handleEditApp = (app: App) => {
    setSelectedApp(app)
    setAppModalOpen(true)
  }

  const handleViewApp = (app: App) => {
    // In a real app, this would navigate to the app's page
    window.open(`/${app.slug}`, '_blank')
  }

  const handleSuspendApp = (app: App) => {
    const isSuspending = app.status === 'active'
    setConfirmDialog({
      open: true,
      title: isSuspending ? "Suspend App" : "Activate App",
      description: `Are you sure you want to ${isSuspending ? 'suspend' : 'activate'} ${app.name}? ${isSuspending ? 'Users will not be able to access this app.' : ''}`,
      action: async () => {
        try {
          const { error } = await supabase
            .from('apps')
            .update({ status: isSuspending ? 'suspended' : 'active' })
            .eq('id', app.id)

          if (error) throw error

          toast({
            title: isSuspending ? "App suspended" : "App activated",
            description: `${app.name} has been ${isSuspending ? 'suspended' : 'activated'}.`
          })
          
          loadApps() // Reload apps
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

  const handleManageModules = (app: App) => {
    // This would open a modules management interface
    toast({
      title: "Coming soon",
      description: "Micro-app management will be available in the next update."
    })
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
          <h1 className="text-3xl font-bold text-gray-900">App Management</h1>
          <p className="text-gray-600 mt-1">
            Manage all platform apps and their micro-apps
          </p>
        </div>
        <Button onClick={handleCreateApp}>
          <PackagePlus className="h-4 w-4 mr-2" />
          Create App
        </Button>
      </div>

      {/* Search and Stats */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by app name, tagline, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 text-sm">
          <div className="bg-gray-100 px-3 py-2 rounded-lg">
            Total Apps: <span className="font-semibold">{total}</span>
          </div>
          <div className="bg-blue-100 px-3 py-2 rounded-lg text-blue-800">
            Showing: <span className="font-semibold">{filteredApps.length}</span>
          </div>
        </div>
      </div>

      {/* Apps List */}
      <div className="space-y-4">
        {filteredApps.map((app) => {
          const isExpanded = expandedApp === app.id
          const pricing = getPricingLabel(app)

          return (
            <Card key={app.id} className="overflow-hidden">
              <CardHeader 
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => setExpandedApp(isExpanded ? null : app.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white">
                      <Package className="h-8 w-8" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-lg">{app.name}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${app.category && categoryColors[app.category] || 'bg-gray-100 text-gray-800'}`}>
                          {app.category && categoryNames[app.category] || app.category || 'Uncategorized'}
                        </span>
                        <span className={`text-sm font-semibold ${pricing.color}`}>
                          {pricing.label}
                        </span>
                        {app.micro_apps && app.micro_apps.length > 0 && (
                          <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
                            {app.micro_apps.length} micro-apps
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{app.tagline}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500" />
                          {app.rating?.toFixed(1) || '0.0'} ({formatIndianNumber(app.total_reviews)} reviews)
                        </span>
                        <span className="flex items-center gap-1">
                          <Download className="h-3 w-3" />
                          {formatIndianNumber(app.downloads)} downloads
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(app.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-3 py-1 rounded-full ${
                      app.status === 'approved' ? 'bg-green-100 text-green-800' :
                      app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      app.status === 'suspended' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {app.status}
                    </span>
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
                  <div className="mt-4 space-y-4">
                    {/* Description */}
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Description</h4>
                      <p className="text-sm text-gray-600">{app.description}</p>
                    </div>

                    {/* Micro-Apps */}
                    {app.micro_apps && app.micro_apps.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                          <Puzzle className="h-4 w-4" />
                          Micro-Apps ({app.micro_apps.length})
                        </h4>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {app.micro_apps.map((microApp) => (
                            <div key={microApp.id} className="bg-white p-3 rounded-lg border">
                              <p className="font-medium text-sm">{microApp.name}</p>
                              {microApp.description && (
                                <p className="text-xs text-gray-600 mt-1 line-clamp-2">{microApp.description}</p>
                              )}
                              {microApp.category && (
                                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded mt-2 inline-block">
                                  {microApp.category}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tags */}
                    {app.app_tags && app.app_tags.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Tags</h4>
                        <div className="flex flex-wrap gap-2">
                          {app.app_tags.map((appTag) => (
                            appTag.tags && (
                              <span 
                                key={appTag.tag_id} 
                                className="text-xs px-2 py-1 rounded-full"
                                style={{ 
                                  backgroundColor: appTag.tags.color ? `${appTag.tags.color}20` : '#3B82F620',
                                  color: appTag.tags.color || '#3B82F6'
                                }}
                              >
                                {appTag.tags.name}
                              </span>
                            )
                          ))}
                        </div>
                      </div>
                    )}

                    {/* App Details */}
                    <div className="grid sm:grid-cols-3 gap-4 text-sm">
                      <div className="bg-white p-3 rounded-lg border">
                        <p className="text-gray-600">App ID</p>
                        <p className="font-mono text-xs mt-1">{app.id}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg border">
                        <p className="text-gray-600">Slug</p>
                        <p className="font-medium mt-1">{app.slug}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg border">
                        <p className="text-gray-600">Updated</p>
                        <p className="font-medium mt-1">{formatDate(app.updated_at)}</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewApp(app)}
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        View Live
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditApp(app)}
                      >
                        Edit App
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleManageModules(app)}
                      >
                        Manage Modules
                      </Button>
                      {app.status === 'active' && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-orange-600 hover:text-orange-700"
                          onClick={() => handleSuspendApp(app)}
                        >
                          Suspend App
                        </Button>
                      )}
                      {app.status === 'suspended' && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-green-600 hover:text-green-700"
                          onClick={() => handleSuspendApp(app)}
                        >
                          Activate App
                        </Button>
                      )}
                    </div>
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
          Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of {total} apps
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
      <AppModal
        open={appModalOpen}
        onOpenChange={setAppModalOpen}
        app={selectedApp}
        onSuccess={loadApps}
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