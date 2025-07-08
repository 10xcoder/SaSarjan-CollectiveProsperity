'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the session from URL hash (for OAuth callbacks)
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        const expiresIn = hashParams.get('expires_in')

        if (accessToken) {
          // Store the session
          const session = {
            access_token: accessToken,
            refresh_token: refreshToken,
            expires_at: Date.now() + (parseInt(expiresIn || '3600') * 1000),
            expires_in: parseInt(expiresIn || '3600'),
            user: null // Will be populated by the auth system
          }

          // You would integrate this with your auth store here
          console.log('OAuth session:', session)
          
          setStatus('success')
          setTimeout(() => {
            router.push('/dashboard')
          }, 2000)
        } else {
          // Check for error
          const error = hashParams.get('error')
          if (error) {
            throw new Error(hashParams.get('error_description') || 'OAuth authentication failed')
          }
          
          // No tokens found, redirect to login
          router.push('/auth/login')
        }
      } catch (err) {
        console.error('OAuth callback error:', err)
        setError(err instanceof Error ? err.message : 'Authentication failed')
        setStatus('error')
        
        setTimeout(() => {
          router.push('/auth/login')
        }, 3000)
      }
    }

    handleCallback()
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        {status === 'loading' && (
          <>
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Completing authentication...
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Please wait while we set up your account.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <div className="h-4 w-4 bg-green-500 rounded-full"></div>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Authentication successful!
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Redirecting you to your dashboard...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <div className="h-4 w-4 bg-red-500 rounded-full"></div>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Authentication failed
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {error || 'Something went wrong. Redirecting to login...'}
            </p>
          </>
        )}
      </div>
    </div>
  )
}