'use client'

import { useRouter } from 'next/navigation'
import { LoginForm } from '@sasarjan/auth/client-only'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()

  const handleSuccess = () => {
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome Back
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Sign in to your SaSarjan account
          </p>
        </div>

        <LoginForm 
          onSuccess={handleSuccess} 
          showSignUp={false}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6"
        />

        <div className="text-center text-sm text-gray-600 dark:text-gray-300">
          Don't have an account?{' '}
          <Link href="/auth/register" className="text-primary hover:underline">
            Sign up here
          </Link>
        </div>
      </div>
    </div>
  )
}