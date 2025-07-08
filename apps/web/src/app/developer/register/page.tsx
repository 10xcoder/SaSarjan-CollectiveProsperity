'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Loader2, Building, Globe, CreditCard, Check, AlertCircle } from 'lucide-react'

interface DeveloperRegistrationData {
  // Personal/Company Info
  companyName: string
  companyWebsite: string
  description: string
  
  // Contact Info
  contactPerson: string
  contactEmail: string
  contactPhone: string
  
  // Business Details
  businessType: 'individual' | 'startup' | 'company' | 'ngo' | 'other'
  taxId: string
  registrationNumber: string
  
  // Banking Details
  bankName: string
  accountNumber: string
  routingNumber: string
  
  // App Details
  appName: string
  appWebsite: string
  appDescription: string
  appCategory: string
  
  // Agreements
  agreedToTerms: boolean
  agreedToRevShare: boolean
}

type RegistrationStep = 'company' | 'contact' | 'business' | 'banking' | 'app' | 'review'

export default function DeveloperRegisterPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<RegistrationStep>('company')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState<DeveloperRegistrationData>({
    companyName: '',
    companyWebsite: '',
    description: '',
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    businessType: 'startup',
    taxId: '',
    registrationNumber: '',
    bankName: '',
    accountNumber: '',
    routingNumber: '',
    appName: '',
    appWebsite: '',
    appDescription: '',
    appCategory: 'personal_transformation',
    agreedToTerms: false,
    agreedToRevShare: false
  })

  const steps = [
    { id: 'company', title: 'Company Info', icon: Building },
    { id: 'contact', title: 'Contact Details', icon: Globe },
    { id: 'business', title: 'Business Details', icon: CreditCard },
    { id: 'banking', title: 'Banking Info', icon: CreditCard },
    { id: 'app', title: 'App Details', icon: Globe },
    { id: 'review', title: 'Review', icon: Check }
  ]

  const stepIndex = steps.findIndex(step => step.id === currentStep)
  const isLastStep = currentStep === 'review'
  const isFirstStep = currentStep === 'company'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Validate current step
      const validation = validateStep(currentStep)
      if (!validation.valid) {
        throw new Error(validation.message)
      }

      if (isLastStep) {
        // Submit final registration
        const response = await fetch('/api/developer/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Registration failed')
        }

        // Redirect to success page
        router.push('/developer/welcome')
      } else {
        // Move to next step
        const nextStepIndex = stepIndex + 1
        setCurrentStep(steps[nextStepIndex].id as RegistrationStep)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePrevious = () => {
    if (!isFirstStep) {
      const prevStepIndex = stepIndex - 1
      setCurrentStep(steps[prevStepIndex].id as RegistrationStep)
    }
  }

  const validateStep = (step: RegistrationStep): { valid: boolean; message: string } => {
    switch (step) {
      case 'company':
        if (!formData.companyName.trim()) return { valid: false, message: 'Company name is required' }
        if (!formData.companyWebsite.trim()) return { valid: false, message: 'Company website is required' }
        if (!formData.description.trim()) return { valid: false, message: 'Company description is required' }
        break
      case 'contact':
        if (!formData.contactPerson.trim()) return { valid: false, message: 'Contact person is required' }
        if (!formData.contactEmail.trim()) return { valid: false, message: 'Contact email is required' }
        if (!formData.contactPhone.trim()) return { valid: false, message: 'Contact phone is required' }
        break
      case 'business':
        if (!formData.taxId.trim()) return { valid: false, message: 'Tax ID is required' }
        break
      case 'banking':
        if (!formData.bankName.trim()) return { valid: false, message: 'Bank name is required' }
        if (!formData.accountNumber.trim()) return { valid: false, message: 'Account number is required' }
        if (!formData.routingNumber.trim()) return { valid: false, message: 'Routing number is required' }
        break
      case 'app':
        if (!formData.appName.trim()) return { valid: false, message: 'App name is required' }
        if (!formData.appWebsite.trim()) return { valid: false, message: 'App website is required' }
        if (!formData.appDescription.trim()) return { valid: false, message: 'App description is required' }
        break
      case 'review':
        if (!formData.agreedToTerms) return { valid: false, message: 'You must agree to the terms and conditions' }
        if (!formData.agreedToRevShare) return { valid: false, message: 'You must agree to the revenue sharing terms' }
        break
    }
    return { valid: true, message: '' }
  }

  const updateFormData = (updates: Partial<DeveloperRegistrationData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
    setError('')
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 'company':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company/Organization Name *</Label>
              <Input
                id="companyName"
                type="text"
                placeholder="Enter your company name"
                value={formData.companyName}
                onChange={(e) => updateFormData({ companyName: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="companyWebsite">Company Website *</Label>
              <Input
                id="companyWebsite"
                type="url"
                placeholder="https://yourcompany.com"
                value={formData.companyWebsite}
                onChange={(e) => updateFormData({ companyWebsite: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Company Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe your company and mission..."
                value={formData.description}
                onChange={(e) => updateFormData({ description: e.target.value })}
                rows={3}
                required
              />
            </div>
          </div>
        )

      case 'contact':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contactPerson">Primary Contact Person *</Label>
              <Input
                id="contactPerson"
                type="text"
                placeholder="Full name"
                value={formData.contactPerson}
                onChange={(e) => updateFormData({ contactPerson: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Contact Email *</Label>
              <Input
                id="contactEmail"
                type="email"
                placeholder="contact@yourcompany.com"
                value={formData.contactEmail}
                onChange={(e) => updateFormData({ contactEmail: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contactPhone">Contact Phone *</Label>
              <Input
                id="contactPhone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={formData.contactPhone}
                onChange={(e) => updateFormData({ contactPhone: e.target.value })}
                required
              />
            </div>
          </div>
        )

      case 'business':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="businessType">Business Type</Label>
              <select
                id="businessType"
                className="w-full p-2 border border-input bg-background rounded-md"
                value={formData.businessType}
                onChange={(e) => updateFormData({ businessType: e.target.value as any })}
              >
                <option value="individual">Individual</option>
                <option value="startup">Startup</option>
                <option value="company">Company</option>
                <option value="ngo">NGO/Non-profit</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="taxId">Tax Identification Number *</Label>
              <Input
                id="taxId"
                type="text"
                placeholder="Tax ID or EIN"
                value={formData.taxId}
                onChange={(e) => updateFormData({ taxId: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="registrationNumber">Business Registration Number</Label>
              <Input
                id="registrationNumber"
                type="text"
                placeholder="Business registration number (if applicable)"
                value={formData.registrationNumber}
                onChange={(e) => updateFormData({ registrationNumber: e.target.value })}
              />
            </div>
          </div>
        )

      case 'banking':
        return (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Secure Banking Information</p>
                  <p>This information is encrypted and used only for revenue sharing payments.</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bankName">Bank Name *</Label>
              <Input
                id="bankName"
                type="text"
                placeholder="Bank name"
                value={formData.bankName}
                onChange={(e) => updateFormData({ bankName: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="accountNumber">Account Number *</Label>
              <Input
                id="accountNumber"
                type="text"
                placeholder="Account number"
                value={formData.accountNumber}
                onChange={(e) => updateFormData({ accountNumber: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="routingNumber">Routing Number *</Label>
              <Input
                id="routingNumber"
                type="text"
                placeholder="Routing number"
                value={formData.routingNumber}
                onChange={(e) => updateFormData({ routingNumber: e.target.value })}
                required
              />
            </div>
          </div>
        )

      case 'app':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="appName">App Name *</Label>
              <Input
                id="appName"
                type="text"
                placeholder="Your app name"
                value={formData.appName}
                onChange={(e) => updateFormData({ appName: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="appWebsite">App Website/URL *</Label>
              <Input
                id="appWebsite"
                type="url"
                placeholder="https://yourapp.com"
                value={formData.appWebsite}
                onChange={(e) => updateFormData({ appWebsite: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="appCategory">Prosperity Category</Label>
              <select
                id="appCategory"
                className="w-full p-2 border border-input bg-background rounded-md"
                value={formData.appCategory}
                onChange={(e) => updateFormData({ appCategory: e.target.value })}
              >
                <option value="personal_transformation">Personal Transformation</option>
                <option value="organizational_excellence">Organizational Excellence</option>
                <option value="community_resilience">Community Resilience</option>
                <option value="ecological_regeneration">Ecological Regeneration</option>
                <option value="economic_empowerment">Economic Empowerment</option>
                <option value="knowledge_commons">Knowledge Commons</option>
                <option value="social_innovation">Social Innovation</option>
                <option value="cultural_expression">Cultural Expression</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="appDescription">App Description *</Label>
              <Textarea
                id="appDescription"
                placeholder="Describe your app and its impact on collective prosperity..."
                value={formData.appDescription}
                onChange={(e) => updateFormData({ appDescription: e.target.value })}
                rows={4}
                required
              />
            </div>
          </div>
        )

      case 'review':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Review Your Information</h3>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Company</Label>
                  <p>{formData.companyName}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Contact</Label>
                  <p>{formData.contactPerson}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">App Name</Label>
                  <p>{formData.appName}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Category</Label>
                  <Badge variant="secondary">{formData.appCategory.replace('_', ' ')}</Badge>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="agreedToTerms"
                  checked={formData.agreedToTerms}
                  onCheckedChange={(checked) => updateFormData({ agreedToTerms: !!checked })}
                />
                <Label htmlFor="agreedToTerms" className="text-sm leading-relaxed">
                  I agree to the{' '}
                  <a href="/terms" className="text-primary hover:underline">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </a>
                </Label>
              </div>
              
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="agreedToRevShare"
                  checked={formData.agreedToRevShare}
                  onCheckedChange={(checked) => updateFormData({ agreedToRevShare: !!checked })}
                />
                <Label htmlFor="agreedToRevShare" className="text-sm leading-relaxed">
                  I agree to the revenue sharing model (15% platform fee) and{' '}
                  <a href="/developer/terms" className="text-primary hover:underline">
                    Developer Agreement
                  </a>
                </Label>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const StepIcon = step.icon
              const isActive = step.id === currentStep
              const isCompleted = index < stepIndex
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    isCompleted 
                      ? 'bg-primary border-primary text-primary-foreground' 
                      : isActive 
                        ? 'border-primary text-primary' 
                        : 'border-muted-foreground text-muted-foreground'
                  }`}>
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <StepIcon className="h-5 w-5" />
                    )}
                  </div>
                  <div className="ml-2 hidden sm:block">
                    <p className={`text-sm font-medium ${
                      isActive ? 'text-primary' : isCompleted ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`mx-4 h-0.5 w-8 sm:w-16 ${
                      isCompleted ? 'bg-primary' : 'bg-muted'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>
              {steps.find(s => s.id === currentStep)?.title}
            </CardTitle>
            <CardDescription>
              {currentStep === 'company' && 'Tell us about your company or organization'}
              {currentStep === 'contact' && 'Provide your primary contact information'}
              {currentStep === 'business' && 'Business registration and tax information'}
              {currentStep === 'banking' && 'Banking details for revenue sharing'}
              {currentStep === 'app' && 'Details about your app submission'}
              {currentStep === 'review' && 'Review your information and complete registration'}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {renderStepContent()}
              
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
                  {error}
                </div>
              )}
              
              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={isFirstStep}
                >
                  Previous
                </Button>
                
                <Button
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {isLastStep ? 'Complete Registration' : 'Continue'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}