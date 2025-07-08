"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FormField } from "@/components/ui/form-field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

interface AppModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  app?: any // App to edit, undefined for create
  onSuccess: () => void
}

const categories = [
  { value: "personal_transformation", label: "Personal Transformation" },
  { value: "organizational_excellence", label: "Organizational Excellence" },
  { value: "community_resilience", label: "Community Resilience" },
  { value: "ecological_regeneration", label: "Ecological Regeneration" },
  { value: "economic_empowerment", label: "Economic Empowerment" },
  { value: "knowledge_commons", label: "Knowledge Commons" },
  { value: "social_innovation", label: "Social Innovation" },
  { value: "cultural_expression", label: "Cultural Expression" }
]

export function AppModal({
  open,
  onOpenChange,
  app,
  onSuccess
}: AppModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    tagline: "",
    description: "",
    category: "",
    status: "active",
    icon_url: "",
    banner_url: ""
  })

  useEffect(() => {
    if (app) {
      setFormData({
        name: app.name || "",
        slug: app.slug || "",
        tagline: app.tagline || "",
        description: app.description || "",
        category: app.category || "",
        status: app.status || "active",
        icon_url: app.icon_url || "",
        banner_url: app.banner_url || ""
      })
    } else {
      setFormData({
        name: "",
        slug: "",
        tagline: "",
        description: "",
        category: "",
        status: "active",
        icon_url: "",
        banner_url: ""
      })
    }
  }, [app])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (app) {
        // Update existing app
        const { error } = await supabase
          .from('apps')
          .update({
            name: formData.name,
            slug: formData.slug,
            tagline: formData.tagline,
            description: formData.description,
            category: formData.category,
            status: formData.status,
            icon_url: formData.icon_url || null,
            banner_url: formData.banner_url || null
          })
          .eq('id', app.id)

        if (error) throw error

        toast({
          title: "App updated",
          description: "App details have been updated successfully."
        })
      } else {
        // Create new app
        const { error } = await supabase
          .from('apps')
          .insert({
            name: formData.name,
            slug: formData.slug,
            tagline: formData.tagline,
            description: formData.description,
            category: formData.category,
            status: formData.status,
            icon_url: formData.icon_url || null,
            banner_url: formData.banner_url || null
          })

        if (error) throw error

        toast({
          title: "App created",
          description: "New app has been created successfully."
        })
      }

      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {app ? "Edit App" : "Create New App"}
            </DialogTitle>
            <DialogDescription>
              {app ? "Update app details below." : "Add a new app to the platform."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="App Name"
                name="name"
                value={formData.name}
                onChange={(value) => {
                  setFormData({ ...formData, name: value })
                  if (!app) {
                    setFormData(prev => ({ ...prev, slug: generateSlug(value) }))
                  }
                }}
                required
                placeholder="e.g., TalentExcel"
              />
              <FormField
                label="Slug"
                name="slug"
                value={formData.slug}
                onChange={(value) => setFormData({ ...formData, slug: value })}
                required
                placeholder="e.g., talentexcel"
              />
            </div>

            <FormField
              label="Tagline"
              name="tagline"
              value={formData.tagline}
              onChange={(value) => setFormData({ ...formData, tagline: value })}
              placeholder="A short description of the app"
              required
            />

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detailed description of the app..."
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category <span className="text-red-500">*</span></Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Icon URL"
                name="icon_url"
                value={formData.icon_url}
                onChange={(value) => setFormData({ ...formData, icon_url: value })}
                placeholder="https://example.com/icon.png"
              />
              <FormField
                label="Banner URL"
                name="banner_url"
                value={formData.banner_url}
                onChange={(value) => setFormData({ ...formData, banner_url: value })}
                placeholder="https://example.com/banner.jpg"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : app ? "Update App" : "Create App"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}