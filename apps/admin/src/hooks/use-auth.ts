'use client'

import { useUnifiedAuth } from '@sasarjan/auth/client-only'
import { supabase } from '@/lib/supabase'
import { useCallback } from 'react'

export function useAuth() {
  const auth = useUnifiedAuth()
  
  // Override signIn to add admin validation
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      // First authenticate with the unified auth
      await auth.signIn(email, password)
      
      // Then check if user is admin
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('role, status')
        .eq('email', email)
        .single()

      if (adminError || !adminData || adminData.status !== 'active') {
        await auth.signOut()
        throw new Error('Admin access required')
      }
      
      // Store admin role in session
      sessionStorage.setItem('admin_role', adminData.role)
    } catch (error) {
      throw error
    }
  }, [auth])
  
  // Add admin-specific methods
  const getAdminRole = useCallback(() => {
    return sessionStorage.getItem('admin_role')
  }, [])
  
  const isAdmin = useCallback(() => {
    return !!auth.user && !!getAdminRole()
  }, [auth.user, getAdminRole])
  
  const isSuperAdmin = useCallback(() => {
    return getAdminRole() === 'super_admin'
  }, [getAdminRole])
  
  // Override signOut to clear admin data
  const signOut = useCallback(async () => {
    sessionStorage.removeItem('admin_role')
    await auth.signOut()
  }, [auth])
  
  return {
    ...auth,
    signIn, // Override with admin-specific signIn
    signOut, // Override to clear admin data
    getAdminRole,
    isAdmin,
    isSuperAdmin,
  }
}