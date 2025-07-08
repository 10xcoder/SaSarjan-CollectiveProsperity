'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Mail, Phone, Loader2, RotateCcw, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthentication } from '../hooks/use-authentication'

interface VerificationFormProps {
  method: 'email' | 'phone'
  identifier: string
  type: 'signup' | 'signin'
  userData?: {
    fullName?: string
    password?: string
  }
  onSuccess: () => void
  onResend: () => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

export default function VerificationForm({ 
  method, 
  identifier,
  type,
  userData,
  onSuccess, 
  onResend, 
  isLoading, 
  setIsLoading 
}: VerificationFormProps) {
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [timeLeft, setTimeLeft] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const auth = useAuthentication({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  })

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus()
  }, [])

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [timeLeft])

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pastedCode = value.slice(0, 6).split('')
      const newCode = [...code]
      pastedCode.forEach((digit, i) => {
        if (index + i < 6) {
          newCode[index + i] = digit
        }
      })
      setCode(newCode)
      
      // Focus last filled input
      const lastFilledIndex = Math.min(index + pastedCode.length - 1, 5)
      inputRefs.current[lastFilledIndex]?.focus()
      return
    }

    // Single character input
    if (!/^\d*$/.test(value)) return

    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit when all fields are filled
    if (newCode.every(digit => digit !== '') && newCode.join('').length === 6) {
      handleSubmit(newCode.join(''))
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleSubmit = async (verificationCode?: string) => {
    const codeToVerify = verificationCode || code.join('')
    
    if (codeToVerify.length !== 6) {
      auth.clearError()
      return
    }

    auth.clearError()
    setIsLoading(true)

    try {
      const result = await auth.verifyCode({
        method,
        identifier,
        code: codeToVerify,
        type,
        userData
      })

      if (result.success) {
        onSuccess()
      }
    } catch (err) {
      // Clear the code on error
      setCode(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (!canResend) return
    
    setIsLoading(true)
    try {
      await auth.sendVerificationCode(method, identifier, type, userData?.fullName)
      setTimeLeft(60)
      setCanResend(false)
      auth.clearError()
    } catch (err) {
      // Error handled by auth hook
    } finally {
      setIsLoading(false)
    }
  }

  const formatIdentifier = (id: string) => {
    if (method === 'email') {
      const [local, domain] = id.split('@')
      if (local.length > 3) {
        return `${local.slice(0, 2)}***@${domain}`
      }
      return id
    } else {
      // Phone number
      if (id.length > 4) {
        return `${id.slice(0, -4).replace(/\d/g, '*')}${id.slice(-4)}`
      }
      return id
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          {method === 'email' ? (
            <Mail className="h-12 w-12 text-primary" />
          ) : (
            <Phone className="h-12 w-12 text-primary" />
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          We sent a 6-digit verification code to{' '}
          <span className="font-medium">{formatIdentifier(identifier)}</span>
        </p>
      </div>

      {/* Verification Code Input */}
      <div className="space-y-4">
        <Label className="text-center block">Enter verification code</Label>
        <div className="flex gap-2 justify-center">
          {code.map((digit, index) => (
            <Input
              key={index}
              ref={el => inputRefs.current[index] = el}
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={digit}
              onChange={e => handleCodeChange(index, e.target.value)}
              onKeyDown={e => handleKeyDown(index, e)}
              className="w-12 h-12 text-center text-lg font-mono"
              disabled={isLoading}
            />
          ))}
        </div>
      </div>

      {/* Error Message */}
      {auth.error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-sm text-destructive text-center"
        >
          {auth.error}
        </motion.div>
      )}

      {/* Submit Button */}
      <Button
        onClick={() => handleSubmit()}
        className="w-full"
        disabled={isLoading || code.some(digit => !digit)}
      >
        {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        <CheckCircle className="h-4 w-4 mr-2" />
        Verify Code
      </Button>

      {/* Resend Code */}
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          Didn't receive the code?
        </p>
        <Button
          variant="link"
          size="sm"
          onClick={handleResend}
          disabled={!canResend || isLoading}
          className="h-auto p-0"
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

      {/* Help Text */}
      <div className="text-center text-xs text-muted-foreground space-y-1">
        {method === 'email' ? (
          <>
            <p>Check your spam folder if you don't see the email</p>
            <p>The code expires in 10 minutes</p>
          </>
        ) : (
          <>
            <p>The code will be sent via WhatsApp</p>
            <p>Make sure WhatsApp is installed and active</p>
          </>
        )}
      </div>
    </div>
  )
}