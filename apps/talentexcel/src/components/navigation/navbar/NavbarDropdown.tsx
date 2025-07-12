'use client'

import * as React from 'react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { cn } from '@/lib/nav-utils'
import { NavItem } from '../types'
import { ExternalLink } from 'lucide-react'

interface NavbarDropdownProps {
  items: NavItem[]
  isOpen: boolean
  onClose: () => void
  columns?: number
}

export const NavbarDropdown: React.FC<NavbarDropdownProps> = ({
  items,
  isOpen,
  onClose,
  columns = 1
}) => {
  const getGridClass = () => {
    switch(columns) {
      case 2: return 'grid-cols-2'
      case 3: return 'grid-cols-3'
      case 4: return 'grid-cols-4'
      default: return 'grid-cols-1'
    }
  }

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('[data-navbar-dropdown]')) {
        onClose()
      }
    }

    if (isOpen) {
      setTimeout(() => {
        document.addEventListener('click', handleClickOutside)
      }, 0)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      data-navbar-dropdown
      className={cn(
        'absolute left-0 mt-2 min-w-[200px] rounded-md border bg-background p-2 shadow-lg',
        'animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
        columns === 2 && 'min-w-[500px]',
        columns === 3 && 'min-w-[750px]',
        columns >= 4 && 'min-w-[900px]'
      )}
    >
      <div className={cn('grid gap-1', columns > 1 && getGridClass())}>
        {items.map((item, index) => (
          <DropdownMenuItem
            key={`${item.label}-${index}`}
            item={item}
            onClose={onClose}
          />
        ))}
      </div>
    </div>
  )
}

interface DropdownMenuItemProps {
  item: NavItem
  onClose: () => void
}

const DropdownMenuItem: React.FC<DropdownMenuItemProps> = ({ item, onClose }) => {
  const Icon = item.icon

  const itemClasses = cn(
    'flex items-start gap-3 rounded-md px-3 py-2 text-sm transition-colors',
    'hover:bg-accent hover:text-accent-foreground',
    'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
    item.featured && 'bg-accent/5',
    item.disabled && 'cursor-not-allowed opacity-50'
  )

  const content = (
    <div className="flex flex-1 items-start gap-3">
      {Icon && (
        <Icon className={cn(
          'h-4 w-4 mt-0.5',
          item.featured && 'text-primary'
        )} />
      )}
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className={cn(
            'font-medium',
            item.featured && 'text-primary'
          )}>
            {item.label}
          </span>
          {item.badge && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {item.badge}
            </span>
          )}
          {item.external && <ExternalLink className="h-3 w-3" />}
        </div>
        {item.description && (
          <p className="mt-1 text-xs text-muted-foreground">
            {item.description}
          </p>
        )}
      </div>
    </div>
  )

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
      className={cn(itemClasses, 'w-full text-left')}
      onClick={onClose}
      disabled={item.disabled}
    >
      {content}
    </button>
  )
}