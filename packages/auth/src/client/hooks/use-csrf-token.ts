import { useState, useEffect } from 'react'
import { getTokenManager } from '../token-manager'

export function useCsrfToken() {
  const [csrfToken, setCsrfToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const tokenManager = getTokenManager()
    const token = tokenManager.getCsrfToken()
    setCsrfToken(token)
    setLoading(false)
  }, [])
  
  const refreshCsrfToken = () => {
    const tokenManager = getTokenManager()
    const newToken = tokenManager.getCsrfToken()
    setCsrfToken(newToken)
    return newToken
  }
  
  return {
    csrfToken,
    loading,
    refreshCsrfToken
  }
}

// Helper hook to automatically include CSRF token in fetch requests
export function useCsrfFetch() {
  const { csrfToken } = useCsrfToken()
  
  const csrfFetch = async (url: string, options: RequestInit = {}) => {
    const headers = new Headers(options.headers)
    
    if (csrfToken && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(options.method?.toUpperCase() || 'GET')) {
      headers.set('X-CSRF-Token', csrfToken)
    }
    
    return fetch(url, {
      ...options,
      headers,
      credentials: 'include' // Important for cookies
    })
  }
  
  return csrfFetch
}