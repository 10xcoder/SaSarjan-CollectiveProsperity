import { z } from 'zod';

/**
 * Employment Types
 */
export const EmploymentType = z.enum([
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
]);

export type EmploymentTypeType = z.infer<typeof EmploymentType>;

/**
 * Experience Levels
 */
export const ExperienceLevel = z.enum([
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
]);

export type ExperienceLevelType = z.infer<typeof ExperienceLevel>;

/**
 * Job Status
 */
export const JobStatus = z.enum([
  'draft',
  'active',
  'paused',
  'closed',
  'filled',
  'expired',
  'cancelled',
]);

export type JobStatusType = z.infer<typeof JobStatus>;

/**
 * Salary Period
 */
export const SalaryPeriod = z.enum([
  'hourly',
  'daily',
  'weekly',
  'monthly',
  'annually',
  'project',
]);

export type SalaryPeriodType = z.infer<typeof SalaryPeriod>;

/**
 * Work Arrangement
 */
export const WorkArrangement = z.enum([
  'on_site',
  'remote',
  'hybrid',
  'flexible',
]);

export type WorkArrangementType = z.infer<typeof WorkArrangement>;

/**
 * Job Category (aligned with SaSarjan prosperity categories)
 */
export const JobCategory = z.enum([
  'technology',
  'healthcare',
  'education',
  'finance',
  'marketing',
  'design',
  'sales',
  'operations',
  'human_resources',
  'customer_service',
  'research',
  'consulting',
  'manufacturing',
  'agriculture',
  'construction',
  'transportation',
  'hospitality',
  'retail',
  'media',
  'legal',
  'nonprofit',
  'government',
  'environmental',
  'social_impact',
  'community_development',
  'cultural_preservation',
  'spiritual_growth',
  'general',
]);

export type JobCategoryType = z.infer<typeof JobCategory>;

/**
 * Application Method
 */
export const ApplicationMethod = z.enum([
  'internal', // Apply through the platform
  'external', // Apply through external URL
  'email',    // Apply via email
  'both',     // Both internal and external options
]);

export type ApplicationMethodType = z.infer<typeof ApplicationMethod>;

/**
 * Job Requirements
 */
export const JobRequirement = z.object({
  type: z.enum(['skill', 'education', 'experience', 'certification', 'language', 'other']),
  name: z.string(),
  description: z.string().optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
  required: z.boolean().default(true),
  yearsExperience: z.number().optional(),
});

export type JobRequirementType = z.infer<typeof JobRequirement>;

/**
 * Job Benefits
 */
export const JobBenefit = z.object({
  type: z.enum([
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
  ]),
  name: z.string(),
  description: z.string().optional(),
  value: z.string().optional(), // e.g., "$500/month", "100% coverage"
});

export type JobBenefitType = z.infer<typeof JobBenefit>;

/**
 * Salary Information
 */
export const SalaryInfo = z.object({
  currency: z.string().default('USD'),
  period: SalaryPeriod,
  min: z.number().optional(),
  max: z.number().optional(),
  exact: z.number().optional(),
  isNegotiable: z.boolean().default(true),
  includesBenefits: z.boolean().default(false),
  equityOffered: z.boolean().default(false),
  performanceBonus: z.boolean().default(false),
  displaySalary: z.boolean().default(true), // Whether to show salary publicly
});

export type SalaryInfoType = z.infer<typeof SalaryInfo>;

/**
 * Company Information (embedded in job posting)
 */
export const CompanyInfo = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  website: z.string().url().optional(),
  logo: z.string().url().optional(),
  size: z.enum(['startup', '1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']).optional(),
  industry: z.string().optional(),
  founded: z.number().optional(),
  location: z.string().optional(),
  culture: z.array(z.string()).optional(),
  techStack: z.array(z.string()).optional(),
  socialLinks: z.object({
    linkedin: z.string().url().optional(),
    twitter: z.string().url().optional(),
    facebook: z.string().url().optional(),
    instagram: z.string().url().optional(),
    github: z.string().url().optional(),
  }).optional(),
});

export type CompanyInfoType = z.infer<typeof CompanyInfo>;

/**
 * Job Location
 */
export const JobLocation = z.object({
  id: z.string().optional(),
  country: z.string(),
  state: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  postalCode: z.string().optional(),
  coordinates: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }).optional(),
  timezone: z.string().optional(),
  isRemote: z.boolean().default(false),
  remoteRestrictions: z.array(z.string()).optional(), // e.g., ["US", "Canada", "Europe"]
});

export type JobLocationType = z.infer<typeof JobLocation>;

/**
 * Application Deadline
 */
export const ApplicationDeadline = z.object({
  date: z.date().optional(),
  type: z.enum(['date', 'rolling', 'until_filled']).default('rolling'),
  timezone: z.string().optional(),
});

export type ApplicationDeadlineType = z.infer<typeof ApplicationDeadline>;

/**
 * Job Metrics
 */
export const JobMetrics = z.object({
  views: z.number().default(0),
  applications: z.number().default(0),
  bookmarks: z.number().default(0),
  shares: z.number().default(0),
  clickThroughRate: z.number().default(0),
  applicationRate: z.number().default(0),
  qualityScore: z.number().default(0),
  lastUpdated: z.date(),
});

export type JobMetricsType = z.infer<typeof JobMetrics>;

/**
 * Screening Questions
 */
export const ScreeningQuestion = z.object({
  id: z.string(),
  question: z.string(),
  type: z.enum(['text', 'multiple_choice', 'yes_no', 'scale', 'file_upload']),
  required: z.boolean().default(false),
  options: z.array(z.string()).optional(), // For multiple choice
  maxLength: z.number().optional(), // For text responses
  fileTypes: z.array(z.string()).optional(), // For file uploads
  order: z.number(),
});

export type ScreeningQuestionType = z.infer<typeof ScreeningQuestion>;

/**
 * Main Job Posting Schema
 */
export const JobPosting = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  description: z.string(),
  shortDescription: z.string().optional(),
  
  // Job Details
  employmentType: EmploymentType,
  experienceLevel: ExperienceLevel,
  category: JobCategory,
  workArrangement: WorkArrangement,
  
  // Company Information
  company: CompanyInfo,
  department: z.string().optional(),
  reportingTo: z.string().optional(),
  teamSize: z.number().optional(),
  
  // Location
  location: JobLocation,
  
  // Requirements and Qualifications
  requirements: z.array(JobRequirement),
  responsibilities: z.array(z.string()),
  preferredQualifications: z.array(z.string()).optional(),
  
  // Compensation and Benefits
  salary: SalaryInfo.optional(),
  benefits: z.array(JobBenefit),
  
  // Application Process
  applicationMethod: ApplicationMethod,
  applicationUrl: z.string().url().optional(),
  applicationEmail: z.string().email().optional(),
  applicationDeadline: ApplicationDeadline,
  screeningQuestions: z.array(ScreeningQuestion).optional(),
  
  // Status and Visibility
  status: JobStatus,
  isVisible: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isUrgent: z.boolean().default(false),
  
  // Metadata
  tags: z.array(z.string()),
  keywords: z.array(z.string()).optional(),
  
  // App/Platform Context
  appId: z.string(),
  organizationId: z.string().optional(),
  
  // Authorship and Management
  postedBy: z.string(),
  managedBy: z.array(z.string()).optional(), // HR managers who can manage this posting
  
  // Tracking
  sourceChannel: z.string().optional(), // Where this job was originally posted
  externalId: z.string().optional(), // ID from external job board
  
  // Timestamps
  createdAt: z.date(),
  updatedAt: z.date(),
  publishedAt: z.date().optional(),
  closedAt: z.date().optional(),
  
  // Analytics
  metrics: JobMetrics.optional(),
  
  // SEO
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.array(z.string()).optional(),
  
  // Diversity and Inclusion
  diversityInfo: z.object({
    equalOpportunityEmployer: z.boolean().default(false),
    diversityStatement: z.string().optional(),
    accommodationsAvailable: z.boolean().default(false),
    lgbtqFriendly: z.boolean().default(false),
    femaleLeadershipPercentage: z.number().optional(),
    diversityMeasures: z.array(z.string()).optional(),
  }).optional(),
  
  // Remote Work Details
  remoteDetails: z.object({
    fullyRemote: z.boolean().default(false),
    remotePercentage: z.number().optional(), // 0-100
    officeVisitRequirement: z.string().optional(),
    timeZoneRequirement: z.string().optional(),
    equipmentProvided: z.boolean().default(false),
    internetStipend: z.boolean().default(false),
  }).optional(),
  
  // SaSarjan-Specific Fields
  prosperityImpact: z.object({
    category: z.enum([
      'economic_empowerment',
      'social_connection',
      'environmental_stewardship',
      'cultural_preservation',
      'knowledge_commons',
      'health_wellbeing',
      'governance_participation',
      'spiritual_growth',
    ]).optional(),
    impactDescription: z.string().optional(),
    communityBenefit: z.string().optional(),
    sustainabilityFocus: z.boolean().default(false),
  }).optional(),
  
  // Custom Fields
  customFields: z.record(z.any()).optional(),
  
  // Metadata
  metadata: z.record(z.any()).optional(),
});

export type JobPostingType = z.infer<typeof JobPosting>;