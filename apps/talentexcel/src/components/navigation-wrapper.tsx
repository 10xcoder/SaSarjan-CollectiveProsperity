'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export function NavigationWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  useEffect(() => {
    // Handle navigation for navbar links
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const anchor = target.closest('a')
      
      if (anchor && anchor.href && !anchor.target && !anchor.hasAttribute('data-external')) {
        const url = new URL(anchor.href)
        
        // Check if it's an internal link
        if (url.origin === window.location.origin) {
          e.preventDefault()
          router.push(url.pathname + url.search + url.hash)
        }
      }
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [router])

  return <>{children}</>
}