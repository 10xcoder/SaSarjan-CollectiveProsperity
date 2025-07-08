"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
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

interface UserModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user?: {
    id: string
    email: string
    full_name: string
    location?: string | null
    age_group?: string | null
    profession?: string | null
    bio?: string | null
    wallet_balance?: number | null
  } // User to edit, undefined for create
  onSuccess: () => void
}

export function UserModal({
  open,
  onOpenChange,
  user,
  onSuccess
}: UserModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
    location: "",
    age_group: "",
    profession: "",
    bio: "",
    wallet_balance: "0"
  })

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || "",
        password: "",
        full_name: user.full_name || "",
        location: user.location ?? "",
        age_group: user.age_group ?? "",
        profession: user.profession ?? "",
        bio: user.bio ?? "",
        wallet_balance: user.wallet_balance?.toString() || "0"
      })
    } else {
      setFormData({
        email: "",
        password: "",
        full_name: "",
        location: "",
        age_group: "",
        profession: "",
        bio: "",
        wallet_balance: "0"
      })
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (user) {
        // Update existing user
        const { error } = await supabase
          .from('users')
          .update({
            full_name: formData.full_name,
            location: formData.location,
            age_group: formData.age_group,
            profession: formData.profession,
            bio: formData.bio
          })
          .eq('id', user.id)

        if (error) throw error

        // Update wallet balance if changed
        if (formData.wallet_balance !== user.wallet_balance?.toString()) {
          const { error: walletError } = await supabase
            .from('wallets')
            .update({ balance: parseFloat(formData.wallet_balance) })
            .eq('user_id', user.id)

          if (walletError) throw walletError
        }

        toast({
          title: "User updated",
          description: "User details have been updated successfully."
        })
      } else {
        // Create new user
        const response = await fetch('/api/users/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to create user')
        }

        toast({
          title: "User created",
          description: "New user has been created successfully."
        })
      }

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {user ? "Edit User" : "Create New User"}
            </DialogTitle>
            <DialogDescription>
              {user ? "Update user details below." : "Add a new user to the platform."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={(value) => setFormData({ ...formData, email: value })}
                required
                disabled={!!user} // Can't change email for existing users
              />
              <FormField
                label="Full Name"
                name="full_name"
                value={formData.full_name}
                onChange={(value) => setFormData({ ...formData, full_name: value })}
                required
              />
            </div>

            {!user && (
              <FormField
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={(value) => setFormData({ ...formData, password: value })}
                required
                placeholder="Enter a secure password"
                helperText="Password must be at least 6 characters"
              />
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Location"
                name="location"
                value={formData.location}
                onChange={(value) => setFormData({ ...formData, location: value })}
                placeholder="e.g., Mumbai, Delhi"
              />
              <div className="space-y-2">
                <Label htmlFor="age_group">Age Group</Label>
                <Select
                  value={formData.age_group}
                  onValueChange={(value) => setFormData({ ...formData, age_group: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select age group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="18-25">18-25</SelectItem>
                    <SelectItem value="26-35">26-35</SelectItem>
                    <SelectItem value="36-45">36-45</SelectItem>
                    <SelectItem value="46-55">46-55</SelectItem>
                    <SelectItem value="56+">56+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Profession"
                name="profession"
                value={formData.profession}
                onChange={(value) => setFormData({ ...formData, profession: value })}
                placeholder="e.g., Software Engineer, Teacher"
              />
              <FormField
                label="Wallet Balance (INR)"
                name="wallet_balance"
                type="number"
                value={formData.wallet_balance}
                onChange={(value) => setFormData({ ...formData, wallet_balance: value })}
                disabled={!user} // Only allow editing for existing users
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="A brief description about the user..."
                rows={3}
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
              {loading ? "Saving..." : user ? "Update User" : "Create User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}