'use client'

import { useRouter } from 'next/navigation'
import { LoginForm } from '@sasarjan/auth/client-only'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()

  const handleSuccess = () => {
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Join SaSarjan
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Create your account for collective prosperity
          </p>
        </div>

        <LoginForm 
          onSuccess={handleSuccess} 
          showSignUp={true}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6"
        />

        <div className="text-center text-sm text-gray-600 dark:text-gray-300">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-primary hover:underline">
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  )
}