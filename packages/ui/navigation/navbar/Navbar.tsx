'use client'

import * as React from 'react'
import { cn } from '../../utils'
import { NavbarProps } from '../types'
import { NavbarBrand } from './NavbarBrand'
import { NavbarMenu } from './NavbarMenu'
import { NavbarUser } from './NavbarUser'
import { NavbarMobile } from './NavbarMobile'
import { Menu, X, Search, Bell } from 'lucide-react'

export const Navbar = React.forwardRef<HTMLElement, NavbarProps>(
  ({ 
    config, 
    user, 
    onSignIn, 
    onSignOut, 
    showSearch = false, 
    showNotifications = false,
    notificationCount = 0 
  }, ref) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

    const navbarClasses = cn(
      'relative z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
      config.sticky && 'sticky top-0',
      config.transparent && 'border-transparent bg-transparent',
      config.className
    )

    return (
      <nav ref={ref} className={navbarClasses}>
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Brand */}
            <NavbarBrand brand={config.brand} />

            {/* Desktop Menu */}
            <div className="hidden md:flex md:flex-1 md:items-center md:justify-center">
              <NavbarMenu items={config.items} />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              {/* Search */}
              {showSearch && (
                <button
                  className="hidden md:flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground"
                  aria-label="Search"
                >
                  <Search className="h-4 w-4" />
                </button>
              )}

              {/* Notifications */}
              {showNotifications && user && (
                <button
                  className="hidden md:flex relative h-9 w-9 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground"
                  aria-label="Notifications"
                >
                  <Bell className="h-4 w-4" />
                  {notificationCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </span>
                  )}
                </button>
              )}

              {/* Custom Actions */}
              {config.actions && (
                <div className="hidden md:flex items-center gap-2">
                  {config.actions}
                </div>
              )}

              {/* User Menu */}
              <NavbarUser 
                user={user} 
                onSignIn={onSignIn} 
                onSignOut={onSignOut} 
              />

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="flex md:hidden h-9 w-9 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground"
                aria-label="Toggle menu"
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <NavbarMobile
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          items={config.items}
          showSearch={showSearch}
          showNotifications={showNotifications}
          notificationCount={notificationCount}
          user={user}
        />
      </nav>
    )
  }
)

Navbar.displayName = 'Navbar'