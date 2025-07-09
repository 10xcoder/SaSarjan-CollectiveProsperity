'use client'

import { useUnifiedAuth } from '../components/unified-auth-provider'

// Re-export the main hook for convenience
export { useUnifiedAuth, useUnifiedAuth as useAuth }

// Additional convenience hooks
export function useRequireAuth(redirectTo = '/auth/login') {
  const { isAuthenticated, isLoading } = useUnifiedAuth()
  
  if (!isLoading && !isAuthenticated && typeof window !== 'undefined') {
    window.location.href = redirectTo
  }
  
  return { isAuthenticated, isLoading }
}

export function useAuthHeaders() {
  const { getAuthHeaders } = useUnifiedAuth()
  return getAuthHeaders
}