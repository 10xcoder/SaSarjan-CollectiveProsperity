'use client'

import { useState, useEffect } from 'react'
import { Mail, Phone, Eye, EyeOff, Loader2, ArrowLeft, Check, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

type AuthMode = 'login' | 'register'
type AuthMethod = 'email' | 'phone'
type AuthStep = 'input' | 'verify'

interface AuthFormProps {
  mode: AuthMode
  onSuccess?: () => void
}

export function AuthForm({ mode, onSuccess }: AuthFormProps) {
  const [step, setStep] = useState<AuthStep>('input')
  const [method, setMethod] = useState<AuthMethod>('email')
  const [formData, setFormData] = useState({
    fullName: '',
    identifier: '',
    password: '',
    confirmPassword: ''
  })
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', ''])
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isPasswordless, setIsPasswordless] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [timeLeft, setTimeLeft] = useState(60)
  const [canResend, setCanResend] = useState(false)

  const isLogin = mode === 'login'

  const validateIdentifier = (value: string) => {
    if (method === 'email') {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    } else {
      return /^(\+\d{1,3}[- ]?)?\d{10}$/.test(value.replace(/\s/g, ''))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      if (!validateIdentifier(formData.identifier)) {
        throw new Error(`Please enter a valid ${method}`)
      }

      if (!isLogin) {
        if (!formData.fullName.trim()) {
          throw new Error('Full name is required')
        }
        if (!agreedToTerms) {
          throw new Error('You must agree to the terms and conditions')
        }
      }

      if (!isPasswordless && !formData.password) {
        throw new Error('Password is required')
      }

      if (!isLogin && !isPasswordless && formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match')
      }

      // Handle direct email/password authentication
      if (!isPasswordless && method === 'email') {
        const endpoint = isLogin ? '/api/auth/signin' : '/api/auth/signup'
        const payload = isLogin 
          ? { email: formData.identifier, password: formData.password }
          : { email: formData.identifier, password: formData.password, fullName: formData.fullName }

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || `${isLogin ? 'Sign in' : 'Sign up'} failed`)
        }

        // Handle email confirmation for sign-up
        if (!isLogin && data.emailConfirmationSent) {
          setStep('verify')
          setTimeLeft(0)
          setCanResend(false)
          return
        }

        // Successful authentication
        onSuccess?.()
        return
      }

      // Send verification code/magic link for other cases
      const response = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          method,
          identifier: formData.identifier,
          type: isLogin ? 'signin' : 'signup',
          fullName: formData.fullName
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send verification code')
      }

      // For email magic link, show success message instead of verification step
      if (method === 'email') {
        setStep('verify')
        setTimeLeft(0) // No countdown for magic link
        setCanResend(false)
      } else {
        setStep('verify')
        setTimeLeft(60)
        setCanResend(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    const code = verificationCode.join('')
    
    if (code.length !== 6) {
      setError('Please enter the complete verification code')
      return
    }

    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          method,
          identifier: formData.identifier,
          code,
          type: isLogin ? 'signin' : 'signup',
          userData: {
            fullName: formData.fullName,
            password: formData.password
          }
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed')
      }

      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed')
      setVerificationCode(['', '', '', '', '', ''])
    } finally {
      setIsLoading(false)
    }
  }

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return // Prevent multiple characters
    if (!/^\d*$/.test(value)) return // Only digits

    const newCode = [...verificationCode]
    newCode[index] = value
    setVerificationCode(newCode)

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`)
      nextInput?.focus()
    }

    // Auto-submit when complete
    if (newCode.every(digit => digit !== '') && newCode.join('').length === 6) {
      setVerificationCode(newCode)
      setTimeout(() => handleVerify({ preventDefault: () => {} } as React.FormEvent), 100)
    }
  }

  const handleResend = async () => {
    if (!canResend) return
    
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          method,
          identifier: formData.identifier,
          type: isLogin ? 'signin' : 'signup',
          fullName: formData.fullName
        })
      })

      if (response.ok) {
        setTimeLeft(60)
        setCanResend(false)
        setError('')
      }
    } catch (_err) {
      setError('Failed to resend code')
    } finally {
      setIsLoading(false)
    }
  }

  // Timer effect
  useEffect(() => {
    if (step === 'verify' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0) {
      setCanResend(true)
    }
  }, [step, timeLeft])

  if (step === 'verify') {
    // Magic link flow for email
    if (method === 'email') {
      return (
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep('input')}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <CardTitle>Check Your Email</CardTitle>
                <CardDescription>
                  We sent {isPasswordless ? 'a magic link' : 'a confirmation link'} to {formData.identifier}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-center gap-2 text-blue-600">
                  <Mail className="h-5 w-5" />
                  <div>
                    <p className="font-medium">
                      {isPasswordless ? 'Magic link sent!' : 'Confirmation email sent!'}
                    </p>
                    <p className="text-sm text-blue-600/80">
                      {isPasswordless 
                        ? 'Click the link in your email to sign in'
                        : 'Check your email and click the link to confirm your account'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
                  {error}
                </div>
              )}

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleResend}
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <RotateCcw className="h-4 w-4 mr-1" />
                {isPasswordless ? 'Resend magic link' : 'Resend confirmation email'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )
    }

    // Verification code flow for phone
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep('input')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <CardTitle>Verify Your Phone</CardTitle>
              <CardDescription>
                We sent a 6-digit code to {formData.identifier}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="flex gap-2 justify-center">
              {verificationCode.map((digit, index) => (
                <Input
                  key={index}
                  id={`code-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  className="w-12 h-12 text-center text-lg font-mono"
                  disabled={isLoading}
                />
              ))}
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || verificationCode.some(digit => !digit)}
            >
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Verify Code
            </Button>

            <div className="text-center">
              <Button
                type="button"
                variant="link"
                size="sm"
                onClick={handleResend}
                disabled={!canResend || isLoading}
              >
                {canResend ? (
                  <>
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Resend code
                  </>
                ) : (
                  `Resend in ${timeLeft}s`
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{isLogin ? 'Sign In' : 'Create Account'}</CardTitle>
        <CardDescription>
          {isLogin ? 'Sign in to your account' : 'Create your SaSarjan account'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Method Selection */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-lg mb-6">
          <Button
            type="button"
            variant={method === 'email' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => {
              setMethod('email')
              setError('')
            }}
            className="flex items-center gap-2"
          >
            <Mail className="h-4 w-4" />
            Email
          </Button>
          <Button
            type="button"
            variant={method === 'phone' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => {
              setMethod('phone')
              setError('')
            }}
            className="flex items-center gap-2"
          >
            <Phone className="h-4 w-4" />
            Phone
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name (Register only) */}
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                required
              />
            </div>
          )}

          {/* Email or Phone */}
          <div className="space-y-2">
            <Label htmlFor="identifier">
              {method === 'email' ? 'Email Address' : 'Phone Number'}
            </Label>
            <Input
              id="identifier"
              type={method === 'email' ? 'email' : 'tel'}
              placeholder={method === 'email' ? 'you@example.com' : '+1 (555) 123-4567'}
              value={formData.identifier}
              onChange={(e) => setFormData(prev => ({ ...prev, identifier: e.target.value }))}
              required
            />
          </div>

          {/* Password (if not passwordless) */}
          {!isPasswordless && (
            <>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={isLogin ? 'Enter your password' : 'Create a password'}
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    required
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* Confirm Password (Register only) */}
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      required
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {formData.confirmPassword && (
                    <div className="flex items-center gap-2">
                      {formData.password === formData.confirmPassword ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <div className="h-4 w-4 rounded-full bg-red-500" />
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formData.password === formData.confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Terms Agreement (Register only) */}
          {!isLogin && (
            <div className="flex items-start space-x-2">
              <input
                type="checkbox"
                id="terms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1"
              />
              <Label htmlFor="terms" className="text-sm leading-relaxed">
                I agree to the{' '}
                <a href="#" className="text-primary hover:underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-primary hover:underline">
                  Privacy Policy
                </a>
              </Label>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || (!isLogin && !agreedToTerms)}
          >
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isPasswordless 
              ? `Send ${method === 'email' ? 'Magic Link' : 'Code via WhatsApp'}`
              : isLogin ? 'Sign In' : 'Create Account'
            }
          </Button>

          {/* Passwordless Toggle */}
          <div className="text-center">
            <Button
              type="button"
              variant="link"
              size="sm"
              onClick={() => setIsPasswordless(!isPasswordless)}
            >
              {isPasswordless 
                ? 'Use password instead' 
                : `Sign ${isLogin ? 'in' : 'up'} with ${method === 'email' ? 'magic link' : 'WhatsApp code'}`
              }
            </Button>
          </div>

          {/* Forgot Password */}
          {isLogin && !isPasswordless && (
            <div className="text-center">
              <Button
                type="button"
                variant="link"
                size="sm"
              >
                Forgot your password?
              </Button>
            </div>
          )}
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <Separator />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
            or
          </span>
        </div>

        {/* Social Login */}
        <div className="space-y-2">
          <Button variant="outline" className="w-full">
            <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </Button>
          
          <Button variant="outline" className="w-full">
            <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            Continue with GitHub
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}