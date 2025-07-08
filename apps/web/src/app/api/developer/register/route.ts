import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'
import { env } from '@/lib/env'
import { ratelimit } from '@/lib/ratelimit'

const developerRegistrationSchema = z.object({
  // Company Info
  companyName: z.string().min(1, 'Company name is required'),
  companyWebsite: z.string().url('Valid company website URL is required'),
  description: z.string().min(10, 'Company description must be at least 10 characters'),
  
  // Contact Info
  contactPerson: z.string().min(1, 'Contact person is required'),
  contactEmail: z.string().email('Valid contact email is required'),
  contactPhone: z.string().min(1, 'Contact phone is required'),
  
  // Business Details
  businessType: z.enum(['individual', 'startup', 'company', 'ngo', 'other']),
  taxId: z.string().min(1, 'Tax ID is required'),
  registrationNumber: z.string().optional(),
  
  // Banking Details
  bankName: z.string().min(1, 'Bank name is required'),
  accountNumber: z.string().min(1, 'Account number is required'),
  routingNumber: z.string().min(1, 'Routing number is required'),
  
  // App Details
  appName: z.string().min(1, 'App name is required'),
  appWebsite: z.string().url('Valid app website URL is required'),
  appDescription: z.string().min(10, 'App description must be at least 10 characters'),
  appCategory: z.enum([
    'personal_transformation',
    'organizational_excellence', 
    'community_resilience',
    'ecological_regeneration',
    'economic_empowerment',
    'knowledge_commons',
    'social_innovation',
    'cultural_expression'
  ]),
  
  // Agreements
  agreedToTerms: z.boolean().refine(val => val === true, 'You must agree to the terms'),
  agreedToRevShare: z.boolean().refine(val => val === true, 'You must agree to revenue sharing terms')
})

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const rateLimitResult = await ratelimit.limit(`developer_register_${ip}`)
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many registration attempts' },
        { status: 429 }
      )
    }

    // Get user session (assuming user is authenticated)
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Parse and validate request
    const body = await request.json()
    const validatedData = developerRegistrationSchema.parse(body)

    // Create Supabase client
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

    // Get current user from auth header
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication' },
        { status: 401 }
      )
    }

    // Check if user already has a developer profile
    const { data: existingDeveloper } = await supabase
      .from('developers')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (existingDeveloper) {
      return NextResponse.json(
        { error: 'Developer profile already exists' },
        { status: 409 }
      )
    }

    // Encrypt sensitive banking information
    const encryptedBankDetails = {
      bankName: validatedData.bankName,
      accountNumber: Buffer.from(validatedData.accountNumber).toString('base64'),
      routingNumber: Buffer.from(validatedData.routingNumber).toString('base64'),
      encryptedAt: new Date().toISOString()
    }

    // Create developer profile
    const { data: developer, error: developerError } = await supabase
      .from('developers')
      .insert({
        user_id: user.id,
        company_name: validatedData.companyName,
        company_website: validatedData.companyWebsite,
        description: validatedData.description,
        contact_person: validatedData.contactPerson,
        contact_email: validatedData.contactEmail,
        contact_phone: validatedData.contactPhone,
        business_type: validatedData.businessType,
        tax_id: validatedData.taxId,
        registration_number: validatedData.registrationNumber || null,
        bank_details: encryptedBankDetails,
        commission_rate: 0.15, // 15% platform fee
        payout_threshold: 100, // $100 minimum payout
        status: 'pending_review',
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (developerError) {
      console.error('Developer creation error:', developerError)
      return NextResponse.json(
        { error: 'Failed to create developer profile' },
        { status: 500 }
      )
    }

    // Create initial app submission
    const { data: app, error: appError } = await supabase
      .from('apps')
      .insert({
        developer_id: developer.id,
        name: validatedData.appName,
        slug: validatedData.appName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        description: validatedData.appDescription,
        short_description: validatedData.appDescription.substring(0, 200),
        category: validatedData.appCategory,
        status: 'draft',
        website_url: validatedData.appWebsite,
        pricing_model: 'freemium', // Default pricing model
        currency: 'USD',
        trial_days: 7,
        version: '1.0.0',
        supported_languages: ['en'],
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (appError) {
      console.error('App creation error:', appError)
      // Don't fail registration if app creation fails
    }

    // Create developer application record for tracking
    const { error: applicationError } = await supabase
      .from('developer_applications')
      .insert({
        developer_id: developer.id,
        status: 'pending',
        submitted_at: new Date().toISOString(),
        review_estimate: '3-5 business days',
        application_data: {
          companyInfo: {
            name: validatedData.companyName,
            website: validatedData.companyWebsite,
            description: validatedData.description,
            businessType: validatedData.businessType
          },
          appInfo: {
            name: validatedData.appName,
            website: validatedData.appWebsite,
            description: validatedData.appDescription,
            category: validatedData.appCategory
          },
          contactInfo: {
            person: validatedData.contactPerson,
            email: validatedData.contactEmail,
            phone: validatedData.contactPhone
          }
        }
      })

    if (applicationError) {
      console.error('Application tracking error:', applicationError)
    }

    // Send notification to admin team
    try {
      await fetch(`${env.APP_URL}/api/admin/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.INTERNAL_API_KEY}`
        },
        body: JSON.stringify({
          type: 'new_developer_application',
          data: {
            developerId: developer.id,
            companyName: validatedData.companyName,
            appName: validatedData.appName,
            submittedAt: new Date().toISOString()
          }
        })
      })
    } catch (notificationError) {
      console.error('Notification error:', notificationError)
      // Don't fail registration if notification fails
    }

    // Send welcome email to developer
    try {
      await fetch(`${env.APP_URL}/api/emails/developer-welcome`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.INTERNAL_API_KEY}`
        },
        body: JSON.stringify({
          email: validatedData.contactEmail,
          name: validatedData.contactPerson,
          companyName: validatedData.companyName,
          applicationId: developer.id
        })
      })
    } catch (emailError) {
      console.error('Welcome email error:', emailError)
      // Don't fail registration if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Developer registration submitted successfully',
      data: {
        developerId: developer.id,
        applicationId: developer.id,
        status: 'pending_review',
        reviewEstimate: '3-5 business days'
      }
    })

  } catch (error) {
    console.error('Developer registration error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid registration data', 
          details: error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    )
  }
}