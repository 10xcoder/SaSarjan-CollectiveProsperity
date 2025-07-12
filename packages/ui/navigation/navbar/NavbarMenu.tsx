'use client'

import * as React from 'react'
import { cn } from '../../utils'
import { NavItem } from '../types'
import { NavbarMenuItem } from './NavbarMenuItem'

interface NavbarMenuProps {
  items: NavItem[]
  className?: string
}

export const NavbarMenu: React.FC<NavbarMenuProps> = ({ items, className }) => {
  return (
    <nav
      className={cn('flex items-center space-x-1', className)}
      role="navigation"
      aria-label="Main navigation"
    >
      {items.map((item, index) => (
        <NavbarMenuItem key={`${item.label}-${index}`} item={item} />
      ))}
    </nav>
  )
}