import { z } from 'zod';

/**
 * Project Types
 */
export const ProjectType = z.enum([
  'fixed_price',
  'hourly',
  'retainer',
  'milestone',
  'contest',
  'equity',
  'revenue_share',
]);

export type ProjectTypeType = z.infer<typeof ProjectType>;

/**
 * Project Status
 */
export const ProjectStatus = z.enum([
  'draft',
  'open',
  'in_progress',
  'review',
  'revision',
  'completed',
  'cancelled',
  'disputed',
  'closed',
]);

export type ProjectStatusType = z.infer<typeof ProjectStatus>;

/**
 * Project Duration
 */
export const ProjectDuration = z.enum([
  'less_than_week',
  'one_to_four_weeks',
  'one_to_three_months',
  'three_to_six_months',
  'six_months_plus',
  'ongoing',
]);

export type ProjectDurationType = z.infer<typeof ProjectDuration>;

/**
 * Experience Level Required
 */
export const RequiredExperience = z.enum([
  'entry',
  'intermediate',
  'expert',
  'any',
]);

export type RequiredExperienceType = z.infer<typeof RequiredExperience>;

/**
 * Proposal Status
 */
export const ProposalStatus = z.enum([
  'draft',
  'submitted',
  'shortlisted',
  'interviewed',
  'accepted',
  'rejected',
  'withdrawn',
]);

export type ProposalStatusType = z.infer<typeof ProposalStatus>;

/**
 * Contract Status
 */
export const ContractStatus = z.enum([
  'pending',
  'active',
  'paused',
  'completed',
  'cancelled',
  'disputed',
]);

export type ContractStatusType = z.infer<typeof ContractStatus>;

/**
 * Milestone Status
 */
export const MilestoneStatus = z.enum([
  'pending',
  'in_progress',
  'submitted',
  'approved',
  'revision_requested',
  'disputed',
  'paid',
]);

export type MilestoneStatusType = z.infer<typeof MilestoneStatus>;

/**
 * Payment Status
 */
export const PaymentStatus = z.enum([
  'pending',
  'processing',
  'completed',
  'failed',
  'refunded',
  'disputed',
]);

export type PaymentStatusType = z.infer<typeof PaymentStatus>;

/**
 * Project Budget
 */
export const ProjectBudget = z.object({
  type: ProjectType,
  currency: z.string().default('USD'),
  
  // Fixed price projects
  fixedAmount: z.number().optional(),
  
  // Hourly projects
  hourlyRate: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    preferred: z.number().optional(),
  }).optional(),
  estimatedHours: z.number().optional(),
  
  // Retainer projects
  retainerAmount: z.number().optional(),
  retainerPeriod: z.enum(['weekly', 'monthly', 'quarterly']).optional(),
  
  // General
  isNegotiable: z.boolean().default(true),
  includesPlatformFee: z.boolean().default(false),
});

export type ProjectBudgetType = z.infer<typeof ProjectBudget>;

/**
 * Project Milestone
 */
export const ProjectMilestone = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  amount: z.number(),
  dueDate: z.date().optional(),
  status: MilestoneStatus,
  order: z.number(),
  
  // Deliverables
  deliverables: z.array(z.string()),
  submittedWork: z.array(z.object({
    url: z.string().url(),
    description: z.string(),
    submittedAt: z.date(),
  })).optional(),
  
  // Review
  feedback: z.string().optional(),
  approvedAt: z.date().optional(),
  paidAt: z.date().optional(),
  
  // Metadata
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ProjectMilestoneType = z.infer<typeof ProjectMilestone>;

/**
 * Project Skill Requirement
 */
export const SkillRequirement = z.object({
  skill: z.string(),
  level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
  required: z.boolean().default(true),
  yearsExperience: z.number().optional(),
});

export type SkillRequirementType = z.infer<typeof SkillRequirement>;

/**
 * Project Attachment
 */
export const ProjectAttachment = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string().url(),
  type: z.enum(['reference', 'brief', 'asset', 'example', 'specification']),
  mimeType: z.string(),
  size: z.number(),
  uploadedAt: z.date(),
  description: z.string().optional(),
});

export type ProjectAttachmentType = z.infer<typeof ProjectAttachment>;

/**
 * Client Information
 */
export const ClientInfo = z.object({
  id: z.string(),
  name: z.string(),
  company: z.string().optional(),
  avatar: z.string().url().optional(),
  location: z.string().optional(),
  timezone: z.string().optional(),
  
  // Verification
  isVerified: z.boolean().default(false),
  paymentVerified: z.boolean().default(false),
  
  // Stats
  totalSpent: z.number().default(0),
  projectsPosted: z.number().default(0),
  hireRate: z.number().default(0),
  averageRating: z.number().default(0),
  
  // Preferences
  preferredCommunication: z.array(z.enum(['email', 'chat', 'video', 'phone'])).optional(),
  workingHours: z.string().optional(),
  responseTime: z.enum(['immediate', 'within_hour', 'within_day', 'flexible']).optional(),
});

export type ClientInfoType = z.infer<typeof ClientInfo>;

/**
 * Main Project Posting Schema
 */
export const ProjectPosting = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  description: z.string(),
  
  // Project Details
  type: ProjectType,
  duration: ProjectDuration,
  requiredExperience: RequiredExperience,
  category: z.string(),
  subcategory: z.string().optional(),
  
  // Budget
  budget: ProjectBudget,
  
  // Requirements
  skillsRequired: z.array(SkillRequirement),
  responsibilities: z.array(z.string()),
  deliverables: z.array(z.string()),
  
  // Client Information
  client: ClientInfo,
  
  // Location and Remote Work
  location: z.string().optional(),
  isRemote: z.boolean().default(true),
  timezoneRequirement: z.string().optional(),
  
  // Application Process
  proposalDeadline: z.date().optional(),
  maxProposals: z.number().optional(),
  connectsRequired: z.number().default(1), // Platform connects/credits required
  
  // Screening
  screeningQuestions: z.array(z.object({
    id: z.string(),
    question: z.string(),
    required: z.boolean().default(false),
  })).optional(),
  
  // Attachments
  attachments: z.array(ProjectAttachment).optional(),
  
  // Status and Visibility
  status: ProjectStatus,
  isVisible: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isUrgent: z.boolean().default(false),
  
  // Metadata
  tags: z.array(z.string()),
  
  // Platform Context
  appId: z.string(),
  organizationId: z.string().optional(),
  
  // Analytics
  views: z.number().default(0),
  proposals: z.number().default(0),
  hired: z.number().default(0),
  
  // Timestamps
  createdAt: z.date(),
  updatedAt: z.date(),
  publishedAt: z.date().optional(),
  closedAt: z.date().optional(),
  
  // Milestones (for milestone-based projects)
  milestones: z.array(ProjectMilestone).optional(),
  
  // Custom Fields
  customFields: z.record(z.any()).optional(),
  
  // Metadata
  metadata: z.record(z.any()).optional(),
});

export type ProjectPostingType = z.infer<typeof ProjectPosting>;

/**
 * Project Proposal Schema
 */
export const ProjectProposal = z.object({
  id: z.string(),
  projectId: z.string(),
  freelancerId: z.string(),
  
  // Proposal Content
  coverLetter: z.string(),
  proposedBudget: z.object({
    amount: z.number(),
    currency: z.string().default('USD'),
    type: ProjectType,
    justification: z.string().optional(),
  }),
  estimatedDelivery: z.date(),
  
  // Proposed Milestones (if applicable)
  proposedMilestones: z.array(z.object({
    title: z.string(),
    description: z.string(),
    amount: z.number(),
    dueDate: z.date(),
    deliverables: z.array(z.string()),
  })).optional(),
  
  // Experience and Portfolio
  relevantExperience: z.string().optional(),
  portfolioItems: z.array(z.object({
    title: z.string(),
    url: z.string().url(),
    description: z.string(),
    thumbnail: z.string().url().optional(),
  })).optional(),
  
  // Screening Responses
  screeningResponses: z.array(z.object({
    questionId: z.string(),
    response: z.string(),
  })).optional(),
  
  // Attachments
  attachments: z.array(ProjectAttachment).optional(),
  
  // Status
  status: ProposalStatus,
  
  // Freelancer Details at Time of Proposal
  freelancerSnapshot: z.object({
    name: z.string(),
    avatar: z.string().url().optional(),
    title: z.string(),
    hourlyRate: z.number().optional(),
    rating: z.number().optional(),
    completedProjects: z.number(),
    successRate: z.number(),
    responseTime: z.string(),
    skills: z.array(z.string()),
  }),
  
  // Client Interaction
  clientViewed: z.boolean().default(false),
  clientViewedAt: z.date().optional(),
  clientResponse: z.string().optional(),
  clientRating: z.number().min(1).max(5).optional(),
  
  // Platform Metrics
  connectsSpent: z.number().default(1),
  
  // Timestamps
  createdAt: z.date(),
  updatedAt: z.date(),
  submittedAt: z.date(),
  respondedAt: z.date().optional(),
  
  // Metadata
  metadata: z.record(z.any()).optional(),
});

export type ProjectProposalType = z.infer<typeof ProjectProposal>;

/**
 * Project Contract Schema
 */
export const ProjectContract = z.object({
  id: z.string(),
  projectId: z.string(),
  proposalId: z.string(),
  clientId: z.string(),
  freelancerId: z.string(),
  
  // Contract Terms
  title: z.string(),
  description: z.string(),
  agreedBudget: z.object({
    amount: z.number(),
    currency: z.string().default('USD'),
    type: ProjectType,
  }),
  startDate: z.date(),
  endDate: z.date().optional(),
  
  // Milestones
  milestones: z.array(ProjectMilestone),
  
  // Payment Terms
  paymentTerms: z.object({
    method: z.enum(['milestone', 'hourly', 'weekly', 'monthly']),
    escrowRequired: z.boolean().default(true),
    paymentSchedule: z.string().optional(),
    lateFeePercentage: z.number().optional(),
  }),
  
  // Work Terms
  workTerms: z.object({
    hoursPerWeek: z.number().optional(),
    workingHours: z.string().optional(),
    timezone: z.string().optional(),
    communicationFrequency: z.string().optional(),
    reportingSchedule: z.string().optional(),
  }),
  
  // Legal Terms
  intellectualProperty: z.string().optional(),
  confidentialityClause: z.boolean().default(false),
  terminationClause: z.string().optional(),
  disputeResolution: z.string().optional(),
  
  // Status
  status: ContractStatus,
  
  // Signatures
  clientSigned: z.boolean().default(false),
  freelancerSigned: z.boolean().default(false),
  clientSignedAt: z.date().optional(),
  freelancerSignedAt: z.date().optional(),
  
  // Progress Tracking
  hoursWorked: z.number().default(0),
  amountPaid: z.number().default(0),
  progressPercentage: z.number().default(0),
  
  // Reviews
  clientReview: z.object({
    rating: z.number().min(1).max(5),
    feedback: z.string(),
    isPublic: z.boolean().default(true),
    createdAt: z.date(),
  }).optional(),
  freelancerReview: z.object({
    rating: z.number().min(1).max(5),
    feedback: z.string(),
    isPublic: z.boolean().default(true),
    createdAt: z.date(),
  }).optional(),
  
  // Timestamps
  createdAt: z.date(),
  updatedAt: z.date(),
  signedAt: z.date().optional(),
  completedAt: z.date().optional(),
  
  // Metadata
  metadata: z.record(z.any()).optional(),
});

export type ProjectContractType = z.infer<typeof ProjectContract>;

/**
 * Time Tracking Entry
 */
export const TimeEntry = z.object({
  id: z.string(),
  contractId: z.string(),
  date: z.date(),
  startTime: z.date(),
  endTime: z.date().optional(),
  duration: z.number(), // in minutes
  description: z.string(),
  
  // Screenshots (if required)
  screenshots: z.array(z.object({
    url: z.string().url(),
    timestamp: z.date(),
  })).optional(),
  
  // Activity Level (if tracked)
  activityLevel: z.number().min(0).max(100).optional(),
  
  // Approval
  isApproved: z.boolean().default(false),
  approvedBy: z.string().optional(),
  approvedAt: z.date().optional(),
  
  // Billing
  hourlyRate: z.number(),
  amount: z.number(),
  isBilled: z.boolean().default(false),
  
  // Metadata
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type TimeEntryType = z.infer<typeof TimeEntry>;

/**
 * Payment Transaction
 */
export const PaymentTransaction = z.object({
  id: z.string(),
  contractId: z.string(),
  milestoneId: z.string().optional(),
  
  // Transaction Details
  type: z.enum(['milestone', 'hourly', 'bonus', 'refund', 'dispute_settlement']),
  amount: z.number(),
  currency: z.string().default('USD'),
  
  // Platform Fees
  platformFeePercentage: z.number(),
  platformFeeAmount: z.number(),
  freelancerAmount: z.number(),
  
  // Payment Method
  paymentMethod: z.enum(['escrow', 'direct', 'bank_transfer', 'paypal', 'stripe']),
  
  // Status
  status: PaymentStatus,
  
  // References
  transactionId: z.string().optional(), // External payment processor ID
  escrowId: z.string().optional(),
  
  // Timestamps
  createdAt: z.date(),
  processedAt: z.date().optional(),
  completedAt: z.date().optional(),
  
  // Metadata
  metadata: z.record(z.any()).optional(),
});

export type PaymentTransactionType = z.infer<typeof PaymentTransaction>;