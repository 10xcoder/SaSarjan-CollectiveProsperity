import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import {
  EmploymentType,
  EmploymentTypeType,
  ExperienceLevel,
  ExperienceLevelType,
  JobStatus,
  JobStatusType,
  SalaryPeriod,
  SalaryPeriodType,
  WorkArrangement,
  WorkArrangementType,
  JobCategory,
  JobCategoryType,
  ApplicationMethod,
  ApplicationMethodType,
  JobRequirement,
  JobRequirementType,
  JobBenefit,
  JobBenefitType,
  SalaryInfo,
  SalaryInfoType,
  CompanyInfo,
  CompanyInfoType,
  JobLocation,
  JobLocationType,
  ApplicationDeadline,
  ApplicationDeadlineType,
  JobMetrics,
  JobMetricsType,
  ScreeningQuestion,
  ScreeningQuestionType,
  JobPosting,
  JobPostingType,
} from '../../src/types/job'

describe('Job Types', () => {
  describe('EmploymentType', () => {
    it('should accept valid employment types', () => {
      const validTypes = [
        'full_time',
        'part_time',
        'contract',
        'temporary',
        'internship',
        'fellowship',
        'volunteer',
        'remote',
        'hybrid',
        'freelance',
        'gig',
      ]

      validTypes.forEach(type => {
        expect(() => EmploymentType.parse(type)).not.toThrow()
      })
    })

    it('should reject invalid employment types', () => {
      const invalidTypes = ['invalid', 'full-time', 'part-time', '']

      invalidTypes.forEach(type => {
        expect(() => EmploymentType.parse(type)).toThrow()
      })
    })
  })

  describe('ExperienceLevel', () => {
    it('should accept valid experience levels', () => {
      const validLevels = [
        'entry',
        'junior',
        'mid',
        'senior',
        'lead',
        'principal',
        'director',
        'executive',
        'student',
        'recent_graduate',
        'any',
      ]

      validLevels.forEach(level => {
        expect(() => ExperienceLevel.parse(level)).not.toThrow()
      })
    })

    it('should reject invalid experience levels', () => {
      const invalidLevels = ['beginner', 'intermediate', 'advanced', '']

      invalidLevels.forEach(level => {
        expect(() => ExperienceLevel.parse(level)).toThrow()
      })
    })
  })

  describe('JobStatus', () => {
    it('should accept valid job statuses', () => {
      const validStatuses = [
        'draft',
        'active',
        'paused',
        'closed',
        'filled',
        'expired',
        'cancelled',
      ]

      validStatuses.forEach(status => {
        expect(() => JobStatus.parse(status)).not.toThrow()
      })
    })

    it('should reject invalid job statuses', () => {
      const invalidStatuses = ['open', 'pending', 'inactive', '']

      invalidStatuses.forEach(status => {
        expect(() => JobStatus.parse(status)).toThrow()
      })
    })
  })

  describe('SalaryPeriod', () => {
    it('should accept valid salary periods', () => {
      const validPeriods = [
        'hourly',
        'daily',
        'weekly',
        'monthly',
        'annually',
        'project',
      ]

      validPeriods.forEach(period => {
        expect(() => SalaryPeriod.parse(period)).not.toThrow()
      })
    })

    it('should reject invalid salary periods', () => {
      const invalidPeriods = ['yearly', 'per_hour', 'per_day', '']

      invalidPeriods.forEach(period => {
        expect(() => SalaryPeriod.parse(period)).toThrow()
      })
    })
  })

  describe('WorkArrangement', () => {
    it('should accept valid work arrangements', () => {
      const validArrangements = ['on_site', 'remote', 'hybrid', 'flexible']

      validArrangements.forEach(arrangement => {
        expect(() => WorkArrangement.parse(arrangement)).not.toThrow()
      })
    })

    it('should reject invalid work arrangements', () => {
      const invalidArrangements = ['onsite', 'work_from_home', 'office', '']

      invalidArrangements.forEach(arrangement => {
        expect(() => WorkArrangement.parse(arrangement)).toThrow()
      })
    })
  })

  describe('JobCategory', () => {
    it('should accept valid job categories', () => {
      const validCategories = [
        'technology',
        'healthcare',
        'education',
        'finance',
        'marketing',
        'design',
        'social_impact',
        'cultural_preservation',
        'spiritual_growth',
        'general',
      ]

      validCategories.forEach(category => {
        expect(() => JobCategory.parse(category)).not.toThrow()
      })
    })

    it('should reject invalid job categories', () => {
      const invalidCategories = ['tech', 'medical', 'it', '']

      invalidCategories.forEach(category => {
        expect(() => JobCategory.parse(category)).toThrow()
      })
    })
  })

  describe('ApplicationMethod', () => {
    it('should accept valid application methods', () => {
      const validMethods = ['internal', 'external', 'email', 'both']

      validMethods.forEach(method => {
        expect(() => ApplicationMethod.parse(method)).not.toThrow()
      })
    })

    it('should reject invalid application methods', () => {
      const invalidMethods = ['direct', 'website', 'phone', '']

      invalidMethods.forEach(method => {
        expect(() => ApplicationMethod.parse(method)).toThrow()
      })
    })
  })

  describe('JobRequirement', () => {
    it('should create valid job requirement', () => {
      const validRequirement = {
        type: 'skill',
        name: 'JavaScript',
        description: 'Proficiency in JavaScript',
        level: 'intermediate',
        required: true,
        yearsExperience: 3,
      }

      expect(() => JobRequirement.parse(validRequirement)).not.toThrow()
      const parsed = JobRequirement.parse(validRequirement)
      expect(parsed.type).toBe('skill')
      expect(parsed.name).toBe('JavaScript')
      expect(parsed.required).toBe(true)
    })

    it('should use default values for optional fields', () => {
      const minimalRequirement = {
        type: 'skill',
        name: 'React',
      }

      const parsed = JobRequirement.parse(minimalRequirement)
      expect(parsed.required).toBe(true) // default value
    })

    it('should reject invalid requirement types', () => {
      const invalidRequirement = {
        type: 'invalid_type',
        name: 'Test',
      }

      expect(() => JobRequirement.parse(invalidRequirement)).toThrow()
    })
  })

  describe('JobBenefit', () => {
    it('should create valid job benefit', () => {
      const validBenefit = {
        type: 'health_insurance',
        name: 'Health Insurance',
        description: '100% coverage for employee and family',
        value: '$500/month',
      }

      expect(() => JobBenefit.parse(validBenefit)).not.toThrow()
      const parsed = JobBenefit.parse(validBenefit)
      expect(parsed.type).toBe('health_insurance')
      expect(parsed.name).toBe('Health Insurance')
    })

    it('should accept all valid benefit types', () => {
      const validBenefitTypes = [
        'health_insurance',
        'dental_insurance',
        'vision_insurance',
        'life_insurance',
        'retirement_plan',
        'paid_time_off',
        'sick_leave',
        'parental_leave',
        'flexible_schedule',
        'remote_work',
        'professional_development',
        'tuition_reimbursement',
        'gym_membership',
        'meal_allowance',
        'transportation',
        'stock_options',
        'bonus',
        'commission',
        'profit_sharing',
        'other',
      ]

      validBenefitTypes.forEach(type => {
        const benefit = { type, name: `Test ${type}` }
        expect(() => JobBenefit.parse(benefit)).not.toThrow()
      })
    })
  })

  describe('SalaryInfo', () => {
    it('should create valid salary info with defaults', () => {
      const validSalary = {
        period: 'annually',
        min: 50000,
        max: 80000,
      }

      const parsed = SalaryInfo.parse(validSalary)
      expect(parsed.currency).toBe('USD') // default
      expect(parsed.isNegotiable).toBe(true) // default
      expect(parsed.includesBenefits).toBe(false) // default
      expect(parsed.displaySalary).toBe(true) // default
    })

    it('should accept exact salary without range', () => {
      const exactSalary = {
        period: 'monthly',
        exact: 5000,
        currency: 'EUR',
      }

      expect(() => SalaryInfo.parse(exactSalary)).not.toThrow()
      const parsed = SalaryInfo.parse(exactSalary)
      expect(parsed.exact).toBe(5000)
      expect(parsed.currency).toBe('EUR')
    })

    it('should reject invalid salary periods', () => {
      const invalidSalary = {
        period: 'invalid_period',
        min: 1000,
      }

      expect(() => SalaryInfo.parse(invalidSalary)).toThrow()
    })
  })

  describe('CompanyInfo', () => {
    it('should create valid company info', () => {
      const validCompany = {
        id: 'company-123',
        name: 'Tech Corp',
        description: 'A leading technology company',
        website: 'https://techcorp.com',
        logo: 'https://techcorp.com/logo.png',
        size: '51-200',
        industry: 'Technology',
        founded: 2010,
        location: 'San Francisco, CA',
        culture: ['innovative', 'collaborative'],
        techStack: ['React', 'Node.js', 'PostgreSQL'],
        socialLinks: {
          linkedin: 'https://linkedin.com/company/techcorp',
          github: 'https://github.com/techcorp',
        },
      }

      expect(() => CompanyInfo.parse(validCompany)).not.toThrow()
      const parsed = CompanyInfo.parse(validCompany)
      expect(parsed.id).toBe('company-123')
      expect(parsed.name).toBe('Tech Corp')
      expect(parsed.techStack).toEqual(['React', 'Node.js', 'PostgreSQL'])
    })

    it('should require valid URLs for website and logo', () => {
      const invalidCompany = {
        id: 'company-123',
        name: 'Tech Corp',
        website: 'invalid-url',
      }

      expect(() => CompanyInfo.parse(invalidCompany)).toThrow()
    })

    it('should accept minimal company info', () => {
      const minimalCompany = {
        id: 'company-456',
        name: 'Simple Corp',
      }

      expect(() => CompanyInfo.parse(minimalCompany)).not.toThrow()
    })
  })

  describe('JobLocation', () => {
    it('should create valid job location', () => {
      const validLocation = {
        country: 'United States',
        state: 'California',
        city: 'San Francisco',
        address: '123 Tech Street',
        postalCode: '94105',
        coordinates: {
          latitude: 37.7749,
          longitude: -122.4194,
        },
        timezone: 'America/Los_Angeles',
        isRemote: false,
      }

      expect(() => JobLocation.parse(validLocation)).not.toThrow()
      const parsed = JobLocation.parse(validLocation)
      expect(parsed.country).toBe('United States')
      expect(parsed.isRemote).toBe(false)
    })

    it('should use default values for optional fields', () => {
      const minimalLocation = {
        country: 'India',
      }

      const parsed = JobLocation.parse(minimalLocation)
      expect(parsed.isRemote).toBe(false) // default
    })

    it('should accept remote job location', () => {
      const remoteLocation = {
        country: 'Global',
        isRemote: true,
        remoteRestrictions: ['US', 'Canada', 'Europe'],
      }

      expect(() => JobLocation.parse(remoteLocation)).not.toThrow()
      const parsed = JobLocation.parse(remoteLocation)
      expect(parsed.isRemote).toBe(true)
      expect(parsed.remoteRestrictions).toEqual(['US', 'Canada', 'Europe'])
    })
  })

  describe('ApplicationDeadline', () => {
    it('should create valid application deadline', () => {
      const validDeadline = {
        date: new Date('2024-12-31'),
        type: 'date',
        timezone: 'America/New_York',
      }

      expect(() => ApplicationDeadline.parse(validDeadline)).not.toThrow()
      const parsed = ApplicationDeadline.parse(validDeadline)
      expect(parsed.type).toBe('date')
    })

    it('should use default type for rolling deadline', () => {
      const rollingDeadline = {}

      const parsed = ApplicationDeadline.parse(rollingDeadline)
      expect(parsed.type).toBe('rolling') // default
    })

    it('should accept until_filled type', () => {
      const untilFilledDeadline = {
        type: 'until_filled',
      }

      expect(() => ApplicationDeadline.parse(untilFilledDeadline)).not.toThrow()
    })
  })

  describe('JobMetrics', () => {
    it('should create valid job metrics with defaults', () => {
      const validMetrics = {
        lastUpdated: new Date(),
      }

      const parsed = JobMetrics.parse(validMetrics)
      expect(parsed.views).toBe(0) // default
      expect(parsed.applications).toBe(0) // default
      expect(parsed.bookmarks).toBe(0) // default
      expect(parsed.qualityScore).toBe(0) // default
    })

    it('should accept custom metric values', () => {
      const customMetrics = {
        views: 100,
        applications: 25,
        bookmarks: 15,
        shares: 5,
        clickThroughRate: 0.15,
        applicationRate: 0.25,
        qualityScore: 85,
        lastUpdated: new Date(),
      }

      expect(() => JobMetrics.parse(customMetrics)).not.toThrow()
      const parsed = JobMetrics.parse(customMetrics)
      expect(parsed.views).toBe(100)
      expect(parsed.applications).toBe(25)
      expect(parsed.qualityScore).toBe(85)
    })
  })

  describe('ScreeningQuestion', () => {
    it('should create valid screening question', () => {
      const validQuestion = {
        id: 'question-1',
        question: 'Do you have experience with React?',
        type: 'yes_no',
        required: true,
        order: 1,
      }

      expect(() => ScreeningQuestion.parse(validQuestion)).not.toThrow()
      const parsed = ScreeningQuestion.parse(validQuestion)
      expect(parsed.type).toBe('yes_no')
      expect(parsed.required).toBe(true)
    })

    it('should accept multiple choice question with options', () => {
      const multipleChoiceQuestion = {
        id: 'question-2',
        question: 'What is your preferred programming language?',
        type: 'multiple_choice',
        options: ['JavaScript', 'Python', 'Java', 'C++'],
        required: false,
        order: 2,
      }

      expect(() => ScreeningQuestion.parse(multipleChoiceQuestion)).not.toThrow()
      const parsed = ScreeningQuestion.parse(multipleChoiceQuestion)
      expect(parsed.options).toEqual(['JavaScript', 'Python', 'Java', 'C++'])
    })

    it('should accept file upload question', () => {
      const fileUploadQuestion = {
        id: 'question-3',
        question: 'Please upload your portfolio',
        type: 'file_upload',
        fileTypes: ['pdf', 'doc', 'docx'],
        required: true,
        order: 3,
      }

      expect(() => ScreeningQuestion.parse(fileUploadQuestion)).not.toThrow()
      const parsed = ScreeningQuestion.parse(fileUploadQuestion)
      expect(parsed.fileTypes).toEqual(['pdf', 'doc', 'docx'])
    })

    it('should use default required value', () => {
      const question = {
        id: 'question-4',
        question: 'Tell us about yourself',
        type: 'text',
        order: 4,
      }

      const parsed = ScreeningQuestion.parse(question)
      expect(parsed.required).toBe(false) // default
    })
  })

  describe('JobPosting', () => {
    it('should create valid complete job posting', () => {
      const validJobPosting = {
        id: 'job-123',
        title: 'Senior Software Engineer',
        slug: 'senior-software-engineer',
        description: 'We are looking for a senior software engineer...',
        shortDescription: 'Senior software engineer position',
        employmentType: 'full_time',
        experienceLevel: 'senior',
        category: 'technology',
        workArrangement: 'hybrid',
        company: {
          id: 'company-123',
          name: 'Tech Corp',
        },
        location: {
          country: 'United States',
          state: 'California',
          city: 'San Francisco',
        },
        requirements: [
          {
            type: 'skill',
            name: 'JavaScript',
            required: true,
          },
        ],
        responsibilities: [
          'Design and implement software solutions',
          'Collaborate with cross-functional teams',
        ],
        benefits: [
          {
            type: 'health_insurance',
            name: 'Health Insurance',
          },
        ],
        applicationMethod: 'internal',
        applicationDeadline: {
          type: 'rolling',
        },
        status: 'active',
        tags: ['javascript', 'react', 'node.js'],
        appId: 'app-123',
        postedBy: 'user-123',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      }

      expect(() => JobPosting.parse(validJobPosting)).not.toThrow()
      const parsed = JobPosting.parse(validJobPosting)
      expect(parsed.id).toBe('job-123')
      expect(parsed.title).toBe('Senior Software Engineer')
      expect(parsed.employmentType).toBe('full_time')
      expect(parsed.isVisible).toBe(true) // default
      expect(parsed.isFeatured).toBe(false) // default
    })

    it('should accept job posting with salary information', () => {
      const jobWithSalary = {
        id: 'job-456',
        title: 'Frontend Developer',
        slug: 'frontend-developer',
        description: 'Frontend developer position',
        employmentType: 'full_time',
        experienceLevel: 'mid',
        category: 'technology',
        workArrangement: 'remote',
        company: {
          id: 'company-456',
          name: 'Startup Inc',
        },
        location: {
          country: 'United States',
          isRemote: true,
        },
        requirements: [],
        responsibilities: ['Build user interfaces'],
        benefits: [],
        salary: {
          period: 'annually',
          min: 70000,
          max: 90000,
          currency: 'USD',
        },
        applicationMethod: 'internal',
        applicationDeadline: {
          type: 'rolling',
        },
        status: 'active',
        tags: ['frontend', 'react'],
        appId: 'app-456',
        postedBy: 'user-456',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      }

      expect(() => JobPosting.parse(jobWithSalary)).not.toThrow()
      const parsed = JobPosting.parse(jobWithSalary)
      expect(parsed.salary?.min).toBe(70000)
      expect(parsed.salary?.max).toBe(90000)
    })

    it('should accept job posting with screening questions', () => {
      const jobWithScreening = {
        id: 'job-789',
        title: 'Data Scientist',
        slug: 'data-scientist',
        description: 'Data scientist position',
        employmentType: 'full_time',
        experienceLevel: 'senior',
        category: 'technology',
        workArrangement: 'hybrid',
        company: {
          id: 'company-789',
          name: 'Data Corp',
        },
        location: {
          country: 'United States',
        },
        requirements: [],
        responsibilities: ['Analyze data'],
        benefits: [],
        applicationMethod: 'internal',
        applicationDeadline: {
          type: 'rolling',
        },
        screeningQuestions: [
          {
            id: 'q1',
            question: 'Do you have experience with Python?',
            type: 'yes_no',
            required: true,
            order: 1,
          },
          {
            id: 'q2',
            question: 'What is your experience level with machine learning?',
            type: 'multiple_choice',
            options: ['Beginner', 'Intermediate', 'Advanced'],
            required: false,
            order: 2,
          },
        ],
        status: 'active',
        tags: ['python', 'machine-learning'],
        appId: 'app-789',
        postedBy: 'user-789',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      }

      expect(() => JobPosting.parse(jobWithScreening)).not.toThrow()
      const parsed = JobPosting.parse(jobWithScreening)
      expect(parsed.screeningQuestions).toHaveLength(2)
      expect(parsed.screeningQuestions![0].question).toBe('Do you have experience with Python?')
    })

    it('should accept job posting with prosperity impact', () => {
      const jobWithProsperity = {
        id: 'job-impact',
        title: 'Social Impact Developer',
        slug: 'social-impact-developer',
        description: 'Developer for social impact projects',
        employmentType: 'full_time',
        experienceLevel: 'mid',
        category: 'social_impact',
        workArrangement: 'remote',
        company: {
          id: 'company-impact',
          name: 'Impact Organization',
        },
        location: {
          country: 'Global',
          isRemote: true,
        },
        requirements: [],
        responsibilities: ['Build social impact solutions'],
        benefits: [],
        applicationMethod: 'internal',
        applicationDeadline: {
          type: 'rolling',
        },
        status: 'active',
        tags: ['social-impact', 'nonprofit'],
        appId: 'app-impact',
        postedBy: 'user-impact',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        prosperityImpact: {
          category: 'social_connection',
          impactDescription: 'Building platforms to connect communities',
          communityBenefit: 'Strengthening social bonds',
          sustainabilityFocus: true,
        },
      }

      expect(() => JobPosting.parse(jobWithProsperity)).not.toThrow()
      const parsed = JobPosting.parse(jobWithProsperity)
      expect(parsed.prosperityImpact?.category).toBe('social_connection')
      expect(parsed.prosperityImpact?.sustainabilityFocus).toBe(true)
    })

    it('should reject job posting with missing required fields', () => {
      const incompleteJob = {
        id: 'job-incomplete',
        title: 'Incomplete Job',
        // Missing required fields like description, employmentType, etc.
      }

      expect(() => JobPosting.parse(incompleteJob)).toThrow()
    })

    it('should reject job posting with invalid enum values', () => {
      const invalidJob = {
        id: 'job-invalid',
        title: 'Invalid Job',
        slug: 'invalid-job',
        description: 'Invalid job posting',
        employmentType: 'invalid_type', // Invalid enum value
        experienceLevel: 'senior',
        category: 'technology',
        workArrangement: 'hybrid',
        company: {
          id: 'company-invalid',
          name: 'Invalid Corp',
        },
        location: {
          country: 'United States',
        },
        requirements: [],
        responsibilities: [],
        benefits: [],
        applicationMethod: 'internal',
        applicationDeadline: {
          type: 'rolling',
        },
        status: 'active',
        tags: [],
        appId: 'app-invalid',
        postedBy: 'user-invalid',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      }

      expect(() => JobPosting.parse(invalidJob)).toThrow()
    })
  })

  describe('Type inference', () => {
    it('should properly infer TypeScript types', () => {
      const employmentType: EmploymentTypeType = 'full_time'
      const experienceLevel: ExperienceLevelType = 'senior'
      const jobStatus: JobStatusType = 'active'
      const salaryPeriod: SalaryPeriodType = 'annually'
      const workArrangement: WorkArrangementType = 'hybrid'
      const jobCategory: JobCategoryType = 'technology'
      const applicationMethod: ApplicationMethodType = 'internal'

      // These should compile without errors
      expect(employmentType).toBe('full_time')
      expect(experienceLevel).toBe('senior')
      expect(jobStatus).toBe('active')
      expect(salaryPeriod).toBe('annually')
      expect(workArrangement).toBe('hybrid')
      expect(jobCategory).toBe('technology')
      expect(applicationMethod).toBe('internal')
    })

    it('should infer complex object types', () => {
      const requirement: JobRequirementType = {
        type: 'skill',
        name: 'TypeScript',
        required: true,
      }

      const benefit: JobBenefitType = {
        type: 'health_insurance',
        name: 'Health Coverage',
      }

      const salaryInfo: SalaryInfoType = {
        period: 'annually',
        min: 80000,
        max: 120000,
        currency: 'USD',
        isNegotiable: true,
        includesBenefits: false,
        equityOffered: false,
        performanceBonus: false,
        displaySalary: true,
      }

      expect(requirement.type).toBe('skill')
      expect(benefit.type).toBe('health_insurance')
      expect(salaryInfo.period).toBe('annually')
    })
  })
})