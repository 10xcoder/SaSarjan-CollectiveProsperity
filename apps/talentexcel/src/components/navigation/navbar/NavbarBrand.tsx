'use client'

import * as React from 'react'
import { cn } from '@/lib/nav-utils'
import { NavBrand } from '../types'

interface NavbarBrandProps {
  brand: NavBrand
  className?: string
}

export const NavbarBrand: React.FC<NavbarBrandProps> = ({ brand, className }) => {
  const Logo = brand.logo

  return (
    <a
      href={brand.href}
      className={cn(
        'flex items-center gap-2 font-semibold text-lg hover:opacity-90 transition-opacity',
        className
      )}
    >
      {/* Logo */}
      {Logo && (
        <div className="flex items-center">
          {typeof Logo === 'function' ? (
            <Logo className="h-8 w-8" />
          ) : brand.logoSrc ? (
            <img 
              src={brand.logoSrc} 
              alt={brand.name} 
              className="h-8 w-8 object-contain"
            />
          ) : null}
        </div>
      )}

      {/* Brand Name */}
      <div className="flex flex-col">
        <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          {brand.name}
        </span>
        {brand.tagline && (
          <span className="text-xs text-muted-foreground -mt-1">
            {brand.tagline}
          </span>
        )}
      </div>
    </a>
  )
}