'use client'

import * as React from 'react'
import { cn } from '@/lib/nav-utils'
import { NavItem } from '../types'
import { NavbarDropdown } from './NavbarDropdown'
import { ChevronDown, ExternalLink } from 'lucide-react'

interface NavbarMenuItemProps {
  item: NavItem
  className?: string
}

export const NavbarMenuItem: React.FC<NavbarMenuItemProps> = ({ item, className }) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const hasChildren = item.children && item.children.length > 0
  const Icon = item.icon

  const itemClasses = cn(
    'flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors',
    'hover:bg-accent hover:text-accent-foreground',
    'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
    item.disabled && 'cursor-not-allowed opacity-50',
    className
  )

  const content = (
    <>
      {Icon && <Icon className="h-4 w-4" />}
      <span>{item.label}</span>
      {item.badge && (
        <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
          {item.badge}
        </span>
      )}
      {hasChildren && <ChevronDown className="h-3 w-3 ml-1" />}
      {item.external && <ExternalLink className="h-3 w-3 ml-1" />}
    </>
  )

  if (hasChildren) {
    return (
      <div className="relative">
        <button
          className={itemClasses}
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-haspopup="menu"
          disabled={item.disabled}
        >
          {content}
        </button>
        <NavbarDropdown
          items={item.children || []}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          columns={item.columns}
        />
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
        aria-disabled={item.disabled}
      >
        {content}
      </a>
    )
  }

  return (
    <button
      className={itemClasses}
      disabled={item.disabled}
    >
      {content}
    </button>
  )
}