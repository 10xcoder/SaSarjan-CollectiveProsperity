import { describe, it, expect, beforeEach, vi } from 'vitest'
import { z } from 'zod'
import {
  JobPosting,
  JobPostingType,
  JobApplication,
  JobApplicationType,
  ProjectPosting,
  ProjectPostingType,
  ProjectProposal,
  ProjectProposalType,
  JobBoardConfig,
  JobSearchFilters,
  FreelanceSearchFilters,
  JobBoardApiResponse,
  JobBoardEvent,
  MatchingScore,
  JobMatch,
  TalentMatch,
  JobBoardNotification,
} from '../../src/types/index'

describe('Job Board Integration Tests', () => {
  const mockDate = new Date('2024-01-01T00:00:00.000Z')

  beforeEach(() => {
    vi.setSystemTime(mockDate)
  })

  describe('Job Posting Workflow', () => {
    it('should create and validate complete job posting workflow', () => {
      // Create a company
      const company = {
        id: 'company-123',
        name: 'Tech Innovations Inc',
        description: 'Leading technology company',
        website: 'https://techinnovations.com',
        logo: 'https://techinnovations.com/logo.png',
        size: '51-200',
        industry: 'Technology',
        location: 'San Francisco, CA',
        culture: ['innovative', 'collaborative', 'fast-paced'],
        techStack: ['React', 'Node.js', 'PostgreSQL', 'AWS'],
        socialLinks: {
          linkedin: 'https://linkedin.com/company/tech-innovations',
          github: 'https://github.com/tech-innovations',
        },
      }

      // Create job location
      const jobLocation = {
        country: 'United States',
        state: 'California',
        city: 'San Francisco',
        coordinates: {
          latitude: 37.7749,
          longitude: -122.4194,
        },
        timezone: 'America/Los_Angeles',
        isRemote: false,
      }

      // Create job requirements
      const requirements = [
        {
          type: 'skill',
          name: 'React',
          description: 'Advanced React development experience',
          level: 'advanced',
          required: true,
          yearsExperience: 5,
        },
        {
          type: 'skill',
          name: 'TypeScript',
          description: 'Strong TypeScript knowledge',
          level: 'intermediate',
          required: true,
          yearsExperience: 3,
        },
        {
          type: 'education',
          name: 'Computer Science Degree',
          description: 'Bachelor\'s degree in Computer Science or related field',
          required: false,
        },
      ]

      // Create job benefits
      const benefits = [
        {
          type: 'health_insurance',
          name: 'Health Insurance',
          description: '100% coverage for employee and family',
          value: '100%',
        },
        {
          type: 'retirement_plan',
          name: '401(k) Plan',
          description: 'Company matching up to 6%',
          value: '6% match',
        },
        {
          type: 'paid_time_off',
          name: 'PTO',
          description: 'Unlimited paid time off',
          value: 'Unlimited',
        },
      ]

      // Create salary information
      const salary = {
        currency: 'USD',
        period: 'annually',
        min: 140000,
        max: 180000,
        isNegotiable: true,
        includesBenefits: true,
        equityOffered: true,
        performanceBonus: true,
        displaySalary: true,
      }

      // Create screening questions
      const screeningQuestions = [
        {
          id: 'q1',
          question: 'How many years of React experience do you have?',
          type: 'scale',
          required: true,
          order: 1,
        },
        {
          id: 'q2',
          question: 'Are you authorized to work in the United States?',
          type: 'yes_no',
          required: true,
          order: 2,
        },
        {
          id: 'q3',
          question: 'What is your expected salary range?',
          type: 'text',
          required: false,
          maxLength: 100,
          order: 3,
        },
      ]

      // Create complete job posting
      const jobPosting: JobPostingType = {
        id: 'job-senior-react-dev',
        title: 'Senior React Developer',
        slug: 'senior-react-developer',
        description: 'We are seeking a skilled Senior React Developer to join our growing team...',
        shortDescription: 'Senior React Developer position at a leading tech company',
        employmentType: 'full_time',
        experienceLevel: 'senior',
        category: 'technology',
        workArrangement: 'hybrid',
        company,
        location: jobLocation,
        requirements,
        responsibilities: [
          'Develop and maintain React applications',
          'Collaborate with UX/UI designers',
          'Write clean, maintainable code',
          'Participate in code reviews',
          'Mentor junior developers',
        ],
        benefits,
        salary,
        applicationMethod: 'internal',
        applicationDeadline: {
          type: 'rolling',
        },
        screeningQuestions,
        status: 'active',
        isVisible: true,
        isFeatured: true,
        isUrgent: false,
        tags: ['react', 'typescript', 'frontend', 'senior'],
        keywords: ['react', 'typescript', 'javascript', 'frontend', 'ui'],
        appId: 'app-techinnovations',
        postedBy: 'user-hr-manager',
        createdAt: mockDate,
        updatedAt: mockDate,
        publishedAt: mockDate,
        prosperityImpact: {
          category: 'economic_empowerment',
          impactDescription: 'Building technology that empowers small businesses',
          communityBenefit: 'Creating jobs and economic opportunities',
          sustainabilityFocus: true,
        },
        seoTitle: 'Senior React Developer - Tech Innovations Inc',
        seoDescription: 'Join our team as a Senior React Developer. Competitive salary, great benefits, and the opportunity to work on cutting-edge technology.',
        seoKeywords: ['react developer', 'senior developer', 'tech jobs', 'san francisco'],
        diversityInfo: {
          equalOpportunityEmployer: true,
          diversityStatement: 'We are committed to building a diverse and inclusive team',
          accommodationsAvailable: true,
          lgbtqFriendly: true,
        },
        remoteDetails: {
          fullyRemote: false,
          remotePercentage: 50,
          officeVisitRequirement: '2-3 days per week',
          timeZoneRequirement: 'PST/PDT',
          equipmentProvided: true,
          internetStipend: true,
        },
      }

      // Validate the job posting
      expect(() => JobPosting.parse(jobPosting)).not.toThrow()
      const validatedJob = JobPosting.parse(jobPosting)

      // Verify job posting structure
      expect(validatedJob.title).toBe('Senior React Developer')
      expect(validatedJob.company.name).toBe('Tech Innovations Inc')
      expect(validatedJob.requirements).toHaveLength(3)
      expect(validatedJob.benefits).toHaveLength(3)
      expect(validatedJob.screeningQuestions).toHaveLength(3)
      expect(validatedJob.salary?.min).toBe(140000)
      expect(validatedJob.prosperityImpact?.category).toBe('economic_empowerment')
    })

    it('should handle job posting with minimal required fields', () => {
      const minimalJob: JobPostingType = {
        id: 'job-minimal',
        title: 'Developer',
        slug: 'developer',
        description: 'Developer position',
        employmentType: 'full_time',
        experienceLevel: 'mid',
        category: 'technology',
        workArrangement: 'remote',
        company: {
          id: 'company-minimal',
          name: 'Minimal Corp',
        },
        location: {
          country: 'United States',
          isRemote: true,
        },
        requirements: [],
        responsibilities: ['Code'],
        benefits: [],
        applicationMethod: 'internal',
        applicationDeadline: {
          type: 'rolling',
        },
        status: 'active',
        tags: ['development'],
        appId: 'app-minimal',
        postedBy: 'user-minimal',
        createdAt: mockDate,
        updatedAt: mockDate,
        submittedAt: mockDate,
      }

      expect(() => JobPosting.parse(minimalJob)).not.toThrow()
      const validatedJob = JobPosting.parse(minimalJob)
      expect(validatedJob.isVisible).toBe(true) // default
      expect(validatedJob.isFeatured).toBe(false) // default
    })
  })

  describe('Job Application Workflow', () => {
    it('should create and validate complete job application workflow', () => {
      // Create application documents
      const documents = [
        {
          id: 'doc-resume',
          type: 'resume',
          name: 'john_doe_resume.pdf',
          url: 'https://storage.example.com/resumes/john_doe_resume.pdf',
          mimeType: 'application/pdf',
          size: 245760,
          uploadedAt: mockDate,
          isRequired: true,
        },
        {
          id: 'doc-cover-letter',
          type: 'cover_letter',
          name: 'john_doe_cover_letter.pdf',
          url: 'https://storage.example.com/cover-letters/john_doe_cover_letter.pdf',
          mimeType: 'application/pdf',
          size: 102400,
          uploadedAt: mockDate,
          isRequired: false,
        },
      ]

      // Create references
      const references = [
        {
          id: 'ref-1',
          name: 'Sarah Johnson',
          title: 'Senior Engineering Manager',
          company: 'Previous Company Inc',
          email: 'sarah.johnson@previouscompany.com',
          phone: '+1-555-0123',
          relationship: 'manager',
          yearsKnown: 3,
          canContact: true,
          contacted: false,
        },
        {
          id: 'ref-2',
          name: 'Mike Chen',
          title: 'Lead Developer',
          company: 'Another Company LLC',
          email: 'mike.chen@anothercompany.com',
          relationship: 'colleague',
          yearsKnown: 2,
          canContact: true,
          contacted: false,
        },
      ]

      // Create screening responses
      const screeningResponses = [
        {
          questionId: 'q1',
          question: 'How many years of React experience do you have?',
          response: 5,
          responseType: 'scale',
        },
        {
          questionId: 'q2',
          question: 'Are you authorized to work in the United States?',
          response: 'Yes',
          responseType: 'yes_no',
        },
        {
          questionId: 'q3',
          question: 'What is your expected salary range?',
          response: '$150,000 - $170,000',
          responseType: 'text',
        },
      ]

      // Create timeline events
      const timeline = [
        {
          id: 'timeline-1',
          type: 'application_submitted',
          title: 'Application Submitted',
          description: 'John Doe submitted application for Senior React Developer position',
          performedBy: 'applicant-123',
          performerName: 'John Doe',
          performerRole: 'applicant',
          createdAt: mockDate,
          isVisible: true,
          visibleTo: ['all'],
        },
        {
          id: 'timeline-2',
          type: 'status_changed',
          title: 'Status Updated',
          description: 'Application status changed from submitted to screening',
          performedBy: 'hr-manager-456',
          performerName: 'HR Manager',
          performerRole: 'hiring_manager',
          data: {
            oldStatus: 'submitted',
            newStatus: 'screening',
          },
          createdAt: new Date(mockDate.getTime() + 3600000), // 1 hour later
          isVisible: true,
          visibleTo: ['all'],
        },
      ]

      // Create complete job application
      const application: JobApplicationType = {
        id: 'app-john-doe-senior-react',
        jobId: 'job-senior-react-dev',
        applicantId: 'user-john-doe',
        status: 'screening',
        source: 'job_board',
        coverLetter: 'Dear Hiring Manager,\n\nI am excited to apply for the Senior React Developer position...',
        expectedSalary: 160000,
        availableStartDate: new Date('2024-03-01'),
        willingToRelocate: false,
        requiresSponsorship: false,
        screeningResponses,
        documents,
        references,
        currentStage: 'initial_screening',
        timeline,
        overallRating: 4,
        cultureFit: 4,
        technicalSkills: 5,
        communicationSkills: 4,
        isShortlisted: true,
        isFlagged: false,
        lastContactDate: mockDate,
        nextFollowUpDate: new Date(mockDate.getTime() + 7 * 24 * 3600000), // 7 days later
        communicationPreference: 'email',
        gdprConsent: true,
        dataRetentionConsent: true,
        marketingConsent: false,
        diversityData: {
          gender: 'Male',
          ethnicity: 'Asian',
          veteranStatus: false,
          disabilityStatus: false,
          age: 28,
          providedVoluntarily: true,
        },
        appId: 'app-techinnovations',
        createdAt: mockDate,
        updatedAt: new Date(mockDate.getTime() + 3600000),
        submittedAt: mockDate,
        viewCount: 5,
        lastViewedAt: new Date(mockDate.getTime() + 3600000),
      }

      // Validate the application
      expect(() => JobApplication.parse(application)).not.toThrow()
      const validatedApplication = JobApplication.parse(application)

      // Verify application structure
      expect(validatedApplication.jobId).toBe('job-senior-react-dev')
      expect(validatedApplication.applicantId).toBe('user-john-doe')
      expect(validatedApplication.status).toBe('screening')
      expect(validatedApplication.documents).toHaveLength(2)
      expect(validatedApplication.references).toHaveLength(2)
      expect(validatedApplication.screeningResponses).toHaveLength(3)
      expect(validatedApplication.timeline).toHaveLength(2)
      expect(validatedApplication.expectedSalary).toBe(160000)
      expect(validatedApplication.isShortlisted).toBe(true)
    })
  })

  describe('Freelance Project Workflow', () => {
    it('should create and validate complete freelance project workflow', () => {
      // Create client info
      const client = {
        id: 'client-startup-founder',
        name: 'Alice Smith',
        company: 'Startup Ventures Inc',
        avatar: 'https://example.com/avatars/alice.jpg',
        location: 'Austin, TX',
        timezone: 'America/Chicago',
        isVerified: true,
        paymentVerified: true,
        totalSpent: 25000,
        projectsPosted: 8,
        hireRate: 87.5,
        averageRating: 4.6,
        preferredCommunication: ['email', 'video'],
        workingHours: '9 AM - 6 PM CST',
        responseTime: 'within_hour',
      }

      // Create project budget
      const budget = {
        type: 'fixed_price',
        currency: 'USD',
        fixedAmount: 8000,
        isNegotiable: true,
        includesPlatformFee: false,
      }

      // Create skill requirements
      const skillsRequired = [
        {
          skill: 'React',
          level: 'advanced',
          required: true,
          yearsExperience: 4,
        },
        {
          skill: 'Node.js',
          level: 'intermediate',
          required: true,
          yearsExperience: 3,
        },
        {
          skill: 'UI/UX Design',
          level: 'intermediate',
          required: false,
          yearsExperience: 2,
        },
      ]

      // Create project milestones
      const milestones = [
        {
          id: 'milestone-1',
          title: 'Project Setup & Planning',
          description: 'Initial project setup, requirements analysis, and project planning',
          amount: 2000,
          status: 'pending',
          order: 1,
          deliverables: ['Project Plan', 'Technical Architecture', 'UI Wireframes'],
          createdAt: mockDate,
          updatedAt: mockDate,
        },
        {
          id: 'milestone-2',
          title: 'MVP Development',
          description: 'Develop minimum viable product with core features',
          amount: 4000,
          status: 'pending',
          order: 2,
          deliverables: ['Frontend Application', 'Backend API', 'Database Schema'],
          createdAt: mockDate,
          updatedAt: mockDate,
        },
        {
          id: 'milestone-3',
          title: 'Testing & Deployment',
          description: 'Testing, bug fixes, and deployment to production',
          amount: 2000,
          status: 'pending',
          order: 3,
          deliverables: ['Test Suite', 'Bug Fixes', 'Production Deployment'],
          createdAt: mockDate,
          updatedAt: mockDate,
        },
      ]

      // Create screening questions
      const screeningQuestions = [
        {
          id: 'q1',
          question: 'How many years of React experience do you have?',
          required: true,
        },
        {
          id: 'q2',
          question: 'Can you provide examples of similar projects you\'ve completed?',
          required: true,
        },
        {
          id: 'q3',
          question: 'What is your availability for this project?',
          required: false,
        },
      ]

      // Create project posting
      const projectPosting: ProjectPostingType = {
        id: 'project-react-dashboard',
        title: 'Build Modern React Dashboard for Analytics',
        slug: 'build-modern-react-dashboard-analytics',
        description: 'Looking for an experienced React developer to build a modern dashboard application for data analytics...',
        type: 'fixed_price',
        duration: 'three_to_six_months',
        requiredExperience: 'expert',
        category: 'web_development',
        subcategory: 'frontend_development',
        budget,
        skillsRequired,
        responsibilities: [
          'Design and develop responsive React dashboard',
          'Implement data visualization components',
          'Integrate with REST APIs',
          'Ensure cross-browser compatibility',
          'Write comprehensive documentation',
        ],
        deliverables: [
          'Complete React dashboard application',
          'Source code with documentation',
          'Deployment guide',
          'User manual',
        ],
        client,
        location: 'Remote',
        isRemote: true,
        timezoneRequirement: 'Americas timezones preferred',
        proposalDeadline: new Date(mockDate.getTime() + 14 * 24 * 3600000), // 14 days
        maxProposals: 20,
        connectsRequired: 2,
        screeningQuestions,
        status: 'open',
        isVisible: true,
        isFeatured: true,
        isUrgent: false,
        tags: ['react', 'dashboard', 'data-visualization', 'frontend'],
        appId: 'app-startupventures',
        createdAt: mockDate,
        updatedAt: mockDate,
        publishedAt: mockDate,
        milestones,
        views: 45,
        proposals: 12,
        hired: 0,
      }

      // Validate the project posting
      expect(() => ProjectPosting.parse(projectPosting)).not.toThrow()
      const validatedProject = ProjectPosting.parse(projectPosting)

      // Verify project structure
      expect(validatedProject.title).toBe('Build Modern React Dashboard for Analytics')
      expect(validatedProject.client.name).toBe('Alice Smith')
      expect(validatedProject.budget.fixedAmount).toBe(8000)
      expect(validatedProject.skillsRequired).toHaveLength(3)
      expect(validatedProject.milestones).toHaveLength(3)
      expect(validatedProject.screeningQuestions).toHaveLength(3)
      expect(validatedProject.isRemote).toBe(true)

      // Create project proposal
      const freelancerSnapshot = {
        name: 'David Rodriguez',
        avatar: 'https://example.com/avatars/david.jpg',
        title: 'Senior Full Stack Developer',
        hourlyRate: 85,
        rating: 4.9,
        completedProjects: 47,
        successRate: 98,
        responseTime: 'within 2 hours',
        skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AWS'],
      }

      const proposedMilestones = [
        {
          title: 'Discovery & Planning',
          description: 'Requirements gathering and technical planning',
          amount: 1800,
          dueDate: new Date(mockDate.getTime() + 7 * 24 * 3600000),
          deliverables: ['Technical Specification', 'Project Timeline', 'Wireframes'],
        },
        {
          title: 'Core Development',
          description: 'Build main dashboard features and components',
          amount: 4200,
          dueDate: new Date(mockDate.getTime() + 30 * 24 * 3600000),
          deliverables: ['Dashboard UI', 'Data Integration', 'Core Features'],
        },
        {
          title: 'Polish & Launch',
          description: 'Testing, optimization, and deployment',
          amount: 2000,
          dueDate: new Date(mockDate.getTime() + 45 * 24 * 3600000),
          deliverables: ['Testing Suite', 'Performance Optimization', 'Deployment'],
        },
      ]

      const portfolioItems = [
        {
          title: 'E-commerce Analytics Dashboard',
          url: 'https://portfolio.example.com/ecommerce-dashboard',
          description: 'React dashboard for e-commerce analytics with real-time data visualization',
          thumbnail: 'https://portfolio.example.com/thumbs/ecommerce-dashboard.jpg',
        },
        {
          title: 'Financial Data Visualization Platform',
          url: 'https://portfolio.example.com/financial-platform',
          description: 'Complex financial data visualization built with React and D3.js',
          thumbnail: 'https://portfolio.example.com/thumbs/financial-platform.jpg',
        },
      ]

      const screeningResponses = [
        {
          questionId: 'q1',
          response: 'I have 6 years of professional React experience, working on various dashboard and data visualization projects.',
        },
        {
          questionId: 'q2',
          response: 'Yes, I have completed several similar projects. Please check my portfolio items for examples.',
        },
        {
          questionId: 'q3',
          response: 'I can dedicate 30-35 hours per week to this project and am available to start immediately.',
        },
      ]

      const projectProposal: ProjectProposalType = {
        id: 'proposal-david-react-dashboard',
        projectId: 'project-react-dashboard',
        freelancerId: 'freelancer-david-rodriguez',
        coverLetter: 'Dear Alice,\n\nI am excited to propose my services for your React dashboard project...',
        proposedBudget: {
          amount: 8000,
          currency: 'USD',
          type: 'fixed_price',
          justification: 'This estimate is based on the complexity of the requirements and my experience with similar projects.',
        },
        estimatedDelivery: new Date(mockDate.getTime() + 60 * 24 * 3600000), // 60 days
        proposedMilestones,
        relevantExperience: 'I have 6+ years of React development experience and have built numerous dashboard applications...',
        portfolioItems,
        screeningResponses,
        status: 'submitted',
        freelancerSnapshot,
        clientViewed: false,
        connectsSpent: 2,
        createdAt: mockDate,
        updatedAt: mockDate,
        submittedAt: mockDate,
      }

      // Validate the proposal
      expect(() => ProjectProposal.parse(projectProposal)).not.toThrow()
      const validatedProposal = ProjectProposal.parse(projectProposal)

      // Verify proposal structure
      expect(validatedProposal.projectId).toBe('project-react-dashboard')
      expect(validatedProposal.freelancerId).toBe('freelancer-david-rodriguez')
      expect(validatedProposal.proposedBudget.amount).toBe(8000)
      expect(validatedProposal.proposedMilestones).toHaveLength(3)
      expect(validatedProposal.portfolioItems).toHaveLength(2)
      expect(validatedProposal.screeningResponses).toHaveLength(3)
      expect(validatedProposal.freelancerSnapshot.name).toBe('David Rodriguez')
      expect(validatedProposal.freelancerSnapshot.rating).toBe(4.9)
    })
  })

  describe('Job Board Configuration', () => {
    it('should create and validate comprehensive job board configuration', () => {
      const config: JobBoardConfig = {
        database: {
          url: 'postgresql://user:pass@localhost:5432/jobboard',
          apiKey: 'api-key-123',
          schema: 'public',
        },
        search: {
          provider: 'elasticsearch',
          apiKey: 'es-api-key',
          indexName: 'job-board-search',
          enableGeoSearch: true,
          enableAutoComplete: true,
          enableSavedSearches: true,
        },
        matching: {
          enableAIMatching: true,
          skillWeighting: 0.35,
          locationWeighting: 0.15,
          experienceWeighting: 0.25,
          salaryWeighting: 0.15,
          cultureWeighting: 0.1,
          refreshInterval: 30,
        },
        storage: {
          provider: 'aws',
          bucket: 'job-board-uploads',
          region: 'us-west-2',
          maxFileSize: 10485760,
          allowedFileTypes: ['pdf', 'doc', 'docx', 'txt'],
          virusScanning: true,
          resumeParsing: true,
        },
        email: {
          provider: 'sendgrid',
          apiKey: 'sg-api-key',
          from: 'noreply@jobboard.com',
          templates: {
            applicationReceived: 'app-received-v1',
            statusUpdate: 'status-update-v1',
            interviewScheduled: 'interview-scheduled-v1',
            offerExtended: 'offer-extended-v1',
            jobAlert: 'job-alert-v1',
          },
        },
        payment: {
          provider: 'stripe',
          apiKey: 'sk_live_key',
          webhookSecret: 'whsec_live_secret',
          escrowEnabled: true,
          platformFeePercentage: 8,
          processingFeePercentage: 2.9,
          enableDisputes: true,
        },
        videoInterview: {
          provider: 'zoom',
          apiKey: 'zoom-jwt-token',
          enableRecording: true,
          enableScreenSharing: true,
          maxDuration: 180,
        },
        timeTracking: {
          enabled: true,
          screenshotInterval: 15,
          activityTracking: true,
          enableManualEntry: true,
          requireApproval: true,
        },
        analytics: {
          enabled: true,
          provider: 'google',
          trackingId: 'GA-123456789',
          enableHeatmaps: true,
          enableConversionTracking: true,
        },
        security: {
          rateLimit: {
            enabled: true,
            applicationsPerDay: 25,
            proposalsPerDay: 15,
            messagesPerHour: 60,
          },
          verification: {
            requireEmailVerification: true,
            requirePhoneVerification: true,
            requireIdentityVerification: false,
            enableBackgroundChecks: true,
          },
          privacy: {
            enableGDPR: true,
            dataRetentionDays: 730,
            enableRightToDelete: true,
            enableDataExport: true,
          },
        },
        features: {
          jobBoard: {
            enabled: true,
            enableSalaryTransparency: true,
            enableApplicationTracking: true,
            enableVideoInterviews: true,
            enableAssessments: true,
            enableReferrals: true,
          },
          freelanceMarketplace: {
            enabled: true,
            enableProposals: true,
            enableContracts: true,
            enableTimeTracking: true,
            enableMilestones: true,
            enableDisputes: true,
          },
          matching: {
            enableAIRecommendations: true,
            enableJobAlerts: true,
            enableTalentPipeline: true,
            enableSkillAssessments: true,
          },
          social: {
            enableRatings: true,
            enableReviews: true,
            enablePortfolios: true,
            enableNetworking: true,
            enableReferrals: true,
          },
        },
        localization: {
          defaultLanguage: 'en',
          supportedLanguages: ['en', 'es', 'fr', 'de', 'it'],
          defaultCurrency: 'USD',
          supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
          enableLocationBasedPricing: true,
          timezoneHandling: 'auto',
        },
        integrations: {
          ats: {
            enabled: true,
            providers: ['greenhouse', 'lever', 'workday'],
          },
          hrms: {
            enabled: true,
            providers: ['bamboohr', 'namely', 'zenefits'],
          },
          accounting: {
            enabled: true,
            providers: ['quickbooks', 'xero', 'freshbooks'],
          },
          socialMedia: {
            enableLinkedInImport: true,
            enableGitHubImport: true,
            enableAutoPosting: true,
          },
          apis: {
            enabled: true,
            rateLimit: 10000,
            requireAuthentication: true,
            enableWebhooks: true,
          },
        },
        performance: {
          caching: {
            enabled: true,
            provider: 'redis',
            ttl: 3600,
          },
          cdn: {
            enabled: true,
            provider: 'cloudflare',
            domain: 'cdn.jobboard.com',
          },
          optimization: {
            enableLazyLoading: true,
            enableImageOptimization: true,
            enableBundleSplitting: true,
          },
        },
        moderation: {
          enableAutoModeration: true,
          flaggedContentAction: 'review',
          enableSpamFilter: true,
          enableDuplicateDetection: true,
          moderators: ['admin-1', 'admin-2', 'moderator-1'],
        },
        custom: {
          brandPrimary: '#007bff',
          brandSecondary: '#6c757d',
          enableCustomBranding: true,
          customDomain: 'jobs.company.com',
        },
      }

      // Validate configuration - this should not throw since it's a type-only interface
      expect(config.database.url).toBe('postgresql://user:pass@localhost:5432/jobboard')
      expect(config.features.jobBoard.enabled).toBe(true)
      expect(config.payment.platformFeePercentage).toBe(8)
      expect(config.localization.supportedLanguages).toHaveLength(5)
      expect(config.custom?.brandPrimary).toBe('#007bff')
    })
  })

  describe('Search and Filtering', () => {
    it('should create and validate job search filters', () => {
      const filters: JobSearchFilters = {
        keywords: 'senior react developer',
        location: 'San Francisco, CA',
        radius: 25,
        employmentTypes: ['full_time', 'contract'],
        experienceLevels: ['senior', 'lead'],
        categories: ['technology', 'design'],
        workArrangements: ['remote', 'hybrid'],
        salaryMin: 120000,
        salaryMax: 200000,
        salaryCurrency: 'USD',
        datePosted: 'month',
        companySize: ['51-200', '201-500'],
        benefits: ['health_insurance', 'retirement_plan', 'remote_work'],
        skills: ['React', 'TypeScript', 'Node.js', 'AWS'],
        isRemote: true,
        hasVisaSponsorship: false,
        languages: ['English'],
      }

      expect(filters.keywords).toBe('senior react developer')
      expect(filters.employmentTypes).toEqual(['full_time', 'contract'])
      expect(filters.salaryMin).toBe(120000)
      expect(filters.skills).toHaveLength(4)
    })

    it('should create and validate freelance search filters', () => {
      const filters: FreelanceSearchFilters = {
        keywords: 'react dashboard development',
        location: 'Remote',
        skills: ['React', 'JavaScript', 'CSS'],
        experienceLevel: ['intermediate', 'expert'],
        projectTypes: ['fixed_price', 'milestone'],
        budgetMin: 2000,
        budgetMax: 15000,
        currency: 'USD',
        duration: ['one_to_three_months', 'three_to_six_months'],
        isRemote: true,
        categories: ['web_development', 'ui_ux_design'],
        datePosted: 'week',
        clientVerified: true,
        paymentVerified: true,
      }

      expect(filters.keywords).toBe('react dashboard development')
      expect(filters.projectTypes).toEqual(['fixed_price', 'milestone'])
      expect(filters.budgetMin).toBe(2000)
      expect(filters.skills).toHaveLength(3)
    })
  })

  describe('Matching and Recommendations', () => {
    it('should create and validate job matching data', () => {
      const matchingScore: MatchingScore = {
        overall: 0.87,
        breakdown: {
          skills: 0.92,
          experience: 0.85,
          location: 0.90,
          salary: 0.78,
          culture: 0.88,
          availability: 0.95,
        },
        reasons: [
          'Excellent match in React and TypeScript skills',
          'Experience level aligns perfectly with senior requirements',
          'Located in preferred geographic area',
          'Salary expectations within budget range',
          'Strong culture fit based on values assessment',
        ],
      }

      const jobMatch: JobMatch = {
        jobId: 'job-senior-react-dev',
        candidateId: 'candidate-john-doe',
        score: matchingScore,
        confidence: 0.91,
        explanation: 'This candidate demonstrates exceptional skills in React and TypeScript with 5+ years of experience. Their background in building scalable web applications and leadership experience make them an ideal fit for this senior role.',
        calculatedAt: mockDate,
      }

      const talentMatch: TalentMatch = {
        candidateId: 'candidate-jane-smith',
        jobId: 'job-frontend-lead',
        score: {
          overall: 0.83,
          breakdown: {
            skills: 0.88,
            experience: 0.82,
            location: 0.75,
            salary: 0.85,
            culture: 0.90,
            availability: 0.80,
          },
          reasons: [
            'Strong frontend development skills',
            'Leadership experience matches requirements',
            'Remote work preference aligns with role',
          ],
        },
        confidence: 0.85,
        explanation: 'Strong candidate with proven leadership in frontend development teams.',
        calculatedAt: mockDate,
      }

      expect(matchingScore.overall).toBe(0.87)
      expect(matchingScore.breakdown.skills).toBe(0.92)
      expect(matchingScore.reasons).toHaveLength(5)
      expect(jobMatch.confidence).toBe(0.91)
      expect(talentMatch.candidateId).toBe('candidate-jane-smith')
    })
  })

  describe('API Responses and Events', () => {
    it('should create and validate API response structures', () => {
      const successResponse: JobBoardApiResponse<{ jobs: JobPostingType[] }> = {
        success: true,
        data: {
          jobs: [
            // Mock job data would go here
          ],
        },
        pagination: {
          page: 1,
          limit: 20,
          total: 156,
          pages: 8,
        },
        metadata: {
          searchTime: 0.45,
          filtersApplied: ['location', 'salary', 'experience'],
          totalFiltered: 156,
        },
      }

      const errorResponse: JobBoardApiResponse<null> = {
        success: false,
        error: {
          code: 'INVALID_SEARCH_PARAMS',
          message: 'Invalid search parameters provided',
          details: {
            field: 'salaryMin',
            value: -1000,
            constraint: 'must be greater than 0',
          },
        },
      }

      expect(successResponse.success).toBe(true)
      expect(successResponse.pagination?.total).toBe(156)
      expect(errorResponse.success).toBe(false)
      expect(errorResponse.error?.code).toBe('INVALID_SEARCH_PARAMS')
    })

    it('should create and validate job board events', () => {
      const applicationEvent: JobBoardEvent = {
        type: 'application_submitted',
        entity: 'application',
        action: 'create',
        entityId: 'app-123',
        userId: 'user-456',
        data: {
          jobId: 'job-789',
          jobTitle: 'Senior React Developer',
          applicantEmail: 'john@example.com',
          source: 'job_board',
        },
        timestamp: mockDate,
        metadata: {
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          ipAddress: '192.168.1.100',
          sessionId: 'session-abc123',
        },
      }

      const hiringEvent: JobBoardEvent = {
        type: 'candidate_hired',
        entity: 'job',
        action: 'hire',
        entityId: 'job-789',
        userId: 'user-hr-manager',
        data: {
          hiredCandidateId: 'user-456',
          applicationId: 'app-123',
          startDate: '2024-03-01',
          salary: 150000,
        },
        timestamp: new Date(mockDate.getTime() + 30 * 24 * 3600000),
        metadata: {
          department: 'Engineering',
          position: 'Senior React Developer',
        },
      }

      expect(applicationEvent.type).toBe('application_submitted')
      expect(applicationEvent.entity).toBe('application')
      expect(applicationEvent.data.jobId).toBe('job-789')
      expect(hiringEvent.action).toBe('hire')
      expect(hiringEvent.data.salary).toBe(150000)
    })

    it('should create and validate notifications', () => {
      const notification: JobBoardNotification = {
        id: 'notification-123',
        userId: 'user-456',
        type: 'interview_scheduled',
        title: 'Interview Scheduled',
        message: 'Your interview for Senior React Developer position has been scheduled for January 15, 2024 at 2:00 PM PST.',
        data: {
          jobId: 'job-789',
          applicationId: 'app-123',
          interviewId: 'interview-456',
          interviewType: 'video',
          scheduledAt: '2024-01-15T14:00:00-08:00',
          meetingLink: 'https://zoom.us/j/1234567890',
          interviewers: ['hr-manager', 'tech-lead'],
        },
        isRead: false,
        createdAt: mockDate,
        expiresAt: new Date(mockDate.getTime() + 30 * 24 * 3600000),
      }

      expect(notification.type).toBe('interview_scheduled')
      expect(notification.title).toBe('Interview Scheduled')
      expect(notification.data.interviewType).toBe('video')
      expect(notification.isRead).toBe(false)
    })
  })
})