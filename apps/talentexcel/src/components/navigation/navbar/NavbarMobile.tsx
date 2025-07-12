'use client'

import * as React from 'react'
import { cn } from '@/lib/nav-utils'
import { NavItem, NavUser } from '../types'
import { 
  ChevronDown, 
  ChevronRight, 
  ExternalLink, 
  Search, 
  Bell 
} from 'lucide-react'

interface NavbarMobileProps {
  isOpen: boolean
  onClose: () => void
  items: NavItem[]
  showSearch?: boolean
  showNotifications?: boolean
  notificationCount?: number
  user?: NavUser | null
  className?: string
}

export const NavbarMobile: React.FC<NavbarMobileProps> = ({
  isOpen,
  onClose,
  items,
  showSearch,
  showNotifications,
  notificationCount = 0,
  user,
  className
}) => {
  const [expandedItems, setExpandedItems] = React.useState<string[]>([])

  const toggleExpanded = (label: string) => {
    setExpandedItems(prev =>
      prev.includes(label)
        ? prev.filter(item => item !== label)
        : [...prev, label]
    )
  }

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Mobile Menu */}
      <div
        className={cn(
          'fixed inset-x-0 top-16 z-50 h-[calc(100vh-4rem)] bg-background border-t md:hidden',
          'animate-in slide-in-from-top-2 duration-300',
          className
        )}
      >
        <div className="h-full overflow-y-auto">
          <nav className="flex flex-col p-4 space-y-1">
            {/* Search and Notifications */}
            {(showSearch || (showNotifications && user)) && (
              <div className="flex items-center gap-2 pb-4 border-b mb-4">
                {showSearch && (
                  <button
                    className="flex-1 flex items-center gap-2 px-3 py-2 text-sm rounded-md bg-accent/50 hover:bg-accent"
                    onClick={onClose}
                  >
                    <Search className="h-4 w-4" />
                    Search
                  </button>
                )}
                {showNotifications && user && (
                  <button
                    className="relative flex items-center justify-center h-10 w-10 rounded-md hover:bg-accent"
                    onClick={onClose}
                  >
                    <Bell className="h-4 w-4" />
                    {notificationCount > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                        {notificationCount > 9 ? '9+' : notificationCount}
                      </span>
                    )}
                  </button>
                )}
              </div>
            )}

            {/* Navigation Items */}
            {items.map((item, index) => (
              <MobileNavItem
                key={`${item.label}-${index}`}
                item={item}
                isExpanded={expandedItems.includes(item.label)}
                onToggle={() => toggleExpanded(item.label)}
                onClose={onClose}
                level={0}
              />
            ))}
          </nav>
        </div>
      </div>
    </>
  )
}

interface MobileNavItemProps {
  item: NavItem
  isExpanded: boolean
  onToggle: () => void
  onClose: () => void
  level: number
}

const MobileNavItem: React.FC<MobileNavItemProps> = ({
  item,
  isExpanded,
  onToggle,
  onClose,
  level
}) => {
  const hasChildren = item.children && item.children.length > 0
  const Icon = item.icon

  const itemClasses = cn(
    'flex items-center justify-between w-full px-3 py-2 text-sm rounded-md transition-colors',
    'hover:bg-accent hover:text-accent-foreground',
    'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
    item.featured && 'bg-accent/5',
    item.disabled && 'cursor-not-allowed opacity-50',
    level > 0 && 'ml-4'
  )

  const content = (
    <div className="flex items-center gap-3">
      {Icon && <Icon className="h-4 w-4" />}
      <span className={cn(item.featured && 'font-medium text-primary')}>
        {item.label}
      </span>
      {item.badge && (
        <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
          {item.badge}
        </span>
      )}
      {item.external && <ExternalLink className="h-3 w-3 ml-auto" />}
    </div>
  )

  if (hasChildren) {
    return (
      <div>
        <button
          className={itemClasses}
          onClick={onToggle}
          disabled={item.disabled}
        >
          {content}
          <ChevronDown
            className={cn(
              'h-4 w-4 transition-transform',
              isExpanded && 'rotate-180'
            )}
          />
        </button>
        {isExpanded && (
          <div className="mt-1 space-y-1">
            {item.children?.map((child, index) => (
              <MobileNavItem
                key={`${child.label}-${index}`}
                item={child}
                isExpanded={false}
                onToggle={() => {}}
                onClose={onClose}
                level={level + 1}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  if (item.href) {
    if (item.external) {
      return (
        <a
          href={item.href}
          className={itemClasses}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClose}
          aria-disabled={item.disabled}
        >
          {content}
        </a>
      )
    }

    return (
      <a
        href={item.href}
        className={itemClasses}
        onClick={onClose}
        aria-disabled={item.disabled}
      >
        {content}
      </a>
    )
  }

  return (
    <button
      className={itemClasses}
      onClick={onClose}
      disabled={item.disabled}
    >
      {content}
    </button>
  )
}