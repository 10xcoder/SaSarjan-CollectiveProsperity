'use client'

import * as React from 'react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { cn } from '../../utils'
import { NavUser } from '../types'
import { 
  User, 
  LogIn, 
  LogOut, 
  Settings, 
  UserCircle, 
  Bell, 
  Moon, 
  Sun,
  Monitor,
  ChevronDown
} from 'lucide-react'

interface NavbarUserProps {
  user?: NavUser | null
  onSignIn?: () => void
  onSignOut?: () => void
  className?: string
}

export const NavbarUser: React.FC<NavbarUserProps> = ({ 
  user, 
  onSignIn, 
  onSignOut,
  className 
}) => {
  const [theme, setTheme] = React.useState<'light' | 'dark' | 'system'>('system')

  const getInitials = (name?: string) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (!user) {
    return (
      <button
        onClick={onSignIn}
        className={cn(
          'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md',
          'bg-primary text-primary-foreground hover:bg-primary/90',
          'transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
          className
        )}
      >
        <LogIn className="h-4 w-4" />
        <span className="hidden sm:inline">Sign In</span>
      </button>
    )
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className={cn(
            'flex items-center gap-2 rounded-md px-2 py-1.5',
            'hover:bg-accent hover:text-accent-foreground',
            'transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
            className
          )}
          aria-label="User menu"
        >
          {/* Avatar */}
          <div className="relative h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            {user.avatar ? (
              <img 
                src={user.avatar} 
                alt={user.name || 'User'} 
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <span className="text-sm font-medium text-primary">
                {getInitials(user.name)}
              </span>
            )}
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className={cn(
            'z-50 min-w-[220px] rounded-md border bg-background p-1 shadow-lg',
            'animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95'
          )}
          sideOffset={5}
          align="end"
        >
          {/* User Info */}
          <div className="px-3 py-2 border-b mb-1">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                {user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.name || 'User'} 
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-medium text-primary">
                    {getInitials(user.name)}
                  </span>
                )}
              </div>
              <div className="flex flex-col">
                {user.name && (
                  <span className="text-sm font-medium">{user.name}</span>
                )}
                {user.email && (
                  <span className="text-xs text-muted-foreground">{user.email}</span>
                )}
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <DropdownMenu.Item
            className={cn(
              'flex items-center gap-3 rounded-sm px-3 py-2 text-sm outline-none',
              'hover:bg-accent hover:text-accent-foreground cursor-pointer'
            )}
          >
            <UserCircle className="h-4 w-4" />
            Profile
          </DropdownMenu.Item>

          <DropdownMenu.Item
            className={cn(
              'flex items-center gap-3 rounded-sm px-3 py-2 text-sm outline-none',
              'hover:bg-accent hover:text-accent-foreground cursor-pointer'
            )}
          >
            <Settings className="h-4 w-4" />
            Settings
          </DropdownMenu.Item>

          <DropdownMenu.Item
            className={cn(
              'flex items-center gap-3 rounded-sm px-3 py-2 text-sm outline-none',
              'hover:bg-accent hover:text-accent-foreground cursor-pointer'
            )}
          >
            <Bell className="h-4 w-4" />
            Notifications
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="my-1 h-px bg-border" />

          {/* Theme Submenu */}
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger
              className={cn(
                'flex items-center gap-3 rounded-sm px-3 py-2 text-sm outline-none',
                'hover:bg-accent hover:text-accent-foreground cursor-pointer'
              )}
            >
              {theme === 'light' ? (
                <Sun className="h-4 w-4" />
              ) : theme === 'dark' ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Monitor className="h-4 w-4" />
              )}
              Theme
            </DropdownMenu.SubTrigger>
            <DropdownMenu.Portal>
              <DropdownMenu.SubContent
                className={cn(
                  'z-50 min-w-[150px] rounded-md border bg-background p-1 shadow-lg',
                  'animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95'
                )}
                sideOffset={2}
                alignOffset={-5}
              >
                <DropdownMenu.Item
                  onClick={() => setTheme('light')}
                  className={cn(
                    'flex items-center gap-3 rounded-sm px-3 py-2 text-sm outline-none',
                    'hover:bg-accent hover:text-accent-foreground cursor-pointer',
                    theme === 'light' && 'bg-accent text-accent-foreground'
                  )}
                >
                  <Sun className="h-4 w-4" />
                  Light
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onClick={() => setTheme('dark')}
                  className={cn(
                    'flex items-center gap-3 rounded-sm px-3 py-2 text-sm outline-none',
                    'hover:bg-accent hover:text-accent-foreground cursor-pointer',
                    theme === 'dark' && 'bg-accent text-accent-foreground'
                  )}
                >
                  <Moon className="h-4 w-4" />
                  Dark
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onClick={() => setTheme('system')}
                  className={cn(
                    'flex items-center gap-3 rounded-sm px-3 py-2 text-sm outline-none',
                    'hover:bg-accent hover:text-accent-foreground cursor-pointer',
                    theme === 'system' && 'bg-accent text-accent-foreground'
                  )}
                >
                  <Monitor className="h-4 w-4" />
                  System
                </DropdownMenu.Item>
              </DropdownMenu.SubContent>
            </DropdownMenu.Portal>
          </DropdownMenu.Sub>

          <DropdownMenu.Separator className="my-1 h-px bg-border" />

          {/* Sign Out */}
          <DropdownMenu.Item
            onClick={onSignOut}
            className={cn(
              'flex items-center gap-3 rounded-sm px-3 py-2 text-sm outline-none',
              'hover:bg-accent hover:text-accent-foreground cursor-pointer',
              'text-destructive hover:text-destructive'
            )}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}