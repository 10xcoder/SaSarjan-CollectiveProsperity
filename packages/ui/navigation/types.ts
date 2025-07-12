import { LucideIcon } from 'lucide-react'

export interface NavItem {
  label: string
  href?: string
  icon?: LucideIcon
  badge?: string | number
  children?: NavItem[]
  columns?: number  // For multi-column dropdowns
  featured?: boolean
  description?: string  // Optional description for menu items
  disabled?: boolean
  external?: boolean  // Opens in new tab
}

export interface NavBrand {
  name: string
  logo?: LucideIcon | React.ComponentType
  logoSrc?: string  // Alternative: image URL
  href: string
  tagline?: string
}

export interface NavUser {
  name?: string
  email?: string
  avatar?: string
  initials?: string
}

export interface NavConfig {
  brand: NavBrand
  items: NavItem[]
  actions?: React.ReactNode  // Custom right-side actions
  sticky?: boolean
  transparent?: boolean  // For transparent navbar on hero sections
  className?: string
}

export interface NavbarProps {
  config: NavConfig
  user?: NavUser | null
  onSignIn?: () => void
  onSignOut?: () => void
  showSearch?: boolean
  showNotifications?: boolean
  notificationCount?: number
}