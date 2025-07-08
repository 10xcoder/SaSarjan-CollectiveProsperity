'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowLeft, Mail, Phone, Shield, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import SignInForm from './sign-in-form'
import SignUpForm from './sign-up-form'
import VerificationForm from './verification-form'

type AuthStep = 'choose' | 'signin' | 'signup' | 'verify'
type AuthMethod = 'email' | 'phone' | null

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  defaultStep?: AuthStep
  onSuccess?: () => void
}

export default function AuthModal({ isOpen, onClose, defaultStep = 'choose', onSuccess }: AuthModalProps) {
  const [step, setStep] = useState<AuthStep>(defaultStep)
  const [authMethod, setAuthMethod] = useState<AuthMethod>(null)
  const [identifier, setIdentifier] = useState('') // email or phone
  const [isLoading, setIsLoading] = useState(false)

  const resetModal = () => {
    setStep('choose')
    setAuthMethod(null)
    setIdentifier('')
    setIsLoading(false)
  }

  const handleClose = () => {
    resetModal()
    onClose()
  }

  const handleSuccess = () => {
    resetModal()
    onSuccess?.()
    onClose()
  }

  const handleVerificationRequired = (method: AuthMethod, id: string) => {
    setAuthMethod(method)
    setIdentifier(id)
    setStep('verify')
  }

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0
    })
  }

  const transition = {
    x: { type: "spring", stiffness: 300, damping: 30 },
    opacity: { duration: 0.2 }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="relative overflow-hidden">
              <CardHeader className="relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {step !== 'choose' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (step === 'verify') {
                            setStep(identifier ? 'signup' : 'choose')
                          } else {
                            setStep('choose')
                          }
                        }}
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                    )}
                    <div>
                      <CardTitle className="text-xl">
                        {step === 'choose' && 'Welcome to SaSarjan'}
                        {step === 'signin' && 'Sign In'}
                        {step === 'signup' && 'Create Account'}
                        {step === 'verify' && 'Verify Your Account'}
                      </CardTitle>
                      <CardDescription>
                        {step === 'choose' && 'Choose how you\'d like to continue'}
                        {step === 'signin' && 'Sign in to your account'}
                        {step === 'signup' && 'Create your SaSarjan account'}
                        {step === 'verify' && `We sent a verification code to your ${authMethod}`}
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClose}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="relative h-[400px] overflow-hidden">
                <AnimatePresence mode="wait">
                  {step === 'choose' && (
                    <motion.div
                      key="choose"
                      initial="enter"
                      animate="center"
                      exit="exit"
                      variants={slideVariants}
                      transition={transition}
                      className="absolute inset-0 flex flex-col gap-4"
                    >
                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          variant="outline"
                          className="h-auto flex-col gap-2 p-4"
                          onClick={() => setStep('signin')}
                        >
                          <Shield className="h-6 w-6" />
                          <span className="text-sm font-medium">Sign In</span>
                        </Button>
                        <Button
                          variant="outline"
                          className="h-auto flex-col gap-2 p-4"
                          onClick={() => setStep('signup')}
                        >
                          <CheckCircle className="h-6 w-6" />
                          <span className="text-sm font-medium">Sign Up</span>
                        </Button>
                      </div>
                      
                      <Separator className="my-4" />
                      
                      <div className="text-center text-sm text-muted-foreground">
                        <p>By continuing, you agree to our</p>
                        <p>
                          <a href="#" className="text-primary hover:underline">Terms of Service</a>
                          {' and '}
                          <a href="#" className="text-primary hover:underline">Privacy Policy</a>
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {step === 'signin' && (
                    <motion.div
                      key="signin"
                      initial="enter"
                      animate="center"
                      exit="exit"
                      variants={slideVariants}
                      transition={transition}
                      className="absolute inset-0"
                    >
                      <SignInForm
                        onSuccess={handleSuccess}
                        onVerificationRequired={handleVerificationRequired}
                        isLoading={isLoading}
                        setIsLoading={setIsLoading}
                      />
                    </motion.div>
                  )}

                  {step === 'signup' && (
                    <motion.div
                      key="signup"
                      initial="enter"
                      animate="center"
                      exit="exit"
                      variants={slideVariants}
                      transition={transition}
                      className="absolute inset-0"
                    >
                      <SignUpForm
                        onSuccess={handleSuccess}
                        onVerificationRequired={handleVerificationRequired}
                        isLoading={isLoading}
                        setIsLoading={setIsLoading}
                      />
                    </motion.div>
                  )}

                  {step === 'verify' && (
                    <motion.div
                      key="verify"
                      initial="enter"
                      animate="center"
                      exit="exit"
                      variants={slideVariants}
                      transition={transition}
                      className="absolute inset-0"
                    >
                      <VerificationForm
                        method={authMethod!}
                        identifier={identifier}
                        type="signup"
                        userData={{ fullName: '' }}
                        onSuccess={handleSuccess}
                        onResend={() => {
                          // Resend verification code
                        }}
                        isLoading={isLoading}
                        setIsLoading={setIsLoading}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}